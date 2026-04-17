import { apiClient } from '@/lib/api-client';

export type TransactionType = 'IMPORT' | 'EXPORT';

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  note: string | null;
  createdAt: string;
}

export interface TransactionListResult {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface StockOperationResult {
  transaction: Transaction;
  product: {
    id: string;
    name: string;
    quantity: number;
    status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';
  };
}

export interface ImportPayload {
  productId: string;
  quantity: number;
  note?: string;
}

export interface ExportPayload {
  productId: string;
  quantity: number;
  note?: string;
}

export async function importStock(payload: ImportPayload): Promise<StockOperationResult> {
  const { data } = await apiClient.post<StockOperationResult>('/inventory/import', payload);
  return data;
}

export async function exportStock(payload: ExportPayload): Promise<StockOperationResult> {
  const { data } = await apiClient.post<StockOperationResult>('/inventory/export', payload);
  return data;
}

export async function fetchTransactions(
  productId: string,
  page = 1,
  limit = 50,
): Promise<TransactionListResult> {
  const { data } = await apiClient.get<TransactionListResult>('/inventory/transactions', {
    params: { product_id: productId, page, limit },
  });
  return data;
}
