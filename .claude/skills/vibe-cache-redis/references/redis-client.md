# Redis Client Setup

## Installation

```bash
npm install ioredis
npm install @types/ioredis --save-dev
```

## Module Setup

```typescript
// src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global() // Make CacheService available everywhere without importing CacheModule
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new Redis({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
          maxRetriesPerRequest: 3,
          lazyConnect: false,
          enableReadyCheck: true,
        });

        client.on('error', (err) => {
          // Log but do not crash — Redis is not critical path
          console.error('[Redis] Connection error:', err.message);
        });

        return client;
      },
    },
    CacheService,
  ],
  exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}
```

## Health Check

```typescript
// Include in /health endpoint
@Injectable()
export class RedisHealthIndicator {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
```

## Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<vault>
```
