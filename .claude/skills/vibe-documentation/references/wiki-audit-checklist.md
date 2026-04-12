# Wiki Audit Checklist

> ⚠️ `wiki/` JSON folder was deleted in Sprint 4.5. All wiki data lives in `wiki.db`.
> Use MCP tools, the `/admin` UI (port 3001), or sqlite-web (port 8082) — never reference `wiki/` paths.

## Sprint-End Full Audit (45-60 min)

Run this checklist at the end of every sprint. Documentation cannot be marked complete until all items pass.

---

## Section 1: Row Counts (use `/admin` at :3001 or sqlite-web at :8082)

- [ ] `features` table: row count matches expected number of features
- [ ] `bugs` table: row count matches known bug list
- [ ] `decisions` table: row count matches known decisions
- [ ] `api_contracts` table: all modules with approved contracts are present

---

## Section 2: Status Accuracy

Via `wiki_feature_list()` MCP tool or `/wiki/features` wiki-app page:
- [ ] `meta.status` for every feature reflects the actual current state
- [ ] `quick_facts.status_reason` explains the current status
- [ ] `meta.last_updated` ≤ 14 days ago or has explanation

Via `wiki_bug_list()` MCP tool or `/wiki/bugs` wiki-app page:
- [ ] All "open" bugs more than 2 sprints old are reviewed with PM
- [ ] All "resolved" bugs have `content.fix_applied` field filled
- [ ] All "resolved" bugs have QA verification step

---

## Section 3: Changelog Currency

Source: `changelog` table — view at `http://localhost:3001/wiki/changelog`

- [ ] Last entry date matches last sprint close date
- [ ] All features completed this sprint appear in changelog
- [ ] All bugs resolved this sprint appear in changelog
- [ ] All hotfixes from this sprint appear with `tags: ["hotfix"]`

---

## Section 4: Onboarding Verification

Source: `pages` table, `section='onboarding'` — view at `http://localhost:3001/wiki/onboarding`

Perform a dry run in a fresh environment:
- [ ] Step 1: Clone repo — does it work?
- [ ] Step 2: Copy `.env.example` → fill values — are all vars documented?
- [ ] Step 3: `docker compose up` — does it start without errors?
- [ ] Step 4: Run migrations — do they complete cleanly?
- [ ] Step 5: Access frontend at port 5173 — does it load?
- [ ] Step 6: Login — does auth flow work?

If any step fails → update onboarding via `wiki_session_log()` or direct DB update before marking complete.

---

## Section 5: Glossary Currency

Source: `pages` table, `section='glossary'` — view at `http://localhost:3001/wiki/glossary`

- [ ] Every technical term introduced this sprint is defined
- [ ] Vietnamese business terms used in feature descriptions are in glossary
- [ ] No terms reference old/deprecated concepts

---

## Section 6: Schema Compliance Spot Check

Pick 3 features from `wiki_feature_list()` and 2 bugs from `wiki_bug_list()`. Inspect via `/admin` JSON expand:
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
