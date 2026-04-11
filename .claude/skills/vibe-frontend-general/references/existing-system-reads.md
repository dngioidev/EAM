# Existing System Reads (Frontend)

## When to Use This Guide

Run through this checklist BEFORE modifying any existing frontend code. Prevents component duplication, state conflicts, and API mismatch.

---

## Tier 1 (Bug Fix) — Minimal Reads

1. `wiki/bugs/{date}-{slug}.json` — understand the failure and affected area
2. The specific component file listed in bug reproduction steps
3. The relevant test file

**Stop**: fix, write test, verify build passes.

---

## Tier 2 (Extend Screen / Add Feature to Existing Page) — Targeted Reads

1. `wiki/design/pages/{screen}.json` — current design spec
2. `wiki/api-contracts/{module}.json` — the API request/response shape
3. `src/pages/{screen}.tsx` — existing page code
4. `src/features/{feature}/` — all files in the feature folder
5. `src/hooks/use{Module}.ts` — existing hooks for this domain
6. `wiki/features/{feature-id}.json` — acceptance criteria

**Stop**: implement, update existing tests or add new ones, wiki-update.

---

## Tier 3 (New Screen / New Feature) — Comprehensive Reads

1. `wiki/design/pages/{screen}.json` — complete read
2. `wiki/api-contracts/{module}.json` — complete read
3. `wiki/features/{feature-id}.json` — complete read
4. `wiki/design/design-system.json` — component inventory
5. `wiki/rulebook/coding-standards.json` — coding standards
6. `src/router/` — existing routes to understand routing patterns
7. `src/stores/` — existing Zustand stores to understand global state
8. `src/lib/api.ts` — existing API client setup
9. `src/types/` — existing generated types

**Stop**: build component tree, implement, test, wiki-update.

---

## Component Discovery Checklist

Before building any new component:
- [ ] Check `wiki/design/design-system.json → components` inventory
- [ ] Check `src/components/ui/` for atoms
- [ ] Check `src/components/` for molecules/organisms
- [ ] Check `src/features/` for domain-specific components

If found: extend, don't duplicate.

---

## Hook Naming Convention

```typescript
// Data hooks: use[Entity][Action]
useOrdersList()         // lists
useOrderDetail(id)      // single item
useCreateOrder()        // mutation
useUpdateOrderStatus()  // mutation

// UI hooks: use[Behavior]
useDisclosure()         // modal open/close
usePagination()         // pagination state
useCurrencyFormatter()  // currency utility
```
