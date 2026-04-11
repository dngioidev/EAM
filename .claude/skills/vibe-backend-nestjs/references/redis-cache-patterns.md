# Redis Cache Patterns

## Redis Client (ioredis)

```typescript
// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD,
      }),
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
```

---

## Cache Service

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}
```

---

## Key Namespacing

All keys must follow the pattern: `{module}:{entity}:{id}`

```
orders:list:page-1-limit-20
orders:detail:uuid-1234
products:price:SKU-001
auth:refresh:user-uuid
```

Never use bare keys — collisions across modules will corrupt cache.

---

## Cache-Aside Pattern

```typescript
async findOne(id: string): Promise<Order> {
  const cacheKey = `orders:detail:${id}`;
  
  // 1. Check cache
  const cached = await this.cacheService.get<Order>(cacheKey);
  if (cached) return cached;
  
  // 2. Fetch from DB
  const order = await this.ordersRepository.findOne({ where: { id } });
  if (!order) throw new NotFoundException(`Order ${id} not found`);
  
  // 3. Write to cache with TTL
  await this.cacheService.set(cacheKey, order, 300); // 5 min TTL
  return order;
}

async update(id: string, dto: UpdateOrderDto): Promise<Order> {
  // ... update logic ...
  // Invalidate after write
  await this.cacheService.del(`orders:detail:${id}`);
  return updatedOrder;
}
```

---

## TTL Guidelines

| Data Type | TTL |
|---|---|
| Product prices | 60s (can change) |
| Order details | 300s (5 min) |
| User session | 900s (15 min) |
| Config/settings | 3600s (1 hour) |
| Static reference data | 86400s (24 hours) |
