export interface ByTaxRate {
  rate: number;
  taxableVnd: number;
  taxVnd: number;
}

export interface DailyReportDto {
  date: string;
  storeId: string;
  invoiceCount: number;
  grossRevenueVnd: number;
  totalTaxVnd: number;
  netRevenueVnd: number;
  byTaxRate: ByTaxRate[];
}

export interface MonthlyReportDto {
  year: number;
  month: number;
  storeId: string;
  invoiceCount: number;
  grossRevenueVnd: number;
  totalTaxVnd: number;
  netRevenueVnd: number;
  byTaxRate: ByTaxRate[];
}
