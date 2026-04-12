import { apiClient } from '@/lib/api-client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  priceVnd: number;
  taxRatePercent: number;
  isActive: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsPage {
  data: Product[];
  total: number;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  priceVnd: number;
  taxRatePercent: 0 | 5 | 8 | 10;
}

export interface UpdateProductPayload {
  name?: string;
  priceVnd?: number;
  taxRatePercent?: 0 | 5 | 8 | 10;
}

export async function fetchProducts(params: {
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
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deactivateProduct(id: string): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}/deactivate`);
  return data;
}
