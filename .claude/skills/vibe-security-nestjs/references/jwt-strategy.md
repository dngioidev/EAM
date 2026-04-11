# JWT Strategy

## JWT Strategy Implementation

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;       // User UUID
  email: string;
  roles: string[];
  storeId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,       // Never ignore expiration
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  // This method runs after token verification — attach user to request
  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      storeId: payload.storeId,
    };
  }
}
```

## Token Generation

```typescript
// In AuthService
async login(user: User): Promise<{ accessToken: string; refreshToken: string }> {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    storeId: user.storeId,
  };

  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  
  // Refresh token — longer lived, stored server-side
  const refreshToken = this.jwtService.sign(
    { sub: user.id },
    { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '7d' }
  );

  // Store hashed refresh token
  await this.usersService.saveRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

  return { accessToken, refreshToken };
}
```

## Security Rules

1. `JWT_SECRET` must be ≥ 32 chars — use `openssl rand -hex 32`
2. Access tokens: 15 min max expiry
3. Refresh tokens: 7 days, stored as bcrypt hash, invalidated on logout
4. Never embed sensitive PII in JWT payload — only IDs and roles
5. JWT secret must differ between environments
