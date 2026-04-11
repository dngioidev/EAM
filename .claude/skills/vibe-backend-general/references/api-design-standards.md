# API Design Standards (Backend)

## Contract-First Rule

**NEVER implement an endpoint until its contract is approved** in `wiki/api-contracts/{module}.json`.

If a contract does not exist or is in `status: "draft"`:
1. Stop implementation
2. Flag `vibe-api-contractor` to finalize the contract
3. Do NOT improvise endpoint shapes

---

## URL Conventions

```
GET    /api/{module}           → list (paginated)
GET    /api/{module}/:id       → read one
POST   /api/{module}           → create
PATCH  /api/{module}/:id       → partial update
DELETE /api/{module}/:id       → soft delete (NEVER hard delete in production)
GET    /api/{module}/:id/{sub} → nested resource
POST   /api/{module}/:id/{sub} → create nested resource
```

Base path is always `/api/` — no version prefix in path (use header versioning if needed).

---

## Request/Response Standards

**Standard success envelope:**
```json
{ "data": { ... }, "meta": { "timestamp": "ISO-8601" } }
```

**Standard paginated list envelope:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "timestamp": "ISO-8601"
  }
}
```

**Standard error envelope:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [{ "field": "email", "message": "Must be valid email" }]
  },
  "meta": { "timestamp": "ISO-8601", "requestId": "uuid" }
}
```

---

## Status Code Rules

| Status | When |
|--------|------|
| 200 | Successful GET, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 400 | Validation error (class-validator) |
| 401 | No valid JWT |
| 403 | JWT valid but insufficient roles |
| 404 | Resource not found |
| 409 | Conflict (duplicate unique field) |
| 422 | Business rule violation (valid input but not allowed) |
| 500 | Unexpected server error (log this, never expose stack) |

---

## DTO Rules

```typescript
// InboundDto — always validate with class-validator
export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

// ResponseDto — always use Plain Object (not entity)
export class OrderResponseDto {
  id: string;
  customerId: string;
  total: number;
  createdAt: Date;
  // NEVER expose passwordHash, internalFields, etc.
}
```

---

## Pagination Default

All list endpoints default to:
- `page: 1`
- `limit: 20`
- `maxLimit: 100` (reject requests over 100)
