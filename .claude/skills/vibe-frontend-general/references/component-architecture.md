# Component Architecture

## Folder Structure

```
src/
├── pages/           # Route-level components. Minimal logic.
│   └── orders/
│       ├── OrdersPage.tsx
│       └── OrderDetailPage.tsx
├── features/        # Feature-specific components. Not reused.
│   └── orders/
│       ├── OrderTable.tsx
│       ├── OrderStatusBadge.tsx
│       └── CreateOrderModal.tsx
├── components/      # Shared/reusable components.
│   ├── ui/          # Atoms: Button, Input, Badge, Icon
│   ├── forms/       # FormField, SelectField, DatePicker
│   └── layout/      # PageHeader, Container, DataGrid
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── lib/             # api.ts, formatters, validators
└── types/           # Generated types + manual additions
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `OrderStatusBadge` |
| Hook | camelCase + `use` prefix | `useOrdersList` |
| Store | camelCase + `use` prefix + `Store` suffix | `useAuthStore` |
| Util | camelCase | `formatCurrency` |
| Type/Interface | PascalCase | `OrderResponse` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_ITEMS_PER_PAGE` |

---

## Page Component Pattern

Page components must:
1. Only handle routing, layouts, and data orchestration
2. Pass data down to feature components
3. Never contain direct UI rendering logic

```typescript
// ✅ Correct page component
export default function OrdersPage() {
  const { data: orders, isLoading } = useOrdersList();
  
  if (isLoading) return <PageSkeleton />;
  
  return (
    <PageLayout title="Đơn hàng">
      <OrderTable orders={orders} />
    </PageLayout>
  );
}
```

---

## Form Component Pattern

All forms use React Hook Form:

```typescript
const form = useForm<CreateOrderFormData>({
  resolver: zodResolver(createOrderSchema),
  defaultValues: { ... },
});
```

- Schema defined with Zod in `lib/validations/{module}.ts`
- Server validation errors mapped back to form fields
- Submit handler calls React Query mutation

---

## Error Boundary Pattern

Every page-level route must be wrapped in an error boundary:

```typescript
// Defined in router config
{
  path: '/orders',
  element: <OrdersPage />,
  errorElement: <ErrorPage />,  // React Router v6 error boundary
}
```

---

## Lazy Loading

Top-level route components must be lazy-loaded:

```typescript
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
```

Components within a page are NOT lazy-loaded (increases complexity without benefit at page level).
