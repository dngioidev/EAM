# State Decision Tree

## Rule 1: Is This Server Data?

YES → Use React Query. Never manage server data with local state or Zustand.

```typescript
// ✅ Correct
function OrdersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', { page, status }],
    queryFn: () => ordersApi.list({ page, status }),
  });
}

// ❌ Wrong
function OrdersList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    ordersApi.list().then(setOrders); // DON'T DO THIS
  }, []);
}
```

---

## Rule 2: Is This Transient UI State?

YES → `useState` or `useReducer`. Keep it close to where it's used.

```typescript
// Modal open/close — useState is correct
const [isModalOpen, setIsModalOpen] = useState(false);

// Multi-step form — useReducer is correct
const [formState, dispatch] = useReducer(formReducer, initialState);
```

---

## Rule 3: Is This Shared UI State On Same Page?

YES → Lift state up or use React context. NOT Zustand for page-level state.

```typescript
// Shared selection state between sibling components — lift to parent
function OrdersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <>
      <OrderList onSelect={setSelectedId} />
      <OrderDetail orderId={selectedId} />
    </>
  );
}
```

---

## Rule 4: Is This Truly Global Application State?

YES → Zustand store. Reserved for:
- User authentication state (JWT, user profile)
- Shopping cart (temporary pre-commit state)
- App-wide UI preferences (sidebar collapsed, locale)
- Multi-page wizard state

```typescript
// ✅ Correct Zustand use
interface AuthStore {
  user: User | null;
  token: string | null;
  logout: () => void;
}
const useAuthStore = create<AuthStore>(...)
```

---

## React Query Key Conventions

```typescript
// Keys as arrays — most specific at end
['orders']                            // all orders
['orders', { status: 'pending' }]     // filtered
['orders', orderId]                   // single
['orders', orderId, 'items']          // nested

// Mutation keys — verb first
['create-order']
['update-order-status', orderId]
['delete-order', orderId]
```

---

## Optimistic Updates

Use optimistic updates for mutations where:
- The operation is likely to succeed
- The user needs immediate feedback (slow network)
- Rolling back is straightforward

```typescript
useMutation({
  mutationFn: updateOrderStatus,
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: ['orders', variables.id] });
    const previous = queryClient.getQueryData(['orders', variables.id]);
    queryClient.setQueryData(['orders', variables.id], (old) => ({
      ...old,
      status: variables.status, // optimistic update
    }));
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['orders', variables.id], context?.previous);
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
  },
});
```
