# Backend Review Checklist

## NestJS Specifics

### Module Structure
- [ ] Each module has: module.ts, controller.ts, service.ts, dto/, entity/
- [ ] Module is registered in AppModule (or feature module parent)
- [ ] No circular dependencies between modules
- [ ] `forwardRef` is only used when circular dependency is truly unavoidable

### Controller Layer
- [ ] `@ApiTags()` decorator present on controller class
- [ ] `@ApiOperation()` on each endpoint
- [ ] `@UseGuards(JwtAuthGuard)` on all non-public endpoints
- [ ] `@Roles()` applied where role-specific access required
- [ ] Route paths match the approved API contract
- [ ] No business logic in controller — all delegated to service

### Service Layer
- [ ] Service constructor injects only allowed dependencies
- [ ] No direct TypeORM calls outside of repository
- [ ] Transactions used when multiple tables are modified atomically
- [ ] Error handling uses custom exception classes from `src/common/exceptions/`
- [ ] No `console.log` — use NestJS Logger

### DTO Validation
- [ ] All inbound DTOs use `class-validator` decorators
- [ ] DTOs imported in module with `ValidationPipe` applied globally
- [ ] Optional fields marked `@IsOptional()`, not union with `undefined`
- [ ] UUIDs validated with `@IsUUID()`
- [ ] Dates validated with `@IsISO8601()`
- [ ] Arrays validated with `@IsArray()` + `@ArrayMinSize()`

### Entity / TypeORM
- [ ] Entity extends BaseEntity (has id, createdAt, updatedAt, deletedAt)
- [ ] All FK columns have corresponding `@Index()` decorator
- [ ] No `eager: true` on relations (causes N+1 in unexpected places)
- [ ] Soft delete used throughout (`withDeleted` for admin queries only)

### Response Shape
- [ ] ResponseDTOs exclude sensitive fields (passwordHash, tokens, internalId)
- [ ] Using `plainToInstance()` or `@Exclude()` + `@UseInterceptors(ClassSerializerInterceptor)` correctly
- [ ] Paginated endpoints return the standard meta envelope

---

## Common Backend Rejections

| Issue | Outcome |
|-------|---------|
| Business logic in controller | REQUEST CHANGES — Major |
| Missing `@UseGuards` on data endpoint | BLOCK — Security issue |
| `any` TypeScript type on DTO | REQUEST CHANGES — Minor |
| Missing unit tests for service | REQUEST CHANGES — Major |
| `console.log` in production code | REQUEST CHANGES — Minor |
| Direct TypeORM access in controller | REQUEST CHANGES — Major |
