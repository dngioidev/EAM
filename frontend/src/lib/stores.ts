import { apiClient } from '@/lib/api-client';

export interface Store {
  id: string;
  name: string;
  taxCode: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorePayload {
  name: string;
  taxCode: string;
  address?: string;
}

export async function fetchStores(): Promise<Store[]> {
  const { data } = await apiClient.get<Store[]>('/stores');
  return data;
}

export async function createStore(payload: CreateStorePayload): Promise<Store> {
  const { data } = await apiClient.post<Store>('/stores', payload);
  return data;
}

export async function deactivateStore(id: string): Promise<Store> {
  const { data } = await apiClient.patch<Store>(`/stores/${id}/deactivate`);
  return data;
}
