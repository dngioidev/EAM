---
name: vibe-git
description: |
  Layer 1 Git Version Control for EAM. Manages all git branching, committing, and merge readiness workflows. Activates automatically before any feature, fix, chore, or hotfix work begins, and again at session end. Enforces branch-per-task discipline from develop. Alerts user for review and merge when work is complete.

  LAYER 1 — Role-General. Activates at START and END of every coding session.
  BRANCH GUARD: Every task starts on a new branch from develop. NEVER commit directly to develop or main.
applyTo: "**"
---

# vibe-git — Git Version Control

## Role

Git Version Control Engineer. Creates branches, writes commits, and manages merge readiness. Activates at the **start** of every feature/fix/chore/hotfix and at the **end** of every completed session. Does NOT implement code — that belongs to the appropriate role skill. Does NOT deploy — that belongs to `vibe-devops-general`.

---

## Activation Criteria

**Activate at SESSION START** whenever:
- A feature task is about to begin
- A bug fix is about to begin
- A hotfix is about to begin
- A chore (docs update, refactor, dependency bump) is about to begin
- The current branch is `develop` or `main` and code work is requested

**Activate at SESSION END** whenever:
- Any file in `backend/`, `frontend/`, `wiki-app/`, or `wiki/` was modified
- The task or subtask is declared complete
- The user says "done", "finished", "ready to merge", or equivalent

---

## Branch Naming Convention

```
feature/{feature-id}-{short-slug}     ← new feature work
fix/{bug-id}-{short-slug}             ← bug fix (non-critical)
hotfix/{bug-id}-{short-slug}          ← critical production bug (see hotfix-workflow.md)
chore/{short-slug}                    ← docs, dependency bumps, config changes
refactor/{module}-{short-slug}        ← code refactoring with no feature change
test/{module}-{short-slug}            ← adding or fixing tests only
release/{semver}                      ← release preparation branch (PM-approved only)
```

**Rules:**
- `{feature-id}` and `{bug-id}` must match the corresponding `wiki/features/` or `wiki/bugs/` entry slug
- `{short-slug}` is lowercase, hyphenated, max 30 characters
- Never use spaces, underscores, or uppercase in branch names
- Branch MUST always be created from `develop` — verify before creating

---

## Session Start Protocol (Branch Setup)

Run this **before any code changes**:

### Step 1 — Verify clean state
```bash
git status
```
- If uncommitted changes exist AND current branch is `develop` or `main`:
  → **LATE INVOCATION DETECTED** — code was written before vibe-git was called
  → Report this violation to the user immediately:
    ```
    ⚠️  BRANCH GATE VIOLATION
    Files were modified on '{current-branch}' before a task branch was created.
    This is a protocol violation (vibe-project-manager HARD GATE).
    Recovering: will create the task branch now — uncommitted changes will carry over.
    ```
  → Then proceed with branch creation (changes carry over via `git checkout -b`)
  → Do NOT silently skip this warning
