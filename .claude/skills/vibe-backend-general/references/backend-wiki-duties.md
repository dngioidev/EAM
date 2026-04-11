# Backend Wiki Duties

## Required Updates Per Implemented Feature

After completing backend implementation, ALL of the following must be done:

---

## 1. Feature File Update

File: `wiki/features/{feature-id}.json`

- [ ] `meta.status` → depends on completeness:
  - `"in-progress"` if frontend not yet done
  - `"testing"` if backend complete, QA next
- [ ] `meta.last_updated` → today's date
- [ ] `meta.version` → increment by 1
- [ ] `audit` → append new audit entry with role "backend"

---

## 2. API Contract Update

File: `wiki/api-contracts/{module}.json`

- [ ] Note `implemented: true` in quick_facts
- [ ] If any deviation from contract was necessary:
  - Update contract version
  - Write comment in `sections` explaining deviation
  - Alert `vibe-api-contractor` for re-approval

---

## 3. History Entry

File: `wiki/history/{YYYY-MM-DD}.json`

Append to session log:
```json
{
  "role": "backend",
  "feature": "feature-id",
  "summary": "Implemented {X} endpoints for {module}. Tests written: {N}. Build clean.",
  "tasks_completed": ["T001", "T002"],
  "blockers": []
}
```

---

## 4. Decisions Entry (if applicable)

File: `wiki/decisions/{date}-{slug}.json`

Write a decision entry if:
- An architectural pattern was established that future engineers must follow
- A library was chosen over an alternative
- A business rule was clarified during implementation
- A workaround was used that will need future attention

---

## 5. Dashboard Update (if needed)

File: `wiki/dashboard.json`

If this was the last task in a feature:
- Move feature from `active_work` to `completed_features` (via PM)
- If feature is now blocked on QA → note in `active_work.current_blocker`

---

## Common Omission to Avoid

- Not updating `meta.version` — causes wiki conflict detection to miss updates
- Writing a history entry but forgetting to update the feature file — creates inconsistency
- Not writing a decision entry when a workaround was used — causes future confusion
