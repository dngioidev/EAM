# Exception Handling

## Custom Exception Classes

```typescript
// src/common/exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ error: { code, message } }, statusCode);
  }
}

// Usage:
throw new BusinessException('PROMO_CODE_EXPIRED', 'This promotion code has expired.');
```

---

## Global Exception Filter

```typescript
// src/common/exceptions/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorBody = exception instanceof HttpException
      ? exception.getResponse()
      : { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } };

    response.status(status).json({
      ...errorBody,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
        path: request.url,
      },
    });
  }
}
```

---

## Standard Error Codes

```typescript
// src/common/exceptions/error-codes.ts
export const ErrorCodes = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_ROLES: 'AUTH_INSUFFICIENT_ROLES',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Business Rules
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  
  // Operations
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;
```

---

## Do Not Catch What You Cannot Handle

```typescript
// ❌ Wrong: swallowing errors
try {
  await this.ordersRepository.save(order);
} catch (e) {
  // silently failing
}

// ✅ Correct: let unhandled errors bubble to global filter
await this.ordersRepository.save(order);

// ✅ Correct: catch only what you can meaningfully handle
try {
  await this.ordersRepository.save(order);
} catch (e) {
  if (e.code === '23505') { // PostgreSQL unique violation
    throw new ConflictException(`Order number already exists`);
  }
  throw e; // Re-throw anything else
}
```
