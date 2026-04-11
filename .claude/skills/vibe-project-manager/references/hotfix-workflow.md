# Hotfix Workflow [focused]

## HOTFIX WORKFLOW — Critical Bugs Only

Bypasses normal feature kickoff. Only for `severity: "critical"` bugs.

---

## Steps

**1. PM reads bug entry — confirm severity is "critical"**
- Read `wiki/bugs/{date}-{slug}.json`
- Verify `quick_facts.severity === "critical"`
- If not critical → use normal bug fix flow (Tier 1 → vibe-qa-general)

**2. vibe-ba: impact assessment only (15 min max, NO full breakdown)**
- Which entities are touched?
- Which tests must pass after the fix?
- Write findings as comment in bug file, NOT a new breakdown.json

**3. vibe-security-general: is this a security incident?**
- If YES → follow `rotation_protocols` from `wiki/rulebook/security-rules.json`
- Secrets involved? → Rotate ALL affected credentials before any code fix
- Auth bypass? → Take affected service offline if needed
- If not security-related → continue to step 4

**4. Role implements the fix (Backend or Frontend)**
- Implement minimal fix only — no refactoring, no improvements
- Build must pass before continuing

**5. vibe-qa-general: expedited check**
- Write unit test for the specific fix
- Write Playwright test for the affected flow only
- Full regression suite NOT required for hotfix (run for affected area only)

**6. vibe-devops-general: deploy**
- Deploy to staging → verify health checks pass → verify fix resolves bug
- Deploy to production → verify health checks pass
- Monitor for 15 minutes post-deploy

**7. Wiki updates**
- `wiki/bugs/{date}-{slug}.json` → status "resolved", `fix_applied` + `verification` filled
- `wiki/history/{date}.json` → write hotfix session entry
- `wiki/changelog.json` → prepend entry with tags ["hotfix", "critical", affected-module]

**8. Post-mortem (within 48 hours)**
- Write `wiki/decisions/{date}-hotfix-postmortem-{slug}.json`
- Required fields:
  - `context`: what led to this bug reaching production
  - `decision`: what was the fix
  - `consequences.negative`: what systemic issue allowed this
  - `revisit_if`: what prevention was added or needs adding

---

## What Hotfix Does NOT Do

- Does NOT require full BA breakdown
- Does NOT require full wireframe update (unless UI was broken)
- Does NOT require full QA two-pass test case writing
- Does NOT require code review cycle (PM signs off directly)
- Does STILL require a build to pass
- Does STILL require a targeted unit + e2e test

---

## Hotfix Cancellation Criteria

Stop hotfix if:
- Bug cannot be reproduced in staging
- Fix requires a breaking DB schema change (escalate to PM for sprint planning)
- Security rotation requires coordinated downtime (escalate to scheduled maintenance window)
