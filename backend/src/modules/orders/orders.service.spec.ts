import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';

const STORE = 'aaaa-0000-0000-0001';
const CASHIER = 'user-0000-0000-0001';
const MANAGER = 'user-0000-0000-0002';
const ORDER_ID = 'ord-uuid-0001';
const PRODUCT_ID = 'prod-uuid-0001';

function makeOrder(override: Partial<Order> = {}): Order {
  return {
    id: ORDER_ID,
    orderNumber: 'AAAA-20260101-0001',
    status: 'pending',
    totalVnd: 0,
    paymentMethod: null,
    storeId: STORE,
    cashierId: CASHIER,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...override,
  } as unknown as Order;
}

function makeProduct(override: Partial<Product> = {}): Product {
  return {
    id: PRODUCT_ID,
    sku: 'SKU-001',
    name: 'Cà phê sữa',
    priceVnd: 30000,
    taxRatePercent: 10,
    isActive: true,
    storeId: STORE,
    ...override,
  } as unknown as Product;
}

function makeItem(override: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'item-uuid-0001',
    orderId: ORDER_ID,
    productId: PRODUCT_ID,
    productName: 'Cà phê sữa',
    sku: 'SKU-001',
    quantity: 2,
    unitPriceVnd: 30000,
    taxRatePercent: 10,
    lineTotalVnd: 60000,
    ...override,
  } as unknown as OrderItem;
}

// Simple QB mock for getCount usage in generateOrderNumber
function makeCountQB(count: number) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(count),
  };
}

