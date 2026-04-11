# User Story Patterns

## Story Format

```
As a [actor], I want [action] so that [benefit].
```

**Key rules:**
- Actor must be from `wiki/impact-map/entity-registry.json` actors section
- Action must be observable by the system
- Benefit must align with a business goal in the feature's impact map

---

## Acceptance Criteria Format (Gherkin-style)

```
Given [initial context]
When  [trigger action]
Then  [observable outcome]
```

**Every story must have:**
- At least 3 acceptance criteria
- At least 1 negative/error case
- Vietnamese business terms where needed (add to glossary)

---

## Story Sizing Guide

| Size | Hours | Notes |
|------|-------|-------|
| XS   | < 2   | Read-only, no DB change |
| S    | 2–4   | Single endpoint + unit tests |
| M    | 4–8   | Full CRUD + contract + tests |
| L    | 8–16  | Multi-table, event-driven |
| XL   | > 16  | Must be split — never accept XL stories |

---

## Common Actors in V-Smart Ledger

- **Cashier** (Thu ngân) — daily transaction operations
- **Store Manager** (Quản lý cửa hàng) — reports, approvals
- **Accountant** (Kế toán) — tax reconciliation, exports
- **System Admin** (Quản trị hệ thống) — configuration, audit logs
- **Tax Inspector** (Kiểm toán thuế) — read-only audit access

---

## Dependency Declaration

When a story depends on another feature:
```json
"depends_on": ["feature-auth", "feature-products"]
```

Stories from blocked features are NOT added to sprint backlog.

---

## Anti-Patterns to Reject

- "As a user, I want to..." — too vague, specify actor role
- Stories that mix UI and backend in one — split by layer
- Stories without acceptance criteria — incomplete, send back to PO
- Stories that say "system should" — must have human actor perspective
