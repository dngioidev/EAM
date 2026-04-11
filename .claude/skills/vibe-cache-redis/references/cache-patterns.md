# Cache Patterns

## CacheService Implementation

```typescript
// src/cache/cache.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(`Cache GET failed for key "${key}": ${error.message}`);
      return null; // Degrade gracefully
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Cache SET failed for key "${key}": ${error.message}`);
      // Do not throw — DB result is still valid
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Cache DEL failed for key "${key}": ${error.message}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      // Use SCAN to avoid blocking Redis with KEYS in production
      const keys: string[] = [];
      let cursor = '0';
      do {
        const [nextCursor, batch] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        keys.push(...batch);
      } while (cursor !== '0');

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Cache DEL pattern "${pattern}" failed: ${error.message}`);
    }
  }
}
```

## Cache-Aside in Service

```typescript
async findById(id: string): Promise<Product> {
  const key = `products:detail:${id}`;
  
  const cached = await this.cacheService.get<Product>(key);
  if (cached) {
    this.logger.debug(`Cache HIT: ${key}`);
    return cached;
  }
  
  const product = await this.productsRepository.findOne({ where: { id } });
  if (!product) throw new NotFoundException(`Product ${id} not found`);
  
  await this.cacheService.set(key, product, 300);
  return product;
}

async update(id: string, dto: UpdateProductDto): Promise<Product> {
  const product = await this.findById(id);
  Object.assign(product, dto);
  const updated = await this.productsRepository.save(product);
  
  // Invalidate specific key + any list caches for this entity
  await this.cacheService.del(`products:detail:${id}`);
  await this.cacheService.delByPattern('products:list:*');
  
  return updated;
}
```
