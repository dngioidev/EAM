import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

export interface OrderQuery {
  status?: OrderStatus;
  from?: string;    // ISO date
  to?: string;      // ISO date
  cashierId?: string;
  page?: number;
  limit?: number;
}

const NON_CASHIER_ROLES = ['admin', 'store-manager', 'accountant', 'viewer'];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(storeId: string | null, cashierId: string): Promise<Order> {
    if (!storeId) throw new ForbiddenException('Store assignment required to create orders');

    const orderNumber = await this.generateOrderNumber(storeId);

    const order = this.orderRepo.create({
      orderNumber,
      status: 'pending',
      totalVnd: 0,
      paymentMethod: null,
      storeId,
      cashierId,
    });

    const saved = await this.orderRepo.save(order);
    return this.loadWithItems(saved.id, storeId);
  }

  // ─── Add / Update / Remove Item ────────────────────────────────────────────

  async addItem(
    orderId: string,
    dto: AddOrderItemDto,
    storeId: string | null,
    callerId: string,
  ): Promise<Order> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const order = await this.findOrderForMutation(orderId, storeId, callerId);

    // BR-ORDER-12: cannot modify non-pending order
    if (order.status !== 'pending') {
      throw new ConflictException('Cannot modify a non-pending order');
    }

    // BR-ORDER-11: quantity 0 → remove item
    if (dto.quantity === 0) {
      await this.itemRepo.delete({ orderId, productId: dto.productId });
      return this.recalcAndSave(order, storeId);
    }

    // Validate product belongs to store and is active
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, storeId, isActive: true },
    });
    if (!product) {
      // Check if it exists but is deactivated
      const exists = await this.productRepo.findOne({ where: { id: dto.productId, storeId } });
      if (exists && !exists.isActive) {
        throw new BadRequestException('Product is not active');
      }
      throw new NotFoundException('Product not found in your store');
    }

    // BR-ORDER-10: upsert — same productId → update quantity
    let item = await this.itemRepo.findOne({ where: { orderId, productId: dto.productId } });

    if (item) {
      item.quantity = dto.quantity;
      item.lineTotalVnd = item.unitPriceVnd * dto.quantity;
    } else {
      item = this.itemRepo.create({
        orderId,
        productId: dto.productId,
        productName: product.name,   // BR-ORDER-01: snapshot
        sku: product.sku,            // BR-ORDER-01: snapshot
        quantity: dto.quantity,
        unitPriceVnd: product.priceVnd,     // BR-ORDER-01: snapshot
        taxRatePercent: product.taxRatePercent, // BR-ORDER-01: snapshot
        lineTotalVnd: product.priceVnd * dto.quantity,
      });
    }

    await this.itemRepo.save(item);
    return this.recalcAndSave(order, storeId);
  }

  // ─── Confirm Payment ───────────────────────────────────────────────────────

  async confirmPayment(
    orderId: string,
    dto: ConfirmPaymentDto,
    storeId: string | null,
    callerId: string,
    callerRole: string,
  ): Promise<Order> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const order = await this.loadWithItems(orderId, storeId);

    // BR-ORDER-04: only order's cashier or store-manager
    if (callerRole === 'cashier' && order.cashierId !== callerId) {
      throw new ForbiddenException('Only the order cashier or store-manager may confirm payment');
    }

    if (order.status !== 'pending') {
      throw new ConflictException('Invalid state transition — order must be pending');
    }

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('Order has no items');
    }

    order.status = 'processing';
    order.paymentMethod = dto.paymentMethod;
    const saved = await this.orderRepo.save(order);

    // Emit event for invoice module (decoupled — BR-ORDER-06)
    this.eventEmitter.emit('order.processing', { orderId: saved.id, storeId });

    return this.loadWithItems(saved.id, storeId);
  }

  // ─── Cancel ────────────────────────────────────────────────────────────────

  async cancel(
    orderId: string,
    storeId: string | null,
    callerId: string,
    callerRole: string,
  ): Promise<Order> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const order = await this.loadWithItems(orderId, storeId);

    // Only cashier of the order or store-manager
    if (callerRole === 'cashier' && order.cashierId !== callerId) {
      throw new ForbiddenException('Only the order cashier or store-manager may cancel this order');
    }

    const cancellable: OrderStatus[] = ['pending'];
    if (!cancellable.includes(order.status)) {
      throw new ConflictException('Cannot cancel order in current state');
    }

    order.status = 'cancelled';
    await this.orderRepo.save(order);
    return this.loadWithItems(orderId, storeId);
  }

  // ─── List ───────────────────────────────────────────────────────────────────

  async findAll(
    storeId: string | null,
    callerId: string,
    callerRole: string,
    query: OrderQuery,
  ): Promise<{ items: Order[]; total: number; page: number; limit: number }> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.store_id = :storeId', { storeId })
      .andWhere('order.deleted_at IS NULL')
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    // BR-ORDER-08: cashier sees own orders only
    if (callerRole === 'cashier') {
      qb.andWhere('order.cashier_id = :callerId', { callerId });
    } else if (query.cashierId) {
      qb.andWhere('order.cashier_id = :cashierId', { cashierId: query.cashierId });
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.from) {
      qb.andWhere('order.created_at >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('order.created_at <= :to', { to: query.to + 'T23:59:59Z' });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // ─── Find One ───────────────────────────────────────────────────────────────

  async findOne(
    orderId: string,
    storeId: string | null,
    callerId: string,
    callerRole: string,
  ): Promise<Order> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const order = await this.loadWithItems(orderId, storeId);

    // BR-ORDER-08: cashier can only view their own order
    if (callerRole === 'cashier' && order.cashierId !== callerId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // ─── Transition to Completed (called by Invoice module) ───────────────────

  async markCompleted(orderId: string): Promise<void> {
    await this.orderRepo.update({ id: orderId }, { status: 'completed' });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async loadWithItems(orderId: string, storeId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async findOrderForMutation(
    orderId: string,
    storeId: string,
    _callerId: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, storeId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async recalcAndSave(order: Order, storeId: string): Promise<Order> {
    const items = await this.itemRepo.find({ where: { orderId: order.id } });
    // BR-ORDER-02: totalVnd = sum of lineTotals
    order.totalVnd = items.reduce((sum, item) => sum + item.lineTotalVnd, 0);
    await this.orderRepo.save(order);
    return this.loadWithItems(order.id, storeId);
  }

  // BR-ORDER-03: orderNumber format {storePrefix}-{YYYYMMDD}-{seq:04d}
  private async generateOrderNumber(storeId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = storeId.slice(0, 4).toUpperCase();

    // Count existing orders for this store today to build sequence
    const count = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.store_id = :storeId', { storeId })
      .andWhere("DATE(o.created_at) = CURRENT_DATE")
      .getCount();

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${dateStr}-${seq}`;
  }
}
