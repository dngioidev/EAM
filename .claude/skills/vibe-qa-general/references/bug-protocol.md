# Bug Protocol

## Bug Severity Classification

| Severity | Definition | Response |
|----------|------------|---------|
| `critical` | Data loss, security breach, service down, financial miscalculation | Hotfix NOW — stop sprint work |
| `high` | Core feature broken for most users, no workaround | Fix this sprint — highest priority |
| `medium` | Feature partially broken, workaround exists | Next sprint unless capacity allows |
| `low` | Minor UI issue, rare edge case | Backlog |
| `ux-regression` | Visual/UX broke but data is correct | Next sprint unless user-facing launch |

---

## Bug File Template

File name: `wiki/bugs/{YYYY-MM-DD}-{kebab-slug}.json`

Required fields:
- `quick_facts.severity` — from classification above
- `content.reproduction.steps` — exact numbered steps to reproduce
- `content.reproduction.expected` — what should happen
- `content.reproduction.actual` — what actually happens
- `content.reproduction.environment` — which environment, seed state

---

## Reproduction Completeness Requirement

A bug report is NOT accepted if:
- Steps cannot be followed by another engineer from scratch
- Environment is not specified
- The "actual" behavior is not described (only "it doesn't work")
- Severity is not assigned

Return to reporter with specific missing fields noted.

---

## Bug Lifecycle

```
open → in-progress → resolved → verified → closed
            ↓
         wont-fix (with justification)
```

Status transitions:
- `open` → assigned to fixer → `in-progress`
- `in-progress` → fix committed, returns to QA → `resolved`
- `resolved` → QA verifies fix in staging → `verified`
- `verified` → deployed to production → `closed`
- Any status → `wont-fix` requires PM approval and written justification

---

## Duplicate Bug Detection

Before filing a new bug:
1. Read `wiki/bugs/_index.json` — check recent bugs
2. Search by affected area and error description
3. If duplicate found → add note to existing bug file instead of creating new

---

## Bug-to-Test Pipeline

Every `critical` and `high` bug must produce a regression test:
1. Write a failing test that reproduces the bug
2. Implement the fix
3. Verify the test is now green
4. The test stays in the suite permanently — it's a regression guard

If no test can be written (pure config/environment bug):
- Write manual test steps in the bug file
- Add to QA manual checklist in `wiki/test-cases/manual-checks.json`
