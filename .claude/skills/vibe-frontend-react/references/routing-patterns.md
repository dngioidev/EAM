# Routing Patterns

## React Router v6 Setup

```typescript
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'orders',
        children: [
          { index: true, element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailPage /> },
          { path: 'new', element: <CreateOrderPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
```

---

## Protected Routes

```tsx
// src/layouts/RootLayout.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/session.store';

export const RootLayout = () => {
  const user = useSessionStore(state => state.user);
  
  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
```

---

## Navigation Helpers

```typescript
// Typed route paths — prevents typos
export const routes = {
  dashboard: '/',
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    create: '/orders/new',
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
  },
} as const;

// Usage:
navigate(routes.orders.detail(order.id));
<Link to={routes.orders.create}>New Order</Link>
```

---

## Error Boundary

```tsx
import { useRouteError, Link } from 'react-router-dom';

export const RootErrorBoundary = () => {
  const error = useRouteError();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-xl font-semibold">Đã xảy ra lỗi</h1>
      <p className="text-muted-foreground mt-2">
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
      <Link to="/" className="mt-4 underline">Return to Dashboard</Link>
    </div>
  );
};
```
