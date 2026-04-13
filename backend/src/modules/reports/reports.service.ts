import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { DailyReportDto, MonthlyReportDto, ByTaxRate } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  // ── T030 — Daily report ──────────────────────────────────────────────────

  async getDailyReport(storeId: string, date: string): Promise<DailyReportDto> {
    // BR-RPT-02: Date filters use store local time (UTC+7)
    const invoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.store_id = :storeId', { storeId })
      .andWhere(
        "DATE(inv.issued_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = :date",
        { date },
      )
      .andWhere("inv.status = 'issued'")
      .getMany();

    return this.aggregateInvoices(storeId, invoices, { date });
  }

  // ── T031 — Monthly report ────────────────────────────────────────────────

  async getMonthlyReport(
    storeId: string,
    year: number,
    month: number,
  ): Promise<MonthlyReportDto> {
    // BR-RPT-02: UTC+7 local time
    const invoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.store_id = :storeId', { storeId })
      .andWhere(
        "EXTRACT(YEAR FROM inv.issued_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = :year",
        { year },
      )
      .andWhere(
        "EXTRACT(MONTH FROM inv.issued_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = :month",
        { month },
      )
      .andWhere("inv.status = 'issued'")
      .getMany();

    const base = this.aggregateInvoices(storeId, invoices, {});
    return { ...base, year, month };
  }

  // ── T032 — CSV export ────────────────────────────────────────────────────

  async exportCsv(storeId: string, from: string, to: string): Promise<string> {
    // BR-RPT-02: UTC+7 from/to
    const invoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.store_id = :storeId', { storeId })
      .andWhere(
        "inv.issued_at >= (:from::date AT TIME ZONE 'Asia/Ho_Chi_Minh')",
        { from },
      )
      .andWhere(
        "inv.issued_at < ((:to::date + INTERVAL '1 day') AT TIME ZONE 'Asia/Ho_Chi_Minh')",
        { to },
      )
      .andWhere("inv.status = 'issued'")
      .orderBy('inv.issued_at', 'ASC')
      .getMany();

    // BR-RPT-04: invoiceNumber, issueDate, buyerName, totalVnd, taxVnd
    const lines: string[] = [
      'invoiceNumber,issueDate,buyerName,totalVnd,taxVnd',
    ];
    for (const inv of invoices) {
      const taxVnd = inv.vatSubtotals.reduce((s, v) => s + v.vatVnd, 0);
      const issueDate = inv.issuedAt
        ? inv.issuedAt.toISOString().split('T')[0]
        : '';
      lines.push(
        [inv.invoiceNumber, issueDate, 'N/A', inv.totalVnd, taxVnd].join(','),
      );
    }
    return lines.join('\n');
  }

  // ── Last-7-days summary (used by /dashboard) ─────────────────────────────

  async getLast7Days(storeId: string): Promise<Array<{ date: string; revenueVnd: number }>> {
    const rows = (await this.invoiceRepo
      .createQueryBuilder('inv')
      .select(
        "DATE(inv.issued_at AT TIME ZONE 'Asia/Ho_Chi_Minh')",
        'date',
      )
      .addSelect('SUM(inv.total_vnd)', 'revenueVnd')
      .where('inv.store_id = :storeId', { storeId })
      .andWhere(
        "inv.issued_at >= NOW() - INTERVAL '7 days'",
      )
      .andWhere("inv.status = 'issued'")
      .groupBy("DATE(inv.issued_at AT TIME ZONE 'Asia/Ho_Chi_Minh')")
      .orderBy('date', 'ASC')
      .getRawMany()) as Array<{ date: string; revenueVnd: string }>;

    return rows.map((r) => ({
      date: r.date,
      revenueVnd: Number(r.revenueVnd),
    }));
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private aggregateInvoices(
    storeId: string,
    invoices: Invoice[],
    extra: Partial<DailyReportDto & MonthlyReportDto>,
  ): DailyReportDto {
    const taxMap = new Map<number, ByTaxRate>();

    for (const inv of invoices) {
      for (const vat of inv.vatSubtotals) {
        const entry = taxMap.get(vat.rate) ?? {
          rate: vat.rate,
          taxableVnd: 0,
          taxVnd: 0,
        };
        entry.taxableVnd += vat.taxableVnd;
        entry.taxVnd += vat.vatVnd;
        taxMap.set(vat.rate, entry);
      }
    }

    const grossRevenueVnd = invoices.reduce((s, inv) => s + inv.totalVnd, 0);
    const totalTaxVnd = [...taxMap.values()].reduce(
      (s, v) => s + v.taxVnd,
      0,
    );

    return {
      date: extra.date ?? '',
      storeId,
      invoiceCount: invoices.length,
      grossRevenueVnd,
      totalTaxVnd,
      netRevenueVnd: grossRevenueVnd - totalTaxVnd,
      byTaxRate: [...taxMap.values()].sort((a, b) => a.rate - b.rate),
      ...extra,
    } as DailyReportDto;
  }
}
