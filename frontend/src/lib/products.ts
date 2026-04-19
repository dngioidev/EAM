import { apiClient } from '@/lib/api-client';

export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';

export interface Product {
  id: string;
  sku: string | null;
  name: string;
  status: StockStatus;
  quantity: number;
  threshold: number;
  updated_at: string;
}

export interface ProductsPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  threshold?: number;
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  threshold?: number;
}

export async function fetchProducts(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsPage> {
  const { data } = await apiClient.get<ProductsPage>('/products', { params });
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
}
