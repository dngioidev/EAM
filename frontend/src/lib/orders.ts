import { apiClient } from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceVnd: number;
  taxRatePercent: number;
  lineTotalVnd: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalVnd: number;
  paymentMethod: 'cash' | 'card' | null;
  storeId: string;
  cashierId: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPage {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface AddItemPayload {
  productId: string;
  quantity: number;
}

export interface ConfirmPaymentPayload {
  paymentMethod: 'cash' | 'card';
}

export interface ListOrdersParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
  cashierId?: string;
  page?: number;
  limit?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function createOrder(): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders');
  return data;
}

export async function addItemToOrder(orderId: string, payload: AddItemPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${orderId}/items`, payload);
  return data;
}

export async function confirmPayment(
  orderId: string,
  payload: ConfirmPaymentPayload,
): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${orderId}/confirm-payment`, payload);
  return data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${orderId}/cancel`);
  return data;
}

export async function fetchOrders(params?: ListOrdersParams): Promise<OrdersPage> {
  const { data } = await apiClient.get<OrdersPage>('/orders', { params });
  return data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function fetchOrderInvoice(orderId: string): Promise<import('./invoices').Invoice> {
  const { data } = await apiClient.get(`/orders/${orderId}/invoice`);
  return data;
}
