# Frontend Wiki Duties

## Required Updates Per Implemented Feature

After completing frontend implementation, ALL of the following must be done:

---

## 1. Feature File Update

File: `wiki/features/{feature-id}.json`

- [ ] `meta.status` → `"testing"` (both backend + frontend done)
- [ ] `meta.last_updated` → today's date
- [ ] `meta.version` → increment by 1
- [ ] `audit` → append frontend audit entry

---

## 2. Design File Sync

If implementation deviated from design spec (acceptable for minor Tailwind adjustments):

File: `wiki/design/pages/{screen}.json`

- [ ] Update any fields that differ from implementation
- [ ] Note: "Implementation note: {what changed and why}"

If a new component was created that is reusable:
File: `wiki/design/components/{component}.json`
- [ ] Create new component spec entry

---

## 3. History Entry

File: `wiki/history/{YYYY-MM-DD}.json`

```json
{
  "role": "frontend",
  "feature": "feature-id",
  "summary": "Implemented {ScreenName}. Components built: {list}. Tests written: {N}.",
  "tasks_completed": ["T003", "T004"],
  "blockers": []
}
```

---

## 4. Generated Types Verification

After any backend change:
- [ ] Run `npm run generate:types` (or equivalent) to refresh `src/types/`
- [ ] Verify no compile errors from new types
- [ ] Do NOT manually edit generated type files

---

## 5. Dashboard Update (if feature fully complete)

If this is the last task in a feature (backend + frontend + design done):
- [ ] Notify `vibe-project-manager` to update `dashboard.json`
- [ ] Feature moves from `active_work` to `completed_features` in next session log

---

## Design Deviation Log

If any design deviation was made during implementation:

```json
{
  "deviation_reason": "Design spec showed a date picker modal — component not available in shadcn/ui, used inline text input with validation instead",
  "approved_by": "po",
  "date": "YYYY-MM-DD"
}
```

Add this to the `sections` of the feature file. PO must acknowledge.
