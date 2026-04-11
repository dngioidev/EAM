---
name: vibe-security-nestjs
description: |
  Layer 2 NestJS security implementation patterns for V-Smart Ledger / EAM-Tax. Covers JWT + Passport.js auth setup, RolesGuard, Helmet, CSRF prevention, rate limiting with @nestjs/throttler, input sanitization, and secure headers. Activates alongside vibe-security-general for implementation.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-security-general) approval.
  STACK GUARD: Verify wiki/techstack/backend.json → auth = "JWT + Passport.js"
applyTo: "**"
---

# vibe-security-nestjs

## Auth Module Setup

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // Short-lived access tokens
      }),
    }),
  ],
  providers: [JwtStrategy, AuthService],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
```

## References

- [JWT Strategy](references/jwt-strategy.md)
- [Helmet and Rate Limiting](references/helmet-throttler.md)
- [RBAC Implementation](references/rbac-implementation.md)
- [Input Sanitization](references/input-sanitization.md)
- [Security Test Patterns](references/security-tests.md)
