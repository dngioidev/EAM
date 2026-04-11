# Two-Pass Test Cases

## What Is Two-Pass Test Writing?

All tests are written in two passes:
1. **Pass 1**: Happy path — all ACs pass with valid inputs
2. **Pass 2**: Edge cases — boundary conditions, error paths, unauthorized access

Both passes must be complete before QA sign-off.

---

## Pass 1: Happy Path Template

For each acceptance criterion from the feature file:

```
Feature: Checkout with Promotion Code
AC: "Given a valid promotion code, when applied, then total is recalculated"

Test ID: TC-CHECKOUT-001
Test Name: Apply valid promotion code → total recalculated
Setup:
  - Authenticated as Cashier
  - Order with 2 items, total = 200,000 VND
  - Valid code "SUMMER10" exists, 10% off, not expired
Steps:
  1. POST /api/promotions/validate { code: "SUMMER10", orderId: "..." }
  2. Apply to order
Action: GET /api/orders/{id}
Assert: total === 180,000 (10% off 200,000)
```

---

## Pass 2: Edge Case Template

```
Test ID: TC-CHECKOUT-002
Test Name: Apply expired promotion code → rejection with error
Setup: Code "SUMMER10" exists but expired 2024-01-01
Steps:
  1. POST /api/promotions/validate { code: "SUMMER10", orderId: "..." }
Assert:
  - Status 422
  - Error code: PROMO_EXPIRED
  - Order total unchanged

Test ID: TC-CHECKOUT-003
Test Name: Apply promo code to order below minimum → rejection
Setup: Code requires minimum order 500,000, order total is 200,000
Assert:
  - Status 422
  - Error code: PROMO_MIN_ORDER_NOT_MET
  - Message includes minimum order amount

Test ID: TC-CHECKOUT-004
Test Name: Apply promo code without auth → 401
Setup: No JWT
Assert: Status 401
```

---

## Test Case Wiki Entry

Each test case set gets an entry in `wiki/test-cases/`:

```json
{
  "feature_id": "feature-checkout",
  "test_suite": "checkout-promo-codes",
  "pass_1_count": 3,
  "pass_2_count": 6,
  "all_green": true,
  "last_run": "YYYY-MM-DD",
  "coverage_areas": ["PromotionService", "OrderService", "e2e/checkout"]
}
```

---

## Test Case IDs

Format: `TC-{MODULE}-{NNN}` — always 3-digit padded number.
Examples: `TC-AUTH-001`, `TC-ORDERS-045`, `TC-CHECKOUT-003`

Check `wiki/test-cases/_index.json` before assigning next number.
