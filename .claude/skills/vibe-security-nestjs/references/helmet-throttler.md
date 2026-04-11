# Helmet and Rate Limiting

## Helmet Setup (main.ts)

```typescript
import helmet from 'helmet';

// Apply in bootstrap():
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  referrerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// Disable X-Powered-By (already done by Helmet, but explicit)
app.disable('x-powered-by');
```

## Rate Limiting

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute window
        limit: 120, // 120 requests per minute per IP
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10, // Stricter limit for auth endpoints
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

## Override for Auth Routes

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ auth: { ttl: 60000, limit: 5 } }) // 5 login attempts per minute
  login(@Body() dto: LoginDto) { ... }
}
```

## CORS Configuration

```typescript
// In bootstrap():
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```
