# Accessibility Patterns

## WCAG 2.1 AA Requirements (Mandatory)

- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All interactive elements reachable by keyboard (Tab, Shift+Tab)
- No keyboard trap (focus must be escapable from every element)
- All form inputs have visible labels (not just placeholder)
- All images have meaningful `alt` text

---

## Interactive Elements

### Buttons — always use `<button>`, never `<div onClick>`

```tsx
// ❌ Not accessible — no keyboard support
<div onClick={handleClick}>Submit</div>

// ✅ Accessible
<button type="button" onClick={handleClick}>Submit</button>

// ✅ With loading state
<Button disabled={isPending} aria-busy={isPending}>
  {isPending ? 'Processing...' : 'Submit'}
</Button>
```

### Icon-only Buttons — require label

```tsx
<button type="button" aria-label="Delete order">
  <TrashIcon aria-hidden="true" />
</button>
```

---

## Forms

```tsx
// Every input must have an associated label
<FormField
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel htmlFor="email-input">Email</FormLabel>
      <FormControl>
        <Input id="email-input" {...field} aria-describedby="email-error" />
      </FormControl>
      <FormMessage id="email-error" role="alert" />
    </FormItem>
  )}
/>
```

---

## Modal / Dialog Focus Management

```tsx
// shadcn/ui Dialog handles focus trap and Escape key automatically
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Order</DialogTitle> {/* Required: dialog title */}
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

Never implement custom modal without focus management — use shadcn/ui Dialog.

---

## Loading States

```tsx
// Skeleton placeholders — better UX and accessible
<div role="status" aria-label="Loading orders">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>

// Error state
<div role="alert" aria-live="assertive">
  <p>Failed to load orders: {error.message}</p>
  <Button onClick={refetch}>Retry</Button>
</div>
```

---

## Keyboard Navigation

```typescript
// Handling keyboard events in non-button elements (e.g., custom listbox)
const handleKeyDown = (e: React.KeyboardEvent, item: Order) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect(item.id);
  }
};

<li
  role="option"
  tabIndex={0}
  aria-selected={selected}
  onKeyDown={(e) => handleKeyDown(e, order)}
  onClick={() => onSelect(order.id)}
>
  {order.orderNumber}
</li>
```
