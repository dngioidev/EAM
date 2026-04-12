import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Invoice, InvoiceLine, VatSubtotal } from './entities/invoice.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrdersService } from '../orders/orders.service';

export interface ListInvoicesQuery {
  from?: string;
  to?: string;
  status?: 'issued' | 'cancelled';
  page?: number;
  limit?: number;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceSequence)
    private readonly seqRepo: Repository<InvoiceSequence>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
  ) {}

  // ─── Event listener: order.processing → generate invoice ──────────────────

  @OnEvent('order.processing', { async: true })
  async handleOrderProcessing(payload: { orderId: string; storeId: string }): Promise<void> {
    const MAX_RETRIES = 3;
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        await this.generateInvoice(payload.orderId, payload.storeId);
        return;
      } catch (err) {
        attempt++;
        this.logger.error(
          `Invoice generation attempt ${attempt} failed for order ${payload.orderId}: ${(err as Error).message}`,
        );
        if (attempt >= MAX_RETRIES) {
          this.logger.error(
            `Invoice generation permanently failed for order ${payload.orderId} after ${MAX_RETRIES} attempts`,
          );
        }
      }
    }
  }

  // ─── Core invoice generation ───────────────────────────────────────────────

  async generateInvoice(orderId: string, storeId: string): Promise<Invoice> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId, storeId },
      });
      if (!order || order.status !== 'processing') {
        throw new Error(`Order ${orderId} is not in processing state`);
      }

      const items = await manager.find(OrderItem, { where: { orderId } });

      // Build invoice lines (BR-INV-03: snapshot from OrderItem)
      const lines: InvoiceLine[] = items.map((item) => ({
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPriceVnd: item.unitPriceVnd,
        taxRatePercent: item.taxRatePercent,
        lineTotalVnd: item.lineTotalVnd,
      }));

      // BR-INV-04/05: VAT subtotals grouped by rate, floor rounding
      const vatSubtotals = this.calculateVatSubtotals(lines);
      const totalVnd = lines.reduce((sum, l) => sum + l.lineTotalVnd, 0);

      // BR-INV-02: gap-free per-store per-year sequence (pessimistic lock)
      const invoiceNumber = await this.nextInvoiceNumber(storeId, manager);

      const invoice = manager.create(Invoice, {
        invoiceNumber,
        orderId,
        storeId,
        status: 'draft',
        lines,
        vatSubtotals,
        totalVnd,
        issuedAt: null,
      });

      const saved = await manager.save(Invoice, invoice);

      // Immediately transition to issued
      saved.status = 'issued';
      saved.issuedAt = new Date();
      await manager.save(Invoice, saved);

      // BR-ORDER-06: only after invoice is issued does order become 'completed'
      await manager.update(Order, { id: orderId }, { status: 'completed' });

      return saved;
    });
  }

  // ─── Get invoice for an order (ORDER-07) ──────────────────────────────────

  async findByOrder(orderId: string, storeId: string | null): Promise<Invoice> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    // verify order belongs to store
    const order = await this.orderRepo.findOne({ where: { id: orderId, storeId } });
    if (!order) throw new NotFoundException('Order not found');

    const invoice = await this.invoiceRepo.findOne({ where: { orderId, storeId } });
    if (!invoice) throw new NotFoundException('Invoice not yet issued');

    return invoice;
  }

  // ─── List invoices (INV-01) ───────────────────────────────────────────────

  async findAll(
    storeId: string | null,
    query: ListInvoicesQuery,
  ): Promise<{ items: Invoice[]; total: number; page: number; limit: number }> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.store_id = :storeId', { storeId })
      .orderBy('inv.issued_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) {
      qb.andWhere('inv.status = :status', { status: query.status });
    }

    if (query.from) {
      qb.andWhere('inv.issued_at >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('inv.issued_at <= :to', { to: query.to + 'T23:59:59Z' });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // ─── Get single invoice (INV-02) ──────────────────────────────────────────

  async findOne(id: string, storeId: string | null): Promise<Invoice> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const invoice = await this.invoiceRepo.findOne({ where: { id, storeId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // ─── Cancel invoice (INV-03) ──────────────────────────────────────────────

  async cancel(id: string, storeId: string | null): Promise<Invoice> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const invoice = await this.invoiceRepo.findOne({ where: { id, storeId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    // Idempotent
    if (invoice.status === 'cancelled') return invoice;

    // Validate order is refunded
    const order = await this.orderRepo.findOne({ where: { id: invoice.orderId } });
    if (!order || order.status !== 'refunded') {
      throw new ConflictException('Order must be refunded before cancelling invoice');
    }

    // BR-INV-01: invoice number is NOT changed
    invoice.status = 'cancelled';
    return this.invoiceRepo.save(invoice);
  }

  // ─── VAT calculation (BR-INV-04, BR-INV-05) ───────────────────────────────

  calculateVatSubtotals(lines: InvoiceLine[]): VatSubtotal[] {
    const grouped = new Map<number, number>();

    for (const line of lines) {
      const current = grouped.get(line.taxRatePercent) ?? 0;
      grouped.set(line.taxRatePercent, current + line.lineTotalVnd);
    }

    const subtotals: VatSubtotal[] = [];
    for (const [rate, taxableVnd] of grouped.entries()) {
      // BR-INV-05: Math.floor — integer arithmetic only
      const vatVnd = Math.floor((taxableVnd * rate) / 100);
      subtotals.push({ rate, taxableVnd, vatVnd });
    }

    return subtotals.sort((a, b) => a.rate - b.rate);
  }

  // ─── Per-store per-year sequence (BR-INV-02) ──────────────────────────────

  private async nextInvoiceNumber(
    storeId: string,
    manager: import('typeorm').EntityManager,
  ): Promise<string> {
    const year = new Date().getFullYear();

    // Upsert sequence row, then lock it for update
    await manager.query(
      `INSERT INTO invoice_sequences (store_id, year, last_sequence)
       VALUES ($1, $2, 0)
       ON CONFLICT (store_id, year) DO NOTHING`,
      [storeId, year],
    );

    const rows = await manager.query<{ last_sequence: number }[]>(
      `SELECT last_sequence FROM invoice_sequences
       WHERE store_id = $1 AND year = $2
       FOR UPDATE`,
      [storeId, year],
    );

    const nextSeq = rows[0].last_sequence + 1;

    await manager.query(
      `UPDATE invoice_sequences SET last_sequence = $1
       WHERE store_id = $2 AND year = $3`,
      [nextSeq, storeId, year],
    );

    // Format: 'YYYY/000001'
    return `${year}/${String(nextSeq).padStart(6, '0')}`;
  }
}
