# Form Patterns (React Hook Form + Zod)

## Setup

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
```

---

## Schema Definition

```typescript
// Always define schema alongside the form component
const createOrderSchema = z.object({
  customerId: z.string().uuid({ message: 'Select a valid customer' }),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Add at least one item'),
  promoCode: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;
```

---

## Full Form Component

```tsx
interface CreateOrderFormProps {
  onSuccess: (orderId: string) => void;
}

const CreateOrderForm: FC<CreateOrderFormProps> = ({ onSuccess }) => {
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: '',
      items: [],
    },
  });

  const onSubmit = async (data: CreateOrderFormData) => {
    const order = await createOrder(data);
    onSuccess(order.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Input placeholder="Customer ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Order'}
        </Button>

      </form>
    </Form>
  );
};
```

---

## Common Validation Patterns

```typescript
// VND amount (integer only, positive)
const vndAmount = z.number()
  .int('VND amounts must be whole numbers')
  .positive('Amount must be positive');

// Phone number (Vietnam)
const phoneVN = z.string()
  .regex(/^(0|\+84)[0-9]{9}$/, 'Invalid Vietnamese phone number');

// Tax code
const taxCode = z.string()
  .regex(/^\d{10}(-\d{3})?$/, 'Invalid tax code format');

// Date range validation
const dateRange = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);
```
