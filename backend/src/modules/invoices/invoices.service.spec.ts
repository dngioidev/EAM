import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrdersService } from '../orders/orders.service';

const STORE = 'aaaa-0000-0000-0001';
const ORDER_ID = 'ord-uuid-0001';
const INV_ID = 'inv-uuid-0001';

function makeInvoice(override: Partial<Invoice> = {}): Invoice {
  return {
    id: INV_ID,
    invoiceNumber: '2026/000001',
    orderId: ORDER_ID,
    storeId: STORE,
    status: 'issued',
    lines: [],
    vatSubtotals: [],
    totalVnd: 60000,
    issuedAt: new Date(),
    ...override,
  } as unknown as Invoice;
}

function makeOrder(override: Partial<Order> = {}): Order {
  return {
    id: ORDER_ID,
    status: 'completed',
    storeId: STORE,
    ...override,
  } as unknown as Order;
}

describe('InvoicesService', () => {
  let service: InvoicesService;

  const invoiceRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const seqRepo = {};
  const orderRepo = { findOne: jest.fn() };
  const itemRepo = {};
  const dataSource = {};
  const ordersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(InvoiceSequence), useValue: seqRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: itemRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    jest.clearAllMocks();
  });

  // ─── calculateVatSubtotals (BR-INV-04 / BR-INV-05) ───────────────────────

  describe('calculateVatSubtotals()', () => {
    it('returns empty array for empty lines', () => {
      expect(service.calculateVatSubtotals([])).toEqual([]);
    });

    it('groups single rate correctly with floor rounding (BR-INV-05)', () => {
      const lines: InvoiceLine[] = [
        {
          productName: 'Cà phê',
          sku: 'CF-01',
          quantity: 1,
          unitPriceVnd: 30000,
          taxRatePercent: 10,
          lineTotalVnd: 30000,
        },
      ];

      const result = service.calculateVatSubtotals(lines);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ rate: 10, taxableVnd: 30000, vatVnd: 3000 });
    });

    it('applies floor rounding for indivisible amounts (BR-INV-05)', () => {
      // 10001 * 10% = 1000.1 → floor → 1000
      const lines: InvoiceLine[] = [
        {
          productName: 'Sản phẩm',
          sku: 'X-01',
          quantity: 1,
          unitPriceVnd: 10001,
          taxRatePercent: 10,
          lineTotalVnd: 10001,
        },
      ];

      const result = service.calculateVatSubtotals(lines);
      expect(result[0].vatVnd).toBe(1000); // floor(10001 * 10 / 100) = floor(1000.1) = 1000
    });

    it('groups multiple lines at same rate', () => {
      const lines: InvoiceLine[] = [
        {
          productName: 'A',
          sku: 'A-01',
          quantity: 1,
          unitPriceVnd: 20000,
          taxRatePercent: 10,
          lineTotalVnd: 20000,
        },
        {
          productName: 'B',
          sku: 'B-01',
          quantity: 2,
          unitPriceVnd: 15000,
          taxRatePercent: 10,
          lineTotalVnd: 30000,
        },
      ];

      // Both at 10% → combined taxableVnd = 50000 → vatVnd = 5000
      const result = service.calculateVatSubtotals(lines);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ rate: 10, taxableVnd: 50000, vatVnd: 5000 });
    });

    it('produces separate entries for different VAT rates and returns sorted by rate', () => {
      const lines: InvoiceLine[] = [
        {
          productName: 'C',
          sku: 'C-01',
          quantity: 1,
          unitPriceVnd: 100000,
          taxRatePercent: 5,
          lineTotalVnd: 100000,
        },
        {
          productName: 'D',
          sku: 'D-01',
          quantity: 1,
          unitPriceVnd: 200000,
          taxRatePercent: 10,
          lineTotalVnd: 200000,
        },
        {
          productName: 'E',
          sku: 'E-01',
          quantity: 1,
          unitPriceVnd: 50000,
          taxRatePercent: 0,
          lineTotalVnd: 50000,
        },
      ];

      const result = service.calculateVatSubtotals(lines);

      expect(result).toHaveLength(3);
      expect(result[0].rate).toBe(0);  // sorted ascending
      expect(result[1].rate).toBe(5);
      expect(result[2].rate).toBe(10);
      expect(result[0].vatVnd).toBe(0);      // 0% → vatVnd = 0
      expect(result[1].vatVnd).toBe(5000);   // 100000 * 5% = 5000
      expect(result[2].vatVnd).toBe(20000);  // 200000 * 10% = 20000
    });
  });

  // ─── cancel (INV-03) ──────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('returns invoice unchanged if already cancelled (idempotent)', async () => {
      const invoice = makeInvoice({ status: 'cancelled' });
      invoiceRepo.findOne.mockResolvedValue(invoice);

      const result = await service.cancel(INV_ID, STORE);

      expect(invoiceRepo.save).not.toHaveBeenCalled();
      expect(result.status).toBe('cancelled');
    });

    it('throws ConflictException when order is not refunded', async () => {
      const invoice = makeInvoice({ status: 'issued' });
      const order = makeOrder({ status: 'completed' }); // not refunded

      invoiceRepo.findOne.mockResolvedValue(invoice);
      orderRepo.findOne.mockResolvedValue(order);

      await expect(service.cancel(INV_ID, STORE)).rejects.toThrow(ConflictException);
      expect(invoiceRepo.save).not.toHaveBeenCalled();
    });

    it('cancels invoice when order is refunded', async () => {
      const invoice = makeInvoice({ status: 'issued' });
      const refundedOrder = makeOrder({ status: 'refunded' });
      const cancelledInvoice = makeInvoice({ status: 'cancelled' });

      invoiceRepo.findOne.mockResolvedValue(invoice);
      orderRepo.findOne.mockResolvedValue(refundedOrder);
      invoiceRepo.save.mockResolvedValue(cancelledInvoice);

      const result = await service.cancel(INV_ID, STORE);

      expect(invoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('cancelled');
    });

    it('throws NotFoundException when invoice does not exist', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);

      await expect(service.cancel(INV_ID, STORE)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(service.cancel(INV_ID, null)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── findByOrder (ORDER-07) ───────────────────────────────────────────────

  describe('findByOrder()', () => {
    it('returns invoice for a valid order', async () => {
      const order = makeOrder();
      const invoice = makeInvoice();

      orderRepo.findOne.mockResolvedValue(order);
      invoiceRepo.findOne.mockResolvedValue(invoice);

      const result = await service.findByOrder(ORDER_ID, STORE);
      expect(result.invoiceNumber).toBe('2026/000001');
    });

    it('throws NotFoundException when order not found in store', async () => {
      orderRepo.findOne.mockResolvedValue(null);

      await expect(service.findByOrder(ORDER_ID, STORE)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when invoice not yet issued for order', async () => {
      const order = makeOrder();
      orderRepo.findOne.mockResolvedValue(order);
      invoiceRepo.findOne.mockResolvedValue(null);

      await expect(service.findByOrder(ORDER_ID, STORE)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(service.findByOrder(ORDER_ID, null)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── findOne (INV-02) ─────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns invoice from same store', async () => {
      invoiceRepo.findOne.mockResolvedValue(makeInvoice());

      const result = await service.findOne(INV_ID, STORE);
      expect(result.id).toBe(INV_ID);
    });

    it('throws NotFoundException when invoice not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(INV_ID, STORE)).rejects.toThrow(NotFoundException);
    });
  });
});
