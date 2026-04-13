import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { ReportsService } from './reports.service';
import { Invoice } from '../invoices/entities/invoice.entity';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeInvoice(
  override: Partial<Invoice> = {},
): Invoice {
  return {
    id: 'inv-001',
    invoiceNumber: 'HD-20260413-0001',
    orderId: 'order-001',
    storeId: 'store-001',
    status: 'issued',
    lines: [],
    vatSubtotals: [{ rate: 10, taxableVnd: 100_000, vatVnd: 10_000 }],
    totalVnd: 110_000,
    issuedAt: new Date('2026-04-13T08:00:00Z'),
    createdAt: new Date('2026-04-13T08:00:00Z'),
    updatedAt: new Date('2026-04-13T08:00:00Z'),
    store: null as unknown as import('../stores/entities/store.entity').Store,
    ...override,
  };
}

// Minimal query builder mock
function mockQB(results: Invoice[]) {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(results),
    getRawMany: jest.fn().mockResolvedValue([]),
  };
  return qb as unknown as SelectQueryBuilder<Invoice>;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ReportsService', () => {
  let service: ReportsService;
  let qb: ReturnType<typeof mockQB>;

  beforeEach(async () => {
    qb = mockQB([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(qb),
          },
        },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  // ── getDailyReport ────────────────────────────────────────────────────────

  describe('getDailyReport', () => {
    it('returns zero totals for an empty day', async () => {
      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.invoiceCount).toBe(0);
      expect(result.grossRevenueVnd).toBe(0);
      expect(result.totalTaxVnd).toBe(0);
      expect(result.netRevenueVnd).toBe(0);
      expect(result.byTaxRate).toHaveLength(0);
    });

    it('returns correct totals for one invoice', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice()]);
      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.invoiceCount).toBe(1);
      expect(result.grossRevenueVnd).toBe(110_000);
      expect(result.totalTaxVnd).toBe(10_000);
      expect(result.netRevenueVnd).toBe(100_000);
    });

    it('aggregates multiple invoices', async () => {
      const inv1 = makeInvoice({ totalVnd: 110_000 });
      const inv2 = makeInvoice({
        id: 'inv-002',
        totalVnd: 220_000,
        vatSubtotals: [{ rate: 10, taxableVnd: 200_000, vatVnd: 20_000 }],
      });
      (qb.getMany as jest.Mock).mockResolvedValueOnce([inv1, inv2]);

      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.invoiceCount).toBe(2);
      expect(result.grossRevenueVnd).toBe(330_000);
      expect(result.totalTaxVnd).toBe(30_000);
      expect(result.netRevenueVnd).toBe(300_000);
    });

    it('groups byTaxRate correctly across invoices', async () => {
      const inv1 = makeInvoice({
        vatSubtotals: [{ rate: 8, taxableVnd: 50_000, vatVnd: 4_000 }],
        totalVnd: 54_000,
      });
      const inv2 = makeInvoice({
        id: 'inv-002',
        vatSubtotals: [{ rate: 10, taxableVnd: 100_000, vatVnd: 10_000 }],
        totalVnd: 110_000,
      });
      (qb.getMany as jest.Mock).mockResolvedValueOnce([inv1, inv2]);

      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.byTaxRate).toHaveLength(2);
      const rates = result.byTaxRate.map((r) => r.rate);
      expect(rates).toContain(8);
      expect(rates).toContain(10);
    });

    it('merges same tax rate from multiple invoices', async () => {
      const inv1 = makeInvoice({ vatSubtotals: [{ rate: 10, taxableVnd: 100_000, vatVnd: 10_000 }] });
      const inv2 = makeInvoice({ id: 'inv-002', vatSubtotals: [{ rate: 10, taxableVnd: 200_000, vatVnd: 20_000 }] });
      (qb.getMany as jest.Mock).mockResolvedValueOnce([inv1, inv2]);

      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.byTaxRate).toHaveLength(1);
      expect(result.byTaxRate[0].taxableVnd).toBe(300_000);
      expect(result.byTaxRate[0].taxVnd).toBe(30_000);
    });

    it('returns correct date in result', async () => {
      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.date).toBe('2026-04-13');
    });

    it('returns correct storeId in result', async () => {
      const result = await service.getDailyReport('store-001', '2026-04-13');
      expect(result.storeId).toBe('store-001');
    });
  });

  // ── getMonthlyReport ──────────────────────────────────────────────────────

  describe('getMonthlyReport', () => {
    it('returns zero totals for an empty month', async () => {
      const result = await service.getMonthlyReport('store-001', 2026, 4);
      expect(result.invoiceCount).toBe(0);
    });

    it('includes year and month in result', async () => {
      const result = await service.getMonthlyReport('store-001', 2026, 4);
      expect(result.year).toBe(2026);
      expect(result.month).toBe(4);
    });

    it('aggregates invoices correctly', async () => {
      const invoices = [
        makeInvoice({ totalVnd: 110_000 }),
        makeInvoice({ id: 'inv-002', totalVnd: 220_000, vatSubtotals: [{ rate: 10, taxableVnd: 200_000, vatVnd: 20_000 }] }),
      ];
      (qb.getMany as jest.Mock).mockResolvedValueOnce(invoices);

      const result = await service.getMonthlyReport('store-001', 2026, 4);
      expect(result.grossRevenueVnd).toBe(330_000);
      expect(result.totalTaxVnd).toBe(30_000);
    });
  });

  // ── exportCsv ─────────────────────────────────────────────────────────────

  describe('exportCsv', () => {
    it('returns CSV header for empty result', async () => {
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      expect(csv).toContain('invoiceNumber,issueDate,buyerName,totalVnd,taxVnd');
    });

    it('returns one row per invoice', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice(), makeInvoice({ id: 'inv-002', invoiceNumber: 'HD-002' })]);
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3); // header + 2 invoices
    });

    it('includes invoice number in CSV row', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice()]);
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      expect(csv).toContain('HD-20260413-0001');
    });

    it('includes total and tax in CSV row', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice()]);
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      expect(csv).toContain('110000');
      expect(csv).toContain('10000');
    });

    it('handles invoices with null issuedAt gracefully', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice({ issuedAt: null })]);
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      const rows = csv.split('\n');
      expect(rows[1].split(',')[1]).toBe(''); // empty issueDate
    });

    it('includes buyerName column as N/A', async () => {
      (qb.getMany as jest.Mock).mockResolvedValueOnce([makeInvoice()]);
      const csv = await service.exportCsv('store-001', '2026-04-01', '2026-04-13');
      expect(csv).toContain('N/A');
    });
  });

  // ── getLast7Days ───────────────────────────────────────────────────────────

  describe('getLast7Days', () => {
    it('returns empty array for store with no invoices', async () => {
      (qb.getRawMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.getLast7Days('store-001');
      expect(result).toEqual([]);
    });

    it('maps raw query rows to typed objects', async () => {
      (qb.getRawMany as jest.Mock).mockResolvedValueOnce([
        { date: '2026-04-12', revenueVnd: '55000' },
        { date: '2026-04-13', revenueVnd: '110000' },
      ]);
      const result = await service.getLast7Days('store-001');
      expect(result).toHaveLength(2);
      expect(result[0].revenueVnd).toBe(55_000);
      expect(result[1].revenueVnd).toBe(110_000);
    });

    it('coerces string revenue amounts to numbers', async () => {
      (qb.getRawMany as jest.Mock).mockResolvedValueOnce([
        { date: '2026-04-13', revenueVnd: '999999' },
      ]);
      const result = await service.getLast7Days('store-001');
      expect(typeof result[0].revenueVnd).toBe('number');
    });
  });
});
