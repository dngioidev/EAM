# Module Patterns (NestJS)

## Standard Module Structure

Every module follows this exact file structure — no exceptions.

```
src/modules/{name}/
├── {name}.module.ts          # DI wiring
├── {name}.controller.ts      # HTTP layer only
├── {name}.service.ts         # Business logic
├── dto/
│   ├── create-{name}.dto.ts  # Inbound create
│   ├── update-{name}.dto.ts  # Inbound partial update (PartialType)
│   └── {name}-response.dto.ts# Outbound shape
├── entities/
│   └── {name}.entity.ts      # TypeORM entity
└── {name}.service.spec.ts    # Unit tests for service
```

---

## AppModule Registration

New modules must be added to `src/app.module.ts`:

```typescript
@Module({
  imports: [
    // ... existing modules
    OrdersModule,
  ],
})
export class AppModule {}
```

---

## Module Import Boundaries

A module may ONLY depend on:
- Its own entity (via `TypeOrmModule.forFeature([Entity])`)
- Shared modules (e.g., `CommonModule`, `AuthModule`)
- Other modules' exported SERVICES (never their repositories directly)

```typescript
// ✅ Correct: import OrdersService via OrdersModule export
@Module({
  imports: [OrdersModule],
  providers: [ReportsService],
})
export class ReportsModule {}

// ❌ Wrong: import OrdersRepository directly
@Module({
  imports: [TypeOrmModule.forFeature([Order])], // in wrong module!
  providers: [ReportsService],
})
```

---

## CommonModule Contents

Shared across all modules:

```
src/common/
├── entities/
│   └── base.entity.ts        # BaseEntity with id, createdAt, updatedAt, deletedAt
├── exceptions/
│   ├── business.exception.ts # 422 errors for business rule violations
│   └── http-exception.filter.ts # Global exception filter
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── roles.decorator.ts
│   └── current-user.decorator.ts
├── interceptors/
│   └── transform.interceptor.ts  # Wraps responses in {data, meta} envelope
└── pipes/
    └── validation.pipe.ts
```

---

## Global Pipes / Guards / Filters

Set in `main.ts` — not repeated per controller:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,         // Strip unknown fields
  forbidNonWhitelisted: true, // Throw on unknown fields
  transform: true,         // Auto-transform types
}));
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new TransformInterceptor());
```