- If uncommitted changes exist on a feature/fix/* branch: ask user whether to stash or commit first
- NEVER silently discard uncommitted changes

### Step 2 — Verify base branch and alert if wrong
```bash
git branch --show-current
```

Check the result before doing anything else:

| Current branch | Action |
|---|---|
| `develop` | ✅ Expected. Run `git pull origin develop` and continue. |
| `main` | 🛑 HARD STOP. Report: *"On main — cannot start work here. Please confirm: shall I checkout develop?"* Wait for user confirmation before any checkout. |
| `feature/*`, `fix/*`, `chore/*`, `refactor/*`, `test/*` | ⚠️ ALERT user: *"Currently on '{branch}' — not develop. Checking out develop as base for new task."* Then: `git checkout develop && git pull origin develop`. Confirm to user before proceeding. |

Always report the branch name and action taken. Never silently switch branches.

### Step 3 — Determine branch name
- Read the task from `wiki/features/{name}/progress.json` or `wiki/bugs/`
- Apply naming convention above
- Confirm branch name with user if ambiguous

### Step 4 — Create and switch to branch
```bash
git checkout -b {branch-name}
```

### Step 5 — Confirm to user
Report back:
```
Branch created: {branch-name}
Base: develop (up to date)
Ready to begin: {task description}
```

---

## Commit Conventions

All commits use **Conventional Commits** format:

```
{type}({scope}): {short description}

[optional body — what and why, not how]

[optional footer — refs to wiki, breaking changes]
```

### Types
| Type | When to use |
|---|---|
| `feat` | New feature code |
| `fix` | Bug fix |
| `docs` | Documentation or wiki changes only |
| `refactor` | Code change with no behavior change |
| `test` | New or updated tests only |
| `chore` | Deps, config, tooling — no src change |
| `style` | Formatting only |
| `perf` | Performance improvement |
| `security` | Security fix or hardening |

### Scope
Use the module or area touched: `auth`, `stores`, `users`, `orders`, `invoice`, `wiki`, `docker`, `backend`, `frontend`, `db`

### Examples
```
feat(auth): add JWT refresh token endpoint

Implements POST /api/auth/refresh per wiki/api-contracts/auth.json.
Returns new access token if refresh token is valid and not expired.

Refs: wiki/features/auth.json task T-AUTH-05
```

```
fix(stores): correct VAT calculation rounding error

Bug reported in wiki/bugs/2026-04-12-store-vat-rounding.json.
Uses toFixed(2) to ensure 2 decimal precision per VND display rules.
```

### Commit Frequency Rules
- Commit after each **logically complete unit** — a DTO, a service method, a component, a migration
- Do NOT accumulate giant commits spanning multiple files with unrelated changes
- Do NOT commit broken code — build must pass at every commit point (unless mid-session WIP)
- Use `git commit --no-verify` ONLY with explicit user permission

---

## Session End Protocol (Commit & Merge Readiness)

Run this **after all code changes are complete and build passes**:

### Step 1 — Stage and review changes
```bash
git diff --stat
git status
```
Report the file list to the user for confirmation.

### Step 2 — Stage all relevant changes
```bash
git add {files}
```
- Stage only files relevant to this task
- Do NOT stage unrelated changes (e.g., `.env` files, editor artifacts)
- Always check `.gitignore` is correct before staging

### Step 3 — Commit with conventional message
```bash
git commit -m "{type}({scope}): {description}"
```

### Step 4 — Push branch
```bash
git push origin {branch-name}
```

### Step 5 — Merge Readiness Check

Before alerting user, verify all of the following are TRUE:

```
[ ] Build passes: npm run build (backend and/or frontend)
[ ] Tests pass: npm run test
[ ] Wiki updated: wiki/history/{date}.json written
[ ] Feature progress updated: wiki/features/{name}/progress.json
[ ] No unresolved TODO or FIXME comments added in this session
[ ] No secrets or .env values committed
[ ] Branch is up to date with develop (no divergence)
```

If ANY item is false — do NOT alert for merge. Fix the failing item first.

### Step 6 — Alert user for review

When all checks pass, alert the user with this exact format:

```
─────────────────────────────────────────────────────
  BRANCH READY FOR REVIEW
─────────────────────────────────────────────────────
  Branch : {branch-name}
  Base   : develop
  Commits: {N} commit(s)

  Changes summary:
  {bullet list of what was implemented}

  Checklist:
  ✅ Build passes
  ✅ Tests pass
  ✅ Wiki updated
  ✅ No secrets committed

  ACTION REQUIRED:
  Please review the changes on branch '{branch-name}'
  and merge into develop when approved.

  Suggested merge command (after review):
    git checkout develop
    git merge --no-ff {branch-name}
    git push origin develop
─────────────────────────────────────────────────────
```

---

## Branch Lifecycle

```
develop
  └─ feature/xxx    ← created here, worked here
       └─ commits   ← conventional commits
  └─ merged back to develop (after user review)
  └─ branch deleted after merge

main
  └─ never touched during feature work
  └─ only updated by release/* branches (PM-approved)
```

**Branch deletion after merge (user-initiated or on request):**
```bash
git branch -d {branch-name}
git push origin --delete {branch-name}
```

---

## Stash Protocol

When switching context mid-session without completing:

```bash
git stash push -m "{feature-id}: WIP — {what was in progress}"
```

Record the stash in `wiki/features/{name}/progress.json` under `next_session_notes`.

To resume:
```bash
git stash list
git stash pop
```

---

## Merge Conflict Resolution

If `git pull origin develop` produces conflicts:

1. **Stop** — do not auto-resolve
2. List conflicting files: `git diff --name-only --diff-filter=U`
3. Report to user with the conflicting files
4. Resolve files one by one — always prefer the most up-to-date logic
5. After resolution: `git add {resolved-file}` then `git merge --continue`
6. Re-run build + tests before committing

---

## Forbidden Actions

- NEVER `git push --force` on `develop` or `main`
- NEVER `git reset --hard` without explicit user confirmation
- NEVER commit directly to `develop` or `main`
- NEVER amend a pushed commit without user consent
- NEVER commit `.env`, `*.key`, `*.pem`, or any secret file
- NEVER use `git commit -a` blindly — always review staged files first
- NEVER squash or rebase shared branches without explicit user instruction

---

## Integration with Other Skills

| When | What vibe-git does |
|---|---|
| `vibe-project-manager` starts a task | vibe-git creates branch from develop |
| `vibe-backend-general` / `vibe-frontend-general` finishes implementation | vibe-git commits each logical unit |
| `vibe-qa-general` finishes tests | vibe-git commits test files |
| `vibe-documentation` finishes wiki updates | vibe-git commits wiki changes |
| All completion checklist items pass | vibe-git alerts user for merge |
| `hotfix-workflow.md` step completes | vibe-git commits hotfix on `hotfix/*` branch |

---

## Definition of Done

```
[ ] Branch created from develop (not from another feature branch)
[ ] All commits follow Conventional Commits format
[ ] No broken-state commits (build passed at each commit)
[ ] Branch pushed to origin
[ ] Merge Readiness Check passed
[ ] User alerted with BRANCH READY FOR REVIEW message
[ ] User has confirmed review before merge proceeds
```
