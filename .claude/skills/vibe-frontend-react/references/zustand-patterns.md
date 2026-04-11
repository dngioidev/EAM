# Zustand Patterns

## Store Structure (Slice Pattern)

```typescript
// src/stores/session.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  storeId: string;
}

interface SessionState {
  user: AuthUser | null;
  accessToken: string | null;
}

interface SessionActions {
  setUser: (user: AuthUser, token: string) => void;
  clearSession: () => void;
}

type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        user: null,
        accessToken: null,

        // Actions
        setUser: (user, accessToken) =>
          set((state) => {
            state.user = user;
            state.accessToken = accessToken;
          }),

        clearSession: () =>
          set((state) => {
            state.user = null;
            state.accessToken = null;
          }),
      })),
      { name: 'session-storage' } // persisted to localStorage
    )
  )
);
```

---

## Store Slices for Large Domain State

```typescript
// src/stores/cart.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  immer((set, get) => ({
    items: [],
    
    addItem: (item) =>
      set((state) => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          state.items.push(item);
        }
      }),
    
    removeItem: (productId) =>
      set((state) => {
        state.items = state.items.filter(i => i.productId !== productId);
      }),
    
    clearCart: () => set((state) => { state.items = []; }),
    
    totalAmount: () =>
      get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  }))
);
```

---

## Usage Rules

1. **Server state** = React Query. **Client UI state** = Zustand. Never duplicate.
2. Selectors prevent unnecessary re-renders:
   ```typescript
   // ✅ Only re-renders when just user changes
   const user = useSessionStore(state => state.user);
   // ❌ Re-renders on any store change
   const { user } = useSessionStore();
   ```
3. Keep stores minimal — no derived state that React can compute
4. Never store React elements or functions in stores
