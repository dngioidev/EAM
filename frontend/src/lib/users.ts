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

export interface PaginatedUsersResponse {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  disabledUsers: number;
  totalProducts: number;
  totalTransactions: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  storeId: string | null;
}

export async function fetchUsers(page = 1, limit = 50): Promise<PaginatedUsersResponse> {
  const { data } = await apiClient.get<PaginatedUsersResponse>('/auth/users', {
    params: { page, limit },
  });
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

export async function setUserStatus(
  id: string,
  status: 'ACTIVE' | 'DISABLED',
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/auth/users/${id}/status`, { status });
  return data;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/auth/stats');
  return data;
}
