# Health Checks

## Backend Health Endpoint

```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';

@Controller('health')
export class HealthController {

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Public()
  async check() {
    const [dbOk, redisOk] = await Promise.allSettled([
      this.dataSource.query('SELECT 1'),
      this.redis.ping(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk.status === 'fulfilled' ? 'up' : 'down',
        redis: redisOk.status === 'fulfilled' && redisOk.value === 'PONG' ? 'up' : 'down',
      },
    };
  }
}
```

## Docker Health Check Commands

Defined in `docker-compose.yml` per service:

```yaml
# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s

# Redis
healthcheck:
  test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5

# Backend (after it starts)
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

## Monitoring Health in CI

```bash
# Check all containers are healthy before running tests
docker compose ps | grep "(healthy)"

# Wait for backend to be healthy
timeout 60 bash -c 'until wget -q -O- http://localhost:3000/health | grep "\"status\":\"ok\""; do sleep 2; done'
```
