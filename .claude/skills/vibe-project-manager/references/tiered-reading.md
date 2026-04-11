# Tiered Reading [focused]

## TIER 1 — Quick Task (bug fix, small isolated change)

**Required reads:**
- `wiki/dashboard.json` (quick_facts only)
- `wiki/bugs/{bug}.json` OR `wiki/features/{name}.json` (quick_facts + issue section)

**Conditional reads:**
- `wiki/api-contracts/{module}.json` (only if API is touched)

**Skip:** All other files.

**STOP READING WHEN:**
- [ ] I understand exactly what is broken or needs changing
- [ ] I know what file(s) to touch
- [ ] I know which tests must still pass after

---

## TIER 2 — Feature Work (adding to or modifying an existing feature)

**Required reads:**
- `wiki/dashboard.json`
- `wiki/features/{name}/progress.json` (what's already done)
- `wiki/features/{name}/impact-map.json` (regression scope)
- `wiki/api-contracts/{module}.json` (if API touched)

**Conditional reads:**
- `wiki/design/pages/{page}.json` (if UI is touched)
- `wiki/rulebook/coding-standards.json` (relevant section only)

**Skip:** `wiki/plan/`, `wiki/decisions/` (unless making a decision), `wiki/glossary.json`

**STOP READING WHEN:**
- [ ] I know what already exists that's relevant
- [ ] I know the API contract shape
- [ ] I know what other features will be affected
- [ ] I know which tests must still pass

---

## TIER 3 — New Feature Kickoff (first session of a brand new feature)

**Required reads:**
- `wiki/dashboard.json` (full content)
- `wiki/rulebook/_index.json` (scan only)
- `wiki/rulebook/techstack-decisions.json`
- `wiki/features/_index.json` (status_table scan only)
- `wiki/api-contracts/_index.json` (status_table scan only)
- `wiki/design/components/_index.json` (status_table scan only)
- `wiki/impact-map/_index.json` (status_table scan only)
- `wiki/impact-map/entity-registry.json`
- `wiki/test-cases/_index.json`
- Then: role-specific reads defined in each skill (vibe-ba, vibe-designer-uxui, etc.)

**STOP READING WHEN:**
- [ ] I know what modules and entities already exist
- [ ] I know which existing contracts overlap with this feature
- [ ] I know which existing components can be reused
- [ ] I know which existing test files cover related features
- [ ] I know which features share entities with this feature

---

## Over-Reading Prevention

**Do NOT read** unless directly relevant to the current task:
- `wiki/history/` (only read if changelog shows recent relevant change)
- `wiki/decisions/` (only read if making an architectural decision)
- `wiki/glossary.json` (only if a new term is being introduced)
- `wiki/plan/proposals/` (only during PO sessions)
- `wiki/business-workflow/` (only for new domain areas)

Use `content.skip_if` on every file to check if it should even be opened.
