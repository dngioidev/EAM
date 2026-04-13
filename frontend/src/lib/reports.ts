import { apiClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ByTaxRate {
  rate: number;
  taxableVnd: number;
  taxVnd: number;
}

export interface DailyReport {
  date: string;
  storeId: string;
  invoiceCount: number;
  grossRevenueVnd: number;
  totalTaxVnd: number;
  netRevenueVnd: number;
  byTaxRate: ByTaxRate[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  storeId: string;
  invoiceCount: number;
  grossRevenueVnd: number;
  totalTaxVnd: number;
  netRevenueVnd: number;
  byTaxRate: ByTaxRate[];
}

export interface WeeklyDay {
  date: string;
  revenueVnd: number;
}

// ── API calls ──────────────────────────────────────────────────────────────────

export async function fetchDailyReport(date: string): Promise<DailyReport> {
  const { data } = await apiClient.get<DailyReport>('/reports/daily', {
    params: { date },
  });
  return data;
}

export async function fetchMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const { data } = await apiClient.get<MonthlyReport>('/reports/monthly', {
    params: { year, month },
  });
  return data;
}

export async function fetchWeeklyRevenue(): Promise<WeeklyDay[]> {
  const { data } = await apiClient.get<WeeklyDay[]>('/reports/dashboard/weekly');
  return data;
}

export function buildCsvExportUrl(from: string, to: string): string {
  return `/api/v1/reports/invoices/export?from=${from}&to=${to}`;
}
