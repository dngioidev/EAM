import { apiClient } from '@/lib/api-client';

export type UserRole = 'OWNER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'DISABLED';
  created_at: string;
  product_count: number;
}

export interface PaginatedUsersResponse {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminStats {
  total_users: number;
  disabled_users: number;
  total_products: number;
  total_transactions: number;
}

export async function fetchUsers(page = 1, limit = 50): Promise<PaginatedUsersResponse> {
  const { data } = await apiClient.get<PaginatedUsersResponse>('/admin/users', {
    params: { page, limit },
  });
  return data;
}

export async function disableUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}/disable`);
  return data;
}

export async function enableUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}/enable`);
  return data;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/admin/stats');
  return data;
}
