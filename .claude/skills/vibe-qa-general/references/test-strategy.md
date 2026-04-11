# Test Strategy

## Test Types in V-Smart Ledger

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit | Vitest + RTL | Functions, services, components in isolation | `src/**/*.spec.ts` |
| Integration | NestJS TestingModule + Supertest | Controller → service → real test DB | `src/**/*.e2e-spec.ts` |
| E2E | Playwright | Full user flows through browser | `e2e/**/*.spec.ts` |

---

## Unit Test Targets

**Backend — always unit test:**
- Service methods (mock repository)
- DTO validators (positive and negative cases)
- Custom decorators / guards
- Utility functions

**Frontend — always unit test:**
- Complex hooks with logic
- Utility/formatter functions
- Store actions
- Components with business logic in render output

**Do NOT unit test:**
- Trivial pass-through methods (getters/setters)
- React components that are purely presentational (use Playwright instead)

---

## Integration Test Targets

**Backend — always integration test:**
- Every endpoint in every API contract
- Database transactions (rollback behavior)
- Auth guard behavior (401/403 responses)

Integration tests use the test DB (port 5433), never the main DB.

---

## Playwright E2E Targets

**Always test with Playwright:**
- Full acceptance criteria flows (happy path)
- Auth flow: login → protected route → logout
- Critical paths: checkout, tax calculation, receipt generation
- Error state display (server errors shown correctly)

**Do NOT Playwright test:**
- Individual component states (use RTL instead)
- API-only behavior (use integration tests instead)

---

## Test Data Management

1. Use seed fixtures from `src/database/seeds/` — deterministic UUIDs
2. Each test clears its own state (not relying on test order)
3. Bank on `beforeEach` cleanup, not `afterEach` — failures still clean state
4. Never test against production or staging database

---

## Coverage Report Interpretation

```bash
npm run test:coverage   # generates HTML report in coverage/
```

Red = below 80% threshold — must fix before sprint close.
Yellow = 80–90% — acceptable, note in sprint retro.
Green = >90% — ideal.
