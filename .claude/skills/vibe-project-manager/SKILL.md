---
name: vibe-project-manager
description: >
  Master orchestrator for the vibe fullstack project. This skill triggers first
  on every single request before any other skill runs. Triggers on: any feature
  request, bug report, planning question, architecture decision, "what next",
  "let's build", "start", "fix", "add", "create", "vibe", or any request that
  touches the project at all. Reads wiki, detects project state, applies tiered
  reading, routes to the correct role skill, and enforces the completion checklist.
  Never skip this skill — it is the mandatory entry point for all work.
applyTo: "**"
---

# vibe-project-manager — Master Orchestrator

---

## ⛔ HARD GATE — Branch Before Code

This rule overrides everything else in this skill.

**BEFORE calling any role skill that writes code or files:**
**BEFORE using Edit / Write / Bash to modify any file in `backend/`, `frontend/`, `wiki-app/`, or `wiki/`:**

→ `vibe-git` MUST be invoked  
→ `vibe-git` MUST confirm: *"Branch created: {name} — Ready to begin"*  
→ Only THEN may any other skill or file-editing tool run

```
Does this request touch code or files?
  YES → invoke vibe-git FIRST → wait for branch confirmation → then proceed
  NO  → (planning / review / design only) → skip vibe-git
```

**If you catch yourself about to write a file and no branch has been confirmed this session → STOP. Run vibe-git now.**

Violation example from this project (2026-04-12): implemented all wiki-app readability fixes on `develop` before invoking `vibe-git`. Branch was created retroactively. This pattern MUST NOT repeat.

---

## 1. Session Start Protocol

Every session, in this exact order:

**STEP 0: Verify current branch — runs before anything else**
```bash
git branch --show-current
```
| Result | Action |
|---|---|
| `develop` | ✅ Correct — proceed to STEP 1 |
| `main` | 🛑 HARD STOP — never work from `main`. Tell user and ask them to confirm checkout to `develop` |
| `feature/*`, `fix/*`, `chore/*`, etc. | ⚠️ ALERT user: *"You are on branch '{name}', not develop. Checking out develop before starting new work."* — then `git checkout develop && git pull origin develop` — confirm to user before proceeding |

Report the current branch to the user at the start of every session regardless of which case applies. Never silently skip this step.

**STEP 1: Read wiki/dashboard.json**
- Check `is_new_project`: if `true` AND `project_initialized` is `null`
  → Run PROJECT INITIALIZATION (see `references/project-init.md`)
  → Do not proceed to routing until initialization is complete
- Check `quick_facts.build_status`: if any "failing"
  → Note which services are failing
  → Log as pre-existing bug BEFORE touching any code
- Note: `existing_modules`, `existing_entities`, `existing_routes`

**STEP 2: Read wiki/changelog.json**
- Filter entries by tags matching current request's feature or module
- If any entry newer than 3 days matches: read that `wiki/history/{date}.json`
- This answers "what changed since last session"

**STEP 3: Apply TIERED READING** — see `references/tiered-reading.md`
- Choose the correct tier for this request type
- Stop reading when all STOP READING questions are answered

**STEP 4: Open scratch note**
- Append to `wiki/history/{date}.json` `scratch_notes` as you work
- Format: `"[action] — [file changed or decision made]"`
- Use this at end of session for accurate wiki updates

---

## 2. New vs Existing Project Detection

```
wiki/dashboard.json → is_new_project: true AND project_initialized: null
  → This is a brand new project
  → Run references/project-init.md before any feature work
  → project-init.md covers: folder scaffold, package installs,
    docker-compose setup, wiki initialization, initial build verification

wiki/dashboard.json → is_new_project: false
  → Existing project — proceed to tiered reading and routing
```

---

## 3. Blocked Feature Check (Sprint Start)

At start of every new sprint:
- Read `wiki/dashboard.json` `blocked_features` array
- For each blocked feature:
  - Check if `unblock_condition` is now satisfied
  - If satisfied: update feature status to "planning", notify PO
  - If not: leave blocked, update `wiki/history` with check date

---

## 4. Routing Table

See `references/routing-table.md` for the complete routing table across all 18+ request types.

Quick reference:
- New requirement → `vibe-product-owner` (Tier 3)
- Feature kickoff → `vibe-git` (branch) → `vibe-ba` → `vibe-designer-uxui` → `vibe-api-contractor` (Tier 3)
- Backend task → `vibe-git` (branch) → `vibe-backend-general` → `vibe-backend-nestjs` (Tier 2)
- Frontend task → `vibe-git` (branch) → `vibe-frontend-general` → `vibe-frontend-react` (Tier 2)
- Bug fix → `vibe-git` (fix branch) → `vibe-qa-general` → role skill (Tier 1)
- Critical bug → HOTFIX workflow (see `references/hotfix-workflow.md`)

---

## 5. Tiered Reading

See `references/tiered-reading.md` for full tier definitions.

Summary:
- **Tier 1** — Bug fix / small isolated change: minimal reads
- **Tier 2** — Existing feature work: targeted reads
- **Tier 3** — New feature kickoff: comprehensive reads

---

## 6. Completion Checklist

See `references/completion-checklist.md` for the full checklist.

Every session must pass: **GIT BRANCH** → BUILD → TEST → SECURITY → CODE REVIEW → WIKI UPDATE → **GIT COMMIT + ALERT** → DONE.

---

## 7. Wiki Update Protocol

At end of every session (use `scratch_notes` for accuracy):
- `wiki/history/{date}.json` — write full session entry
- `wiki/features/{name}/progress.json` — update task completion states
- `wiki/features/{name}.json` or `_index.json` — update status
- `wiki/api-contracts/{module}.json` — if endpoints changed
- `wiki/env-config.json` — if new vars added
- `wiki/impact-map/entity-registry.json` — if entities modified
- `wiki/impact-map/{feature}-relations.json` — if new relations found
- `wiki/decisions/` — entry if architectural decision made
- `wiki/techstack/backend.json` — if new module, entity, or pattern added
- `wiki/techstack/frontend.json` — if new route, store, API client, or query key added
- `wiki/dashboard.json` — refresh all quick_facts
- `wiki/changelog.json` — prepend new entry with relevant tags

---

## Do Not

- **NEVER edit or create any file before vibe-git has confirmed branch creation** ← highest priority
- **NEVER invoke a role skill (backend, frontend, qa, etc.) before vibe-git has confirmed branch creation**
- Never skip reading `wiki/dashboard.json` at the start of any session
- Never route to a Layer 2 skill without going through the Layer 1 general skill first
- Never mark a feature "done" without completing the full completion checklist
- Never start feature dev without an approved API contract
- Never skip the wiki update protocol at session end
- Never initialize a new project without completing ALL 6 initialization steps

---

## Definition of Done

```
[ ] wiki/dashboard.json read — build status noted
[ ] Changelog filtered — "what changed since last session" answered
[ ] Correct tier applied — tiered reading complete
[ ] vibe-git invoked at session start — branch created from develop
[ ] Correct skill routed based on routing table
[ ] Completion checklist passed at session end
[ ] vibe-git invoked at session end — commits made, user alerted for merge
[ ] Wiki update protocol executed at session end
```
