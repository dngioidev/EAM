# Event Emitter Patterns

## Setup

```typescript
// app.module.ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
    }),
  ],
})
```

---

## Event Classes

Define a class per event — type safety over raw strings.

```typescript
// src/orders/events/order-created.event.ts
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly createdAt: Date,
  ) {}
}
```

---

## Emitting Events

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from './events/order-created.event';

@Injectable()
export class OrdersService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.save(
      this.ordersRepository.create(dto)
    );

    // Emit after successful save
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(
      order.id,
      order.customerId,
      order.totalAmount,
      order.createdAt,
    ));

    return order;
  }
}
```

---

## Listening to Events

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../orders/events/order-created.event';

@Injectable()
export class NotificationsService {

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Async listener — does not block the response
    await this.sendOrderConfirmation(event.orderId, event.customerId);
  }
}
```

---

## When to Use Events

**Use events when:**
- Side effects (notifications, audit logs) that should not block the main response
- Decoupling modules (Notifications should not depend on Orders)
- Non-critical async operations

**Do NOT use events for:**
- Core business logic flows that must run atomically (use service methods or transactions)
- Cases where failure of the listener MUST fail the primary action
