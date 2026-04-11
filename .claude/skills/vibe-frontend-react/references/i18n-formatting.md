# i18n and Currency Formatting

## Number Formatting (VND)

VND has NO decimal places. Always display as integers.

```typescript
// src/lib/formatters.ts

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
// Output: "150.000 ₫"

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('vi-VN').format(n);
// Output: "1.234.567" (dots as thousand separators in vi-VN)

export const formatPercent = (ratio: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 1 }).format(ratio);
// Input: 0.085 → Output: "8,5%"
```

---

## Date Formatting

```typescript
export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
// Output: "25/12/2024"

export const formatDateTime = (date: string | Date): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
// Output: "25/12/2024, 14:30"
```

---

## Formatter Hooks

```typescript
// src/hooks/useFormatters.ts
export function useFormatters() {
  return { formatVND, formatDate, formatDateTime, formatNumber, formatPercent };
}
```

---

## Vietnamese Text Rules

1. Use proper Vietnamese diacritics in UI labels — not ASCII romanization
   - ❌ "Khach hang" → ✅ "Khách hàng"
2. Proper nouns: "TP. Hồ Chí Minh" not "Ho Chi Minh City"
3. Currency: VNĐ or ₫ — do not use "VND" as a user-facing display
4. Tax rates: 0%, 5%, 8%, 10% — use `formatPercent` consistently

---

## Input Validation for Vietnamese Numbers

```typescript
// Zod validator that accepts VND amounts entered with dots (vi-VN user input)
const parseVNDInput = (value: string): number => {
  // User may type "150.000" meaning 150000
  return parseInt(value.replace(/\./g, ''), 10);
};
```
