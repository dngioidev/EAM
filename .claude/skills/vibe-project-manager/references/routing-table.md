# Routing Table [focused]

## Request → Skill Routing

| Request Type | Tier | Layer 1 Skill | Layer 2 Skill |
|---|---|---|---|
| New requirement from user | 3 | `vibe-product-owner` | — wait for approval |
| Feature kickoff (after approval) | 3 | **`vibe-git`** (branch) → `vibe-ba` → `vibe-designer-uxui` → `vibe-api-contractor` | all dev skills |
| Backend task on existing feature | 2 | **`vibe-git`** (branch) → `vibe-backend-general` | `vibe-backend-nestjs` |
| Frontend task on existing feature | 2 | **`vibe-git`** (branch) → `vibe-frontend-general` | `vibe-frontend-react` |
| Full-stack feature | 3 | **`vibe-git`** (branch) → `vibe-api-contractor` first | both BE + FE |
| DB schema change | 2 | **`vibe-git`** (branch) → `vibe-db-general` | `vibe-db-postgresql` |
| Caching task | 2 | **`vibe-git`** (branch) → `vibe-backend-general` | `vibe-cache-redis` |
| Bug fix: critical | 1 | **`vibe-git`** (hotfix branch) → HOTFIX workflow | role skill for area |
| Bug fix: high / medium / low | 1 | **`vibe-git`** (fix branch) → `vibe-qa-general` | role skill for area |
| Security concern | 2 | **`vibe-git`** (branch) → `vibe-security-general` | `vibe-security-nestjs` |
| Docker / deploy | 2 | `vibe-devops-general` | `vibe-devops-docker` |
| Documentation gap | 1 | **`vibe-git`** (chore branch) → `vibe-documentation` | — self-contained |
| Design decision | 2 | `vibe-designer-uxui` | `vibe-design-tailwind` |
| Code review | 2 | `vibe-code-review` | — self-contained |
| Test writing | 2 | **`vibe-git`** (test branch) → `vibe-qa-general` | `vibe-qa-stack` |
| Refactoring | 2 | **`vibe-git`** (refactor branch) → `vibe-backend-general` OR `vibe-frontend-general` | appropriate L2 |
| Dependency update | 1 | `vibe-devops-general` | — |
| Sprint planning | 1 | `vibe-product-owner` | — |
| Wiki initialization | 1 | `vibe-documentation` | `vibe-wiki-app-nextjs` |
| Git branching / commit / merge | 1 | **`vibe-git`** | — self-contained |

---

## Routing Decision Flow

```
User sends request
  → Is build_status failing? → Log pre-existing bug first
  → Is this a new project? → Run project-init.md

  → Is this a brand new feature requirement?
      YES → Tier 3 → vibe-product-owner (write proposal, wait for approval)
      NO  → Continue below

  → Is this a critical bug?
      YES → Tier 1 → vibe-git (create hotfix/* branch from develop) → HOTFIX workflow
      NO  → Continue below

  ⛔ BRANCH GATE — mandatory checkpoint before ANY file is touched:
  → Does this task require code or wiki changes? (feature, fix, refactor, test, chore, docs)
      YES → ── STOP ──────────────────────────────────────────────────────────────────
            │  Invoke vibe-git NOW.
            │  Wait for: "Branch created: {name} — Ready to begin"
            │  Only after that confirmation: route to role skill and begin file edits.
            │  If vibe-git is skipped here, ALL subsequent file changes are a protocol
            │  violation regardless of whether they are correct.
            └───────────────────────────────────────────────────────────────────────
      NO  → skip vibe-git (planning, review, design decisions only — no file edits)

  → What area does this touch?
      BACKEND ONLY     → Tier 2 → vibe-git (feature/* or fix/*) → vibe-backend-general → vibe-backend-nestjs
      FRONTEND ONLY    → Tier 2 → vibe-git (feature/* or fix/*) → vibe-frontend-general → vibe-frontend-react
      DATABASE         → Tier 2 → vibe-git (feature/* or fix/*) → vibe-db-general → vibe-db-postgresql
      FULL-STACK       → Tier 3 → vibe-git (feature/*) → vibe-api-contractor first, then both
      CACHING / REDIS  → Tier 2 → vibe-git (feature/*) → vibe-backend-general → vibe-cache-redis
      SECURITY         → Tier 2 → vibe-git (fix/* or feature/*) → vibe-security-general → vibe-security-nestjs
      DEVOPS / DOCKER  → Tier 2 → vibe-devops-general → vibe-devops-docker
      TESTING          → Tier 2 → vibe-git (test/*) → vibe-qa-general → vibe-qa-stack
      DESIGN / UI      → Tier 2 → vibe-designer-uxui → vibe-design-tailwind
      CODE REVIEW      → Tier 2 → vibe-code-review (self-contained)
      DOCUMENTATION    → Tier 1 → vibe-git (chore/*) → vibe-documentation (self-contained)
      REFACTORING      → Tier 2 → vibe-git (refactor/*) → appropriate role skill
```

---

## Tier Summary

- **Tier 1**: Quick tasks — read `dashboard.json` quick_facts only + the specific bug/feature file
- **Tier 2**: Existing feature work — targeted reads per role skill protocol
- **Tier 3**: New feature kickoff — full comprehensive reads before any work begins
