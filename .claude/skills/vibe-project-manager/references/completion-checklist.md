# Completion Checklist [focused]

## PRE-WORK
- [ ] `wiki/dashboard.json` read — build status noted
- [ ] Changelog filtered — recent changes for this feature noted
- [ ] Tiered reading applied — correct tier selected
- [ ] Impact map read — `regression_test_ids` noted
- [ ] Pre-existing test failures logged to `wiki/bugs/` before touching code

## BUILD
- [ ] `npm run build` — backend (if touched) — must pass
- [ ] `npm run build` — frontend (if touched) — must pass
- [ ] `npm run build` — wiki-app (if touched) — must pass
- [ ] Every build error → `wiki/bugs/` entry (even if fixed immediately)

## TEST
- [ ] Unit tests written for every new function, service, or component
- [ ] Full unit test suite passes — zero regressions allowed
- [ ] Regression tests pass for all features in impact map entity registry
- [ ] Playwright e2e passes for affected feature flows
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
- [ ] `history/{date}.json` — session entry written using scratch_notes
- [ ] `features/{name}/progress.json` — all task states updated
- [ ] `features/{name}.json` — status updated
- [ ] `api-contracts/` — updated if endpoints changed
- [ ] `env-config.json` — updated if new vars added
- [ ] `impact-map/entity-registry.json` — updated if entities modified
- [ ] `decisions/` — entry added for any architectural choice
- [ ] `techstack/backend.json` — updated if new module or entity added
- [ ] `techstack/frontend.json` — updated if new route, store, or API client added
- [ ] `dashboard.json` — quick_facts refreshed
- [ ] `changelog.json` — top entry added with relevant tags

## DONE
- [ ] All checklist items green
- [ ] `wiki/features/{name}/progress.json`: ALL tasks status "done"
- [ ] No open critical or high bugs against this feature
- [ ] No open ux-regression bugs against this feature
- [ ] Wiki viewer reflects current state
