# Completion Checklist [focused]

## PRE-WORK
- [ ] `wiki/dashboard.json` read — build status noted
- [ ] Changelog filtered — recent changes for this feature noted
- [ ] Tiered reading applied — correct tier selected
- [ ] Impact map read — `regression_test_ids` noted
- [ ] Pre-existing test failures logged to `wiki/bugs/` before touching code
- [ ] **`vibe-git`**: `develop` branch pulled, task branch created (`feature/*`, `fix/*`, etc.)
- [ ] **`vibe-git`**: Branch name confirmed and reported to user before any code written

## BUILD
- [ ] `npm run build` — backend (if touched) — must pass
- [ ] `npm run build` — frontend (if touched) — must pass
- [ ] `npm run type-check && npm run build` — wiki-app (if touched) — BOTH must pass with zero errors
- [ ] Every build error → `wiki/bugs/` entry (even if fixed immediately)
- [ ] **If entity files changed**: `./scripts/migrate.ps1 generate <Name>` — review generated SQL before committing
- [ ] **If new migration generated**: `./scripts/migrate.ps1 run` — verify it applies cleanly
- [ ] **Verify `migrate` service exits code 0**: `docker inspect eam_migrate --format "{{.State.ExitCode}}"`
- [ ] **HARD STOP**: Do not write wiki history or mark tasks "done" until all affected builds are green

## QA GATE ⛔ (mandatory — cannot skip)
- [ ] **`vibe-qa-general`** invoked — receives "implementation complete" signal from backend or frontend skill
- [ ] **`vibe-qa-stack`** invoked alongside `vibe-qa-general` for Vitest/RTL/Playwright specifics
- [ ] `wiki/test-cases/{feature}.json` created or updated — test case IDs, categories, pass/fail status
- [ ] `wiki/test-cases/_index.json` updated — new file listed

## TEST
- [ ] Backend unit tests: every new service method covered (mock repository pattern)
- [ ] Frontend unit tests: hooks with logic, utility functions, Zustand store actions covered
- [ ] Integration tests: every endpoint in API contract exercised (controller → test DB)
- [ ] Full unit test suite passes — zero regressions allowed
- [ ] Regression tests pass for all features in impact map entity registry
- [ ] Playwright E2E: happy-path acceptance criteria flow covered
- [ ] QA manual + UX review against wireframes (if UI changed)

## SECURITY (any new endpoint or auth change)
- [ ] All SEC-001 through SEC-010 rules checked
- [ ] No new env var added without DevOps review + `env-config.json` update

## CODE REVIEW
- [ ] `vibe-code-review` triggered after dev, before QA sign-off
- [ ] Implementation matches `coding-standards.json`
- [ ] Implementation matches `established_patterns` in `backend.json` or `frontend.json`

## ROLLBACK (if session cannot complete)
- [ ] `wiki/features/{name}/progress.json` updated with partial state
- [ ] `next_session_notes` written with exact resumption point
- [ ] Feature status set to "in-progress" — never "done" unless complete
- [ ] If code reverted: feature status → "planning", bug logged for what was attempted

## WIKI UPDATE
> ⚠️ `wiki/` folder deleted in Sprint 4.5. All updates go through MCP tools → wiki.db. Never write wiki/ files directly.

- [ ] `wiki_session_log(date, session)` — session entry written using scratch_notes (→ history table)
- [ ] `wiki_feature_update(id, patch)` — feature status + task states updated (→ features table)
- [ ] `wiki_contract_update(module, patch)` — updated if endpoints changed (→ api_contracts table)
- [ ] `env-config` page updated via DB if new env vars added
- [ ] `wiki_feature_update` for impact-map entity registry if entities modified
- [ ] Decision entry added (→ decisions table) for any architectural choice
- [ ] `techstack` pages updated via DB if new module, entity, route, or API client added
- [ ] `wiki_dashboard()` quick_facts refreshed
- [ ] Changelog entry prepended via MCP tool with relevant tags

## DONE
- [ ] All checklist items green
- [ ] `wiki_feature_list()` → feature ALL tasks status "done" confirmed
- [ ] No open critical or high bugs against this feature
- [ ] No open ux-regression bugs against this feature
- [ ] Wiki viewer reflects current state
- [ ] **`vibe-git`**: All changes committed with Conventional Commits messages
- [ ] **`vibe-git`**: Branch pushed to origin
- [ ] **`vibe-git`**: Merge Readiness Check passed (build ✅ tests ✅ wiki ✅ no secrets ✅)
- [ ] **`vibe-git`**: User alerted with BRANCH READY FOR REVIEW message
- [ ] **`vibe-git`**: User confirms review before merge to develop proceeds
