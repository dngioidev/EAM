import { apiClient } from '@/lib/api-client';

export interface DashboardItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  threshold: number;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStock: DashboardItem[];
  outOfStock: DashboardItem[];
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard');
  return data;
}