describe('OrdersService', () => {
  let service: OrdersService;

  const orderRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const itemRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const productRepo = {
    findOne: jest.fn(),
  };

  const eventEmitter = {
    emit: jest.fn(),
  };

  // DataSource is not actively used by the methods under test (no transaction calls in
  // the paths we're testing), so a minimal stub suffices.
  const dataSource = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: itemRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates an order and returns it with items', async () => {
      const newOrder = makeOrder({ id: ORDER_ID });
      orderRepo.createQueryBuilder.mockReturnValue(makeCountQB(0));
      orderRepo.create.mockReturnValue(newOrder);
      orderRepo.save.mockResolvedValue(newOrder);
      orderRepo.findOne.mockResolvedValue({ ...newOrder, items: [] });

      const result = await service.create(STORE, CASHIER);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('pending');
      expect(result.storeId).toBe(STORE);
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(service.create(null, CASHIER)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── addItem ──────────────────────────────────────────────────────────────

  describe('addItem()', () => {
    it('creates a new item and recalculates total', async () => {
      const order = makeOrder({ status: 'pending', items: [] });
      const product = makeProduct();
      const item = makeItem({ quantity: 2, lineTotalVnd: 60000 });
      const savedOrder = makeOrder({ totalVnd: 60000, items: [item] });

      // findOrderForMutation → findOne (1)
      orderRepo.findOne.mockResolvedValueOnce(order);
      productRepo.findOne.mockResolvedValue(product);
      itemRepo.findOne.mockResolvedValue(null); // new item — does not exist yet
      itemRepo.create.mockReturnValue(item);
      itemRepo.save.mockResolvedValue(item);
      // recalcAndSave: itemRepo.find + orderRepo.save + loadWithItems (findOne #2)
      itemRepo.find.mockResolvedValue([item]);
      orderRepo.save.mockResolvedValue(savedOrder);
      orderRepo.findOne.mockResolvedValueOnce({ ...savedOrder, items: [item] });

      const result = await service.addItem(
        ORDER_ID,
        { productId: PRODUCT_ID, quantity: 2 },
        STORE,
        CASHIER,
      );

      expect(itemRepo.create).toHaveBeenCalledTimes(1);
      expect(result.totalVnd).toBe(60000);
    });

    it('updates quantity when same productId is added again (BR-ORDER-10)', async () => {
      const order = makeOrder({ status: 'pending' });
      const product = makeProduct();
      const existingItem = makeItem({ quantity: 1, lineTotalVnd: 30000 });
      const updatedItem = makeItem({ quantity: 5, lineTotalVnd: 150000 });
      const savedOrder = makeOrder({ totalVnd: 150000, items: [updatedItem] });

      orderRepo.findOne.mockResolvedValueOnce(order);
      productRepo.findOne.mockResolvedValue(product);
      itemRepo.findOne.mockResolvedValue(existingItem); // item exists
      itemRepo.save.mockResolvedValue(updatedItem);
      itemRepo.find.mockResolvedValue([updatedItem]);
      orderRepo.save.mockResolvedValue(savedOrder);
      orderRepo.findOne.mockResolvedValueOnce({ ...savedOrder, items: [updatedItem] });

      const result = await service.addItem(
        ORDER_ID,
        { productId: PRODUCT_ID, quantity: 5 },
        STORE,
        CASHIER,
      );

      expect(itemRepo.create).not.toHaveBeenCalled(); // updated, not created
      expect(result.totalVnd).toBe(150000);
    });

    it('removes item when quantity is 0 (BR-ORDER-11)', async () => {
      const order = makeOrder({ status: 'pending', items: [] });
      const savedOrder = makeOrder({ totalVnd: 0, items: [] });

      orderRepo.findOne.mockResolvedValueOnce(order);
      itemRepo.delete.mockResolvedValue({ affected: 1 });
      itemRepo.find.mockResolvedValue([]);
      orderRepo.save.mockResolvedValue(savedOrder);
      orderRepo.findOne.mockResolvedValueOnce({ ...savedOrder, items: [] });

      const result = await service.addItem(
        ORDER_ID,
        { productId: PRODUCT_ID, quantity: 0 },
        STORE,
        CASHIER,
      );

      expect(itemRepo.delete).toHaveBeenCalledWith({ orderId: ORDER_ID, productId: PRODUCT_ID });
      expect(result.totalVnd).toBe(0);
    });

    it('throws BadRequestException for deactivated product', async () => {
      const order = makeOrder({ status: 'pending' });
      const inactiveProduct = makeProduct({ isActive: false });

      orderRepo.findOne.mockResolvedValueOnce(order);
      productRepo.findOne
        .mockResolvedValueOnce(null) // isActive: true query → not found
        .mockResolvedValueOnce(inactiveProduct); // exists but inactive check

      await expect(
        service.addItem(ORDER_ID, { productId: PRODUCT_ID, quantity: 1 }, STORE, CASHIER),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for product not in store', async () => {
      const order = makeOrder({ status: 'pending' });

      orderRepo.findOne.mockResolvedValueOnce(order);
      productRepo.findOne.mockResolvedValue(null); // not found at all

      await expect(
        service.addItem(ORDER_ID, { productId: 'other-prod', quantity: 1 }, STORE, CASHIER),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when order is not pending (BR-ORDER-12)', async () => {
      const processingOrder = makeOrder({ status: 'processing' });
      orderRepo.findOne.mockResolvedValueOnce(processingOrder);

      await expect(
        service.addItem(ORDER_ID, { productId: PRODUCT_ID, quantity: 1 }, STORE, CASHIER),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(
        service.addItem(ORDER_ID, { productId: PRODUCT_ID, quantity: 1 }, null, CASHIER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── confirmPayment ───────────────────────────────────────────────────────

  describe('confirmPayment()', () => {
    it('transitions pending → processing and emits event', async () => {
      const item = makeItem();
      const order = makeOrder({ status: 'pending', items: [item] });
      const processingOrder = makeOrder({ status: 'processing', items: [item] });

      orderRepo.findOne
        .mockResolvedValueOnce(order)       // loadWithItems (initial load)
        .mockResolvedValueOnce(processingOrder); // loadWithItems (after save)
      orderRepo.save.mockResolvedValue(processingOrder);

      await service.confirmPayment(
        ORDER_ID,
        { paymentMethod: 'cash' },
        STORE,
        CASHIER,
        'cashier',
      );

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.processing', {
        orderId: ORDER_ID,
        storeId: STORE,
      });
    });

    it('throws ConflictException when order is not pending', async () => {
      const order = makeOrder({ status: 'processing', items: [makeItem()] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(
        service.confirmPayment(ORDER_ID, { paymentMethod: 'cash' }, STORE, CASHIER, 'cashier'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException when order has no items', async () => {
      const order = makeOrder({ status: 'pending', items: [] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(
        service.confirmPayment(ORDER_ID, { paymentMethod: 'cash' }, STORE, CASHIER, 'cashier'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when cashier confirms another cashier order', async () => {
      const item = makeItem();
      const order = makeOrder({ status: 'pending', cashierId: 'other-cashier', items: [item] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(
        service.confirmPayment(ORDER_ID, { paymentMethod: 'cash' }, STORE, CASHIER, 'cashier'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('store-manager may confirm any order regardless of cashier (BR-ORDER-04)', async () => {
      const item = makeItem();
      const order = makeOrder({ status: 'pending', cashierId: 'different-cashier', items: [item] });
      const processingOrder = makeOrder({ status: 'processing', items: [item] });

      orderRepo.findOne
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(processingOrder);
      orderRepo.save.mockResolvedValue(processingOrder);

      await service.confirmPayment(
        ORDER_ID,
        { paymentMethod: 'card' },
        STORE,
        MANAGER,
        'store-manager',
      );

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cancels a pending order successfully', async () => {
      const order = makeOrder({ status: 'pending', items: [] });
      const cancelledOrder = makeOrder({ status: 'cancelled', items: [] });

      orderRepo.findOne
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(cancelledOrder);
      orderRepo.save.mockResolvedValue(cancelledOrder);

      const result = await service.cancel(ORDER_ID, STORE, CASHIER, 'cashier');

      expect(result.status).toBe('cancelled');
    });

    it('throws ConflictException when order is not pending', async () => {
      const order = makeOrder({ status: 'processing', items: [] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(service.cancel(ORDER_ID, STORE, CASHIER, 'cashier')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ForbiddenException when cashier cancels another cashier order', async () => {
      const order = makeOrder({ status: 'pending', cashierId: 'different-cashier', items: [] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(service.cancel(ORDER_ID, STORE, CASHIER, 'cashier')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns order for store-manager (can view any order)', async () => {
      const order = makeOrder({ cashierId: 'someone-else', items: [] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      const result = await service.findOne(ORDER_ID, STORE, MANAGER, 'store-manager');
      expect(result.id).toBe(ORDER_ID);
    });

    it('throws ForbiddenException when cashier requests another cashier order', async () => {
      const order = makeOrder({ cashierId: 'different', items: [] });
      orderRepo.findOne.mockResolvedValueOnce(order);

      await expect(service.findOne(ORDER_ID, STORE, CASHIER, 'cashier')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when order does not exist', async () => {
      orderRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(ORDER_ID, STORE, CASHIER, 'cashier')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
