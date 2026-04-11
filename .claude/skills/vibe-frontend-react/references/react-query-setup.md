# React Query Setup

## QueryClient Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — data is fresh for 5 min
      gcTime: 1000 * 60 * 30,   // 30 min — unused cache stays for 30 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast.error(message);
      },
    },
  },
});
```

---

## Query Key Conventions

Keys are structured as arrays from general → specific:

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: OrderFilters) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },
} as const;
```

---

## Query Hook Pattern

```typescript
// src/features/orders/hooks/useOrder.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/api';
import type { Order } from '../types';

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

// Usage:
// const { data: order, isLoading, error } = useOrder(orderId);
```

---

## Mutation Hook Pattern

```typescript
// src/features/orders/hooks/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiClient } from '@/lib/api';
import type { CreateOrderDto, Order } from '../types';

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => apiClient.post<Order>('/orders', dto),
    onSuccess: () => {
      // Invalidate list queries to refetch fresh data
      qc.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

// Usage:
// const { mutateAsync: createOrder, isPending } = useCreateOrder();
```

---

## Optimistic Update Pattern

Use only for simple single-field toggles (status changes, toggles):

```typescript
useMutation({
  mutationFn: (id: string) => apiClient.patch(`/orders/${id}/cancel`),
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: queryKeys.orders.detail(id) });
    const previous = qc.getQueryData(queryKeys.orders.detail(id));
    qc.setQueryData(queryKeys.orders.detail(id), (old: Order) => ({
      ...old,
      status: 'cancelled',
    }));
    return { previous };
  },
  onError: (err, id, context) => {
    qc.setQueryData(queryKeys.orders.detail(id), context?.previous);
  },
  onSettled: (_, __, id) => {
    qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
  },
})
```
