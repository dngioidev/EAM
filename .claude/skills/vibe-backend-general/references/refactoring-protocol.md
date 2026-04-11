# Refactoring Protocol (Backend)

## When Is Refactoring Allowed?

Refactoring is allowed ONLY when:
- The old code is actively causing bugs
- A new feature requires the refactored structure as a prerequisite
- `vibe-code-review` has flagged a compliance violation in the last sprint

**NOT allowed:**
- "I think this could be cleaner" — requires PO sign-off
- While implementing a new feature (do it first as a separate task)
- Without tests passing BEFORE the refactor starts

---

## Refactor Steps

1. **Confirm tests pass** before touching anything
   - Run `npm run test` and record which tests pass
   - If tests are failing before refactor — fix the failures first

2. **One change at a time** — never restructure + rename + move in the same commit
   - Step 1: Move file → tests pass → commit
   - Step 2: Rename → tests pass → commit
   - Step 3: Restructure → tests pass → commit

3. **No behavior changes** — a refactor must be semantically equivalent
   - Write a comment: `// REFACTOR: no behavior change intended`
   - If behavior must also change → separate PR/commit

4. **Update imports** — after any move or rename, verify no broken imports
   - Run `npm run build` — zero errors required

5. **Update wiki** — if the refactor changes module ownership or API shape:
   - Update `wiki/features/{feature-id}.json`
   - Write a `wiki/decisions/{date}.json` entry explaining the refactor

---

## Common Refactor Patterns

### Extract Service Logic
When a controller is doing too much:
```typescript
// Before: business logic in controller
@Post()
async create(@Body() dto: CreateOrderDto) {
  const tax = dto.total * 0.1; // business logic!
  return this.ordersRepository.save({ ...dto, tax });
}

// After: delegate to service
@Post()
async create(@Body() dto: CreateOrderDto) {
  return this.ordersService.create(dto);
}
```

### Extract Type
When an inline type is reused:
```typescript
// Extract to types/order.types.ts (not inline)
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
```

### Remove Dead Code
When a method is no longer called:
- Search for ALL references before deleting
- If it was exported — check if any other module depended on it
- Write a deletion log entry in `wiki/history/{date}.json`

---

## What NOT to Refactor

- Database schema during an active sprint (schedule for next sprint)
- Auth guards, JWT logic (requires security review)
- Anything with an approved API contract (shape is frozen)
- Code about to be deleted in the next sprint
