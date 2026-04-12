import { apiClient } from '@/lib/api-client';

export type UserRole = 'admin' | 'store-manager' | 'cashier' | 'accountant' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  storeId: string | null;
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>('/auth/users');
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  const { data } = await apiClient.post<AdminUser>('/auth/register', payload);
  return data;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/auth/users/${id}/deactivate`);
  return data;
}
