# Testing Patterns (Vitest + RTL)

## Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

---

## Test Setup

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { queryClient } from '@/lib/query-client';

afterEach(() => {
  cleanup();
  queryClient.clear();
});

// Mock browser APIs not in jsdom
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

---

## Custom Render (with Providers)

```typescript
// src/test-utils.tsx
import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui: ReactNode) {
  const testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  );
}
```

---

## Component Test Pattern

```typescript
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { OrderCard } from './OrderCard';

describe('OrderCard', () => {
  it('displays order number and formatted VND amount', () => {
    renderWithProviders(
      <OrderCard
        orderId="uuid-1"
        orderNumber="ORD-001"
        totalAmount={150000}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText(/150.000/)).toBeInTheDocument(); // VN locale uses dots
  });

  it('calls onSelect with order id on click', async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <OrderCard orderId="uuid-1" orderNumber="ORD-001" totalAmount={0} onSelect={onSelect} />
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('uuid-1');
  });
});
```

---

## Mocking API Calls

```typescript
import * as api from '@/lib/api';

vi.spyOn(api.apiClient, 'get').mockResolvedValue({
  id: 'uuid-1',
  orderNumber: 'ORD-001',
  totalAmount: 150000,
  status: 'pending',
});
```
