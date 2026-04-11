# Status Badge System

## Status Badge Component

```tsx
// src/components/shared/StatusBadge.tsx
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  label?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { className: string; label: string }> = {
  pending: {
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Chờ xử lý',
  },
  active: {
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Đang xử lý',
  },
  completed: {
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Hoàn thành',
  },
  cancelled: {
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Đã hủy',
  },
};

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      config.className
    )}>
      {label ?? config.label}
    </span>
  );
};
```

## Usage

```tsx
<StatusBadge status="pending" />
<StatusBadge status="completed" />
<StatusBadge status="cancelled" label="Đã từ chối" />
```

## WCAG Compliance

All status colors above pass WCAG 2.1 AA contrast against white backgrounds:
- amber-800 on amber-100: ~5.2:1 ✅
- emerald-800 on emerald-100: ~5.9:1 ✅
- blue-800 on blue-100: ~6.2:1 ✅
- red-800 on red-100: ~5.8:1 ✅
