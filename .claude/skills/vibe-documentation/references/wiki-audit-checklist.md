# Wiki Audit Checklist

## Sprint-End Full Audit (45-60 min)

Run this checklist at the end of every sprint. Documentation cannot be marked complete until all items pass.

---

## Section 1: File Counts

- [ ] Count files in `wiki/features/` (excluding `_index.json`)
- [ ] Verify `wiki/features/_index.json → files[]` has same count
- [ ] Count files in `wiki/bugs/` (excluding `_index.json`)
- [ ] Verify `wiki/bugs/_index.json → files[]` has same count
- [ ] Count files in `wiki/decisions/` (excluding `_index.json`)
- [ ] Verify index has same count

---

## Section 2: Status Accuracy

For every feature in `wiki/features/`:
- [ ] `meta.status` reflects the actual current state
- [ ] `quick_facts.status_reason` explains the current status
- [ ] `meta.last_updated` ≤ 14 days ago or has explanation

For every bug in `wiki/bugs/`:
- [ ] All "open" bugs more than 2 sprints old are reviewed with PM
- [ ] All "resolved" bugs have `content.fix_applied` field filled
- [ ] All "resolved" bugs have QA verification step

---

## Section 3: Changelog Currency

File: `wiki/changelog.json`

- [ ] Last entry date matches last sprint close date
- [ ] All features completed this sprint appear in changelog
- [ ] All bugs resolved this sprint appear in changelog
- [ ] All hotfixes from this sprint appear with `tags: ["hotfix"]`

---

## Section 4: Onboarding Verification

File: `wiki/onboarding.json`

Perform a dry run in a fresh environment:
- [ ] Step 1: Clone repo — does it work?
- [ ] Step 2: Copy `.env.example` → fill values — are all vars documented?
- [ ] Step 3: `docker-compose up` — does it start without errors?
- [ ] Step 4: Run migrations — do they complete cleanly?
- [ ] Step 5: Access frontend at port 5173 — does it load?
- [ ] Step 6: Login — does auth flow work?

If any step fails → update onboarding.json with correct steps before marking complete.

---

## Section 5: Glossary Currency

File: `wiki/glossary.json`

- [ ] Every technical term introduced this sprint is defined
- [ ] Vietnamese business terms used in feature descriptions are in glossary
- [ ] No terms reference old/deprecated concepts

---

## Section 6: Schema Compliance Spot Check

Pick 3 random files from `wiki/features/` and 2 from `wiki/bugs/`:
- [ ] `meta.version` is an integer (not string)
- [ ] `meta.last_updated` is in `YYYY-MM-DD` format
- [ ] `content.tldr` is ≤ 3 lines
- [ ] `audit` array has at minimum a "created" entry

---

## Audit Result

Write the audit result to `wiki/history/{YYYY-MM-DD}.json`:

```json
{
  "role": "documentation",
  "action": "sprint-wiki-audit",
  "sprint": "<N>",
  "result": "pass | fail",
  "issues_found": [],
  "issues_resolved": [],
  "notes": ""
}
```
