import { apiClient } from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  productName: string;
  sku: string;
  quantity: number;
  unitPriceVnd: number;
  taxRatePercent: number;
  lineTotalVnd: number;
}

export interface VatSubtotal {
  rate: number;
  taxableVnd: number;
  vatVnd: number;
}

export type InvoiceStatus = 'draft' | 'issued' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  storeId: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  vatSubtotals: VatSubtotal[];
  totalVnd: number;
  issuedAt: string | null;
}

export interface InvoicesPage {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export interface ListInvoicesParams {
  from?: string;
  to?: string;
  status?: 'issued' | 'cancelled';
  page?: number;
  limit?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchInvoices(params?: ListInvoicesParams): Promise<InvoicesPage> {
  const { data } = await apiClient.get<InvoicesPage>('/invoices', { params });
  return data;
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
  return data;
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/cancel`);
  return data;
}
