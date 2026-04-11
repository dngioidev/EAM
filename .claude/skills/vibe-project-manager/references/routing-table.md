# Routing Table [focused]

## Request → Skill Routing

| Request Type | Tier | Layer 1 Skill | Layer 2 Skill |
|---|---|---|---|
| New requirement from user | 3 | `vibe-product-owner` | — wait for approval |
| Feature kickoff (after approval) | 3 | `vibe-ba` → `vibe-designer-uxui` → `vibe-api-contractor` | all dev skills |
| Backend task on existing feature | 2 | `vibe-backend-general` | `vibe-backend-nestjs` |
| Frontend task on existing feature | 2 | `vibe-frontend-general` | `vibe-frontend-react` |
| Full-stack feature | 3 | `vibe-api-contractor` first | both BE + FE |
| DB schema change | 2 | `vibe-db-general` | `vibe-db-postgresql` |
| Caching task | 2 | `vibe-backend-general` | `vibe-cache-redis` |
| Bug fix: critical | 1 | HOTFIX workflow | role skill for area |
| Bug fix: high / medium / low | 1 | `vibe-qa-general` | role skill for area |
| Security concern | 2 | `vibe-security-general` | `vibe-security-nestjs` |
| Docker / deploy | 2 | `vibe-devops-general` | `vibe-devops-docker` |
| Documentation gap | 1 | `vibe-documentation` | — self-contained |
| Design decision | 2 | `vibe-designer-uxui` | `vibe-design-tailwind` |
| Code review | 2 | `vibe-code-review` | — self-contained |
| Test writing | 2 | `vibe-qa-general` | `vibe-qa-stack` |
| Refactoring | 2 | `vibe-backend-general` OR `vibe-frontend-general` | appropriate L2 |
| Dependency update | 1 | `vibe-devops-general` | — |
| Sprint planning | 1 | `vibe-product-owner` | — |
| Wiki initialization | 1 | `vibe-documentation` | `vibe-wiki-app-nextjs` |

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
      YES → Tier 1 → HOTFIX workflow (hotfix-workflow.md)
      NO  → Continue below

  → What area does this touch?
      BACKEND ONLY     → Tier 2 → vibe-backend-general → vibe-backend-nestjs
      FRONTEND ONLY    → Tier 2 → vibe-frontend-general → vibe-frontend-react
      DATABASE         → Tier 2 → vibe-db-general → vibe-db-postgresql
      FULL-STACK       → Tier 3 → vibe-api-contractor first, then both
      CACHING / REDIS  → Tier 2 → vibe-backend-general → vibe-cache-redis
      SECURITY         → Tier 2 → vibe-security-general → vibe-security-nestjs
      DEVOPS / DOCKER  → Tier 2 → vibe-devops-general → vibe-devops-docker
      TESTING          → Tier 2 → vibe-qa-general → vibe-qa-stack
      DESIGN / UI      → Tier 2 → vibe-designer-uxui → vibe-design-tailwind
      CODE REVIEW      → Tier 2 → vibe-code-review (self-contained)
      DOCUMENTATION    → Tier 1 → vibe-documentation (self-contained)
```

---

## Tier Summary

- **Tier 1**: Quick tasks — read `dashboard.json` quick_facts only + the specific bug/feature file
- **Tier 2**: Existing feature work — targeted reads per role skill protocol
- **Tier 3**: New feature kickoff — full comprehensive reads before any work begins
