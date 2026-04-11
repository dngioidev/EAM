---
name: vibe-frontend-react
description: |
  Layer 2 React Frontend Implementation for V-Smart Ledger / EAM-Tax. Tech-specific patterns for React 18.x + Vite 5.x + React Query 5.x + Zustand 4.x + Tailwind CSS 3.x + shadcn/ui + React Hook Form + Zod. Activates alongside vibe-frontend-general when writing actual frontend code.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-frontend-general) approval to activate.
  STACK VALIDATION GUARD: Only activates if frontend stack is React 18.x + Vite 5.x.
applyTo: "**"
---

# vibe-frontend-react

## STACK VALIDATION GUARD

Before applying any pattern, verify:
- `wiki/techstack/frontend.json → framework` = "React 18.x"
- `wiki/techstack/frontend.json → bundler` = "Vite 5.x"
- `wiki/techstack/frontend.json → state` includes "Zustand 4.x"

## React Key Principles

1. **Prefer React Query over local async state** — don't reinvent loading/error/data patterns
2. **TypeScript strict** — no `any`, no untyped hooks  
3. **Design spec first** — implement the layout from `wiki/design/pages/{page}.json` before writing logic
4. **Component audit** — check `wiki/design/components/_index.json` before creating any new component
5. **Currency** — always display VND as integer; format with Vi-VN locale

## Component File Structure

```
src/
├── components/
│   ├── ui/            # shadcn/ui components (do not edit manually)
│   └── shared/        # Re-usable domain components
│       ├── OrderCard/
│       │   ├── OrderCard.tsx
│       │   ├── OrderCard.test.tsx
│       │   └── index.ts
├── features/
│   └── orders/
│       ├── components/  # Feature-scoped components
│       ├── hooks/       # Feature-scoped hooks
│       ├── pages/       # Route-level page components
│       └── types.ts     # Feature types
├── stores/              # Zustand stores
├── lib/
│   ├── api.ts           # API client
│   └── query-client.ts  # QueryClient config
└── types/
    └── api.ts           # Generated API types
```

## Standard Component Template

```tsx
import { type FC } from 'react';

interface OrderCardProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  onSelect: (id: string) => void;
}

const OrderCard: FC<OrderCardProps> = ({ orderId, orderNumber, totalAmount, onSelect }) => {
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalAmount);

  return (
    <div
      role="button"
      onClick={() => onSelect(orderId)}
      className="rounded-md border p-4 hover:bg-accent cursor-pointer"
    >
      <p className="font-medium">{orderNumber}</p>
      <p className="text-sm text-muted-foreground">{formattedAmount}</p>
    </div>
  );
};

export { OrderCard };
```

## References

- [React Query Setup](references/react-query-setup.md)
- [Zustand Patterns](references/zustand-patterns.md)
- [Form Patterns (RHF + Zod)](references/form-patterns.md)
- [Routing Patterns](references/routing-patterns.md)
- [API Client Setup](references/api-client.md)
- [Testing Patterns (Vitest + RTL)](references/testing-patterns.md)
- [Accessibility Patterns](references/accessibility-patterns.md)
- [i18n + Currency Formatting](references/i18n-formatting.md)
- [shadcn/ui Usage](references/shadcn-patterns.md)
