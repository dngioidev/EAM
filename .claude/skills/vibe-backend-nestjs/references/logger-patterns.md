# Logger Patterns

## NestJS Logger

Use the built-in NestJS Logger — not `console.log`.

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  async create(dto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating order for customer ${dto.customerId}`);
    
    try {
      const order = await this.ordersRepository.save(
        this.ordersRepository.create(dto)
      );
      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## Log Levels

| Level | When to use |
|---|---|
| `logger.log()` | Normal operations (create, update, delete success) |
| `logger.warn()` | Unexpected but recoverable situations |
| `logger.error()` | Failures — always include `error.stack` as second arg |
| `logger.debug()` | Detailed tracing — only in development |
| `logger.verbose()` | Very detailed — disabled in production |

---

## What to Log

**Always log:**
- Service method entry for write operations (with IDs, no PII)
- Success after write operations
- All caught errors (with stack traces)
- Auth failures
- External service calls (cache miss/hit, third party API calls)

**Never log:**
- Passwords, tokens, secrets
- Full request bodies containing PII
- Credit card numbers, tax IDs raw values

---

## Structured Logging (Production)

For production, configure JSON structured logging:

```typescript
// main.ts
app.useLogger(new Logger()); // NestJS default
// In production: integrate with middleware that formats to JSON for log aggregation tools
```
