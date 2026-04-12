# Vibe Fullstack Skill Set — Complete Prompt Document v4
> Master reference for generating all skills for a NestJS + PostgreSQL + ReactJS + Redis vibe-coding project.

---

## 📌 How to Use This Document

This prompt defines **23 skills** across **3 layers** plus a dedicated wiki system and wiki viewer app:

- **Layer 0** — Orchestration: 1 skill (Project Manager)
- **Layer 1** — Role General Skills: 13 skills (tech-agnostic principles per role)
- **Layer 2** — Tech-Specific Skills: 9 skills (deep patterns per technology)

**When generating skills from this prompt:**
1. Generate each skill as a folder: `{skill-name}/SKILL.md` + `references/` subfolder
2. Every `SKILL.md` stays under 500 lines — overflow into reference files
3. Every Layer 1 skill ends with a **structured HANDOFF BLOCK** triggering Layer 2 (except `vibe-code-review` and `vibe-documentation` which are self-contained with no Layer 2)
4. Every Layer 2 skill starts with a **Stack Validation Guard** and **Layer 1 Bypass Guard**
5. Reference files are tagged with scope: `[focused]` <100 lines, `[medium]` 100–200, `[comprehensive]` 200+
6. Agents load `[focused]` freely, `[medium]` when that topic is primary work, `[comprehensive]` only when that topic is the entire session
7. All wiki files are `.json` — human reading happens through the wiki-app at port 3001

---

## 🎯 Project Target

```
Project Name    : V-Smart Ledger (or EAM-Tax)
Purpose         : Helps Vietnamese retail stores & business households automate 
                  inventory tracking and revenue/expense logging to comply with 
                  the 2026 self-declaration tax transition.
Core Domain     : FinTech / Retail Management (Vietnam Tax Compliance)
Target Users    : Small business owners (SMEs), Individual Business Households 
                  (Hộ kinh doanh), and Micro-retailers.
Key Features    : - Circular 88/2021 & Circular 152/2025 compliant digital ledgers.
                  - Real-time e-invoice integration (Decree 123/Circular 78).
                  - Asset depreciation and "Inventory Receiving/Delivery" 
                    voucher automation.
                  - Automated tax reports for VAT and PIT (based on new 500M 
                    VND threshold).
Dark Mode       : Enabled
```

---

## 🏗️ Project Root Structure

Every project generated from this prompt follows this top-level layout:

```
project-root/
├── backend/                    ← NestJS application
├── frontend/                   ← React + Vite application
├── wiki/                       ← JSON wiki (agent + human memory)
├── wiki-app/                   ← Next.js wiki viewer
├── scripts/
│   ├── setup.sh                ← One-command full stack startup
│   ├── reset.sh                ← Tear down and rebuild from scratch
│   └── migrate.sh              ← Run pending DB migrations
├── docker-compose.yml
├── .env                        ← Never committed
├── .env.example                ← Always committed, always in sync with wiki/env-config.json
└── README.md
```

**Port assignments (consolidated reference):**

| Service | Port | Notes |
|---|---|---|
| PostgreSQL | 5432 | Internal only — primary dev database |
| PostgreSQL (test) | 5433 | Internal only — test database, wiped per test suite |
| Redis | 6379 | Internal only |
| Backend (NestJS) | 3000 | API at /api, Swagger at /api/docs |
| Frontend (React) | 5173 | Vite dev server |
| Wiki App (Next.js) | 3001 | Human wiki interface |

---

## 🏗️ Complete Skill Tree

```
skills/
│
├── LAYER 0 — ORCHESTRATION
│   └── vibe-project-manager/
│       ├── SKILL.md
│       └── references/
│           ├── project-init.md            [comprehensive]
│           ├── routing-table.md           [focused]
│           ├── tiered-reading.md          [focused]
│           ├── completion-checklist.md    [focused]
│           ├── sprint-protocol.md         [medium]
│           ├── hotfix-workflow.md         [focused]
│           └── wiki-templates/
│               ├── feature.template.json
│               ├── bug.template.json
│               ├── decision.template.json
│               ├── contract.template.json
│               └── progress.template.json
│
├── LAYER 1 — ROLE GENERAL SKILLS (12 skills)
│   ├── vibe-ba/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── user-story-patterns.md     [medium]
│   │       └── impact-map-patterns.md     [medium]
│   ├── vibe-product-owner/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── existing-context-reads.md  [focused]
│   │       └── proposal-patterns.md       [medium]
│   ├── vibe-designer-uxui/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── wireframe-patterns.md      [medium]
│   │       └── component-first.md         [medium]
│   ├── vibe-backend-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── existing-system-reads.md   [focused]
│   │       ├── api-design-standards.md    [medium]
│   │       ├── refactoring-protocol.md    [focused]
│   │       └── backend-wiki-duties.md     [focused]
│   ├── vibe-frontend-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── existing-system-reads.md   [focused]
│   │       ├── state-decision-tree.md     [focused]
│   │       ├── component-architecture.md  [medium]
│   │       ├── refactoring-protocol.md    [focused]
│   │       └── frontend-wiki-duties.md    [focused]
│   ├── vibe-db-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── schema-change-protocol.md  [medium]
│   ├── vibe-api-contractor/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── existing-contract-check.md [focused]
│   │       └── contract-format.md         [comprehensive]
│   ├── vibe-security-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── security-checklist.md      [medium]
│   │       └── secret-rotation.md         [focused]
│   ├── vibe-qa-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── test-strategy.md           [medium]
│   │       ├── two-pass-test-cases.md     [focused]
│   │       └── bug-protocol.md            [focused]
│   ├── vibe-devops-general/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── env-config-protocol.md     [focused]
│   │       ├── environment-promotion.md   [medium]
│   │       ├── dependency-updates.md      [focused]
│   │       └── backup-recovery.md         [medium]
│   ├── vibe-code-review/
│   │   ├── SKILL.md                       ← self-contained, no Layer 2
│   │   └── references/
│   │       ├── backend-review-checklist.md [medium]
│   │       └── frontend-review-checklist.md [medium]
│   └── vibe-documentation/
│       ├── SKILL.md                       ← self-contained, no Layer 2
│       └── references/
│           ├── json-schema-guide.md       [medium]
│           └── wiki-audit-checklist.md    [medium]
│   └── vibe-git/
│       └── SKILL.md                       ← self-contained, no Layer 2
│
└── LAYER 2 — TECH-SPECIFIC SKILLS (9 skills)
    ├── vibe-backend-nestjs/
    │   ├── SKILL.md
    │   └── references/
    │       ├── project-setup.md           [comprehensive]
    │       ├── module-patterns.md         [comprehensive]
    │       ├── auth-patterns.md           [comprehensive]
    │       ├── validation-patterns.md     [medium]
    │       ├── typeorm-patterns.md        [comprehensive]
    │       ├── redis-patterns.md          [medium]
    │       ├── pagination-patterns.md     [focused]
    │       ├── error-patterns.md          [medium]
    │       ├── swagger-patterns.md        [medium]
    │       ├── testing-patterns.md        [comprehensive]
    │       └── performance-patterns.md    [medium]
    ├── vibe-frontend-react/
    │   ├── SKILL.md
    │   └── references/
    │       ├── project-setup.md           [comprehensive]
    │       ├── component-patterns.md      [comprehensive]
    │       ├── state-patterns.md          [medium]
    │       ├── api-patterns.md            [medium]
    │       ├── routing-patterns.md        [focused]
    │       ├── form-patterns.md           [medium]
    │       ├── testing-patterns.md        [comprehensive]
    │       ├── accessibility-patterns.md  [medium]
    │       └── performance-patterns.md    [medium]
    ├── vibe-db-postgresql/
    │   ├── SKILL.md
    │   └── references/
    │       ├── schema-design.md           [medium]
    │       ├── migration-patterns.md      [comprehensive]
    │       ├── index-strategy.md          [medium]
    │       ├── seed-patterns.md           [focused]
    │       ├── query-patterns.md          [medium]
    │       └── performance-patterns.md    [medium]
    ├── vibe-cache-redis/
    │   ├── SKILL.md
    │   └── references/
    │       ├── cache-strategy.md          [medium]
    │       ├── invalidation-patterns.md   [medium]
    │       ├── nestjs-integration.md      [medium]
    │       └── session-patterns.md        [medium]
    ├── vibe-design-tailwind/
    │   ├── SKILL.md
    │   └── references/
    │       ├── design-tokens.md           [medium]
    │       ├── component-library.md       [medium]
    │       ├── wireframe-to-code.md       [medium]
    │       └── responsive-patterns.md     [focused]
    ├── vibe-security-nestjs/
    │   ├── SKILL.md
    │   └── references/
    │       ├── auth-security.md           [comprehensive]
    │       ├── api-security.md            [medium]
    │       ├── input-security.md          [medium]
    │       ├── secrets-management.md      [medium]
    │       └── vulnerability-scanning.md  [focused]
    ├── vibe-qa-stack/
    │   ├── SKILL.md
    │   └── references/
    │       ├── playwright-patterns.md     [comprehensive]
    │       ├── vitest-patterns.md         [comprehensive]
    │       ├── nestjs-testing-patterns.md [comprehensive]
    │       ├── supertest-patterns.md      [medium]
    │       └── ux-testing-patterns.md     [medium]
    ├── vibe-devops-docker/
    │   ├── SKILL.md
    │   └── references/
    │       ├── dockerfile-nestjs.md       [medium]
    │       ├── dockerfile-react.md        [medium]
    │       ├── dockerfile-nextjs.md       [medium]
    │       ├── docker-compose-patterns.md [comprehensive]
    │       ├── redis-docker.md            [focused]
    │       ├── setup-scripts.md           [medium]
    │       └── security-scanning.md       [focused]
    └── vibe-wiki-app-nextjs/
        ├── SKILL.md
        └── references/
            ├── app-structure.md           [comprehensive]
            ├── wiki-reader-api.md         [medium]
            ├── approval-flow.md           [medium]
            └── impact-graph.md            [medium]
```
---

## 📁 Wiki System — Complete Specification

### Core Design Principles

- All wiki files are `.json` — never `.md` or `.txt`
- Human reading happens through the wiki-app at port 3001
- AI agents read JSON files directly from the filesystem
- Every file has a `quick_facts` object — agents read this before `sections`
- Every file has a `version` integer for conflict detection
- Every `_index.json` has role-based and intent-based navigation
- Every file has `skip_if` guidance to prevent over-reading

---

### Universal JSON Envelope

Every wiki file uses this exact structure. No exceptions.

```json
{
  "meta": {
    "id": "kebab-case-unique-id",
    "type": "feature | bug | decision | contract | plan | history | doc | rulebook",
    "status": "planning | in-progress | done | blocked | approved | deprecated | pending | rolled-back",
    "owner": "backend | frontend | devops | design | qa | po | ba | security | review | both",
    "sprint": 0,
    "last_updated": "YYYY-MM-DD",
    "created": "YYYY-MM-DD",
    "version": 1,
    "depends_on": [],
    "related_to": [],
    "affects": [],
    "tags": [],
    "blocked_by": null,
    "unblock_condition": null
  },
  "quick_facts": {
    "one_line": "what this is in one sentence",
    "status_reason": "why it has this status",
    "last_change": "what changed most recently",
    "key_links": []
  },
  "content": {
    "title": "",
    "tldr": "3 lines max — plain English summary",
    "summary": "One paragraph plain English before any technical content",
    "skip_if": {
      "description": "Conditions under which agents should NOT read this file",
      "conditions": []
    },
    "do_not": [],
    "see_also": [],
    "sections": []
  },
  "approval": {
    "required": false,
    "approved_by": null,
    "approved_at": null,
    "status": "pending | approved | rejected",
    "notes": ""
  },
  "audit": [
    {
      "date": "YYYY-MM-DD",
      "role": "backend",
      "action": "created | updated | status-changed | reviewed",
      "description": "what was done",
      "version_before": 0,
      "version_after": 1
    }
  ]
}
```

---

### `_index.json` Structure (mandatory in every folder)

```json
{
  "meta": { "...standard envelope..." },
  "quick_facts": {
    "one_line": "what this folder contains",
    "item_count": 0,
    "open_count": 0,
    "last_activity": "YYYY-MM-DD"
  },
  "content": {
    "tldr": "3 lines max",
    "status_table": [
      {
        "id": "item-id",
        "title": "Item Title",
        "status": "in-progress",
        "status_emoji": "🚧",
        "owner": "backend",
        "last_updated": "YYYY-MM-DD",
        "sprint": 3,
        "link": "relative/path/to/file.json"
      }
    ],
    "navigation": {
      "by_role": {
        "ba": "Read breakdown.json first, then impact-map.json",
        "backend": "Read contracts.json, then impact-map.json, then techstack/backend.json",
        "frontend": "Read contracts.json, then design.json, then state-map.json",
        "designer": "Read design.json, then design/components/_index.json",
        "qa": "Read test-cases.json, then impact-map.json",
        "po": "Read _index.json status_table only unless sprint planning",
        "devops": "Read techstack/infrastructure.json unless deploy issue",
        "security": "Read api-contracts/{module}.json + rulebook/security-rules.json",
        "review": "Read api-contracts/{module}.json + rulebook/coding-standards.json"
      },
      "by_intent": {
        "fixing_bug": "bugs/_index.json → specific bug file",
        "adding_endpoint": "api-contracts/{module}.json → rulebook/api-standards.json",
        "building_ui": "design/pages/{name}.json → design/components/",
        "writing_tests": "test-cases/{feature}.json → impact-map/{feature}-relations.json",
        "planning_sprint": "plan/_index.json → plan/backlog.json",
        "checking_impact": "impact-map/{feature}-relations.json → impact-map/entity-registry.json",
        "checking_security": "rulebook/security-rules.json → decisions/ for auth decisions"
      }
    },
    "skip_if": {
      "conditions": [
        "You are fixing a bug in an unrelated domain — skip this folder entirely",
        "You only need coding standards — go to rulebook/ directly"
      ]
    },
    "do_not": [],
    "see_also": []
  }
}
```

---

### Complete Wiki Folder Structure

```
wiki/
├── _index.json
├── _schema/
│   ├── feature.schema.json
│   ├── bug.schema.json
│   ├── decision.schema.json
│   ├── contract.schema.json
│   ├── plan.schema.json
│   └── doc.schema.json
├── dashboard.json
├── changelog.json
├── onboarding.json
├── glossary.json
├── env-config.json
├── state-map.json
├── rulebook/
│   ├── _index.json
│   ├── techstack-decisions.json
│   ├── security-rules.json
│   ├── devops-rules.json
│   ├── coding-standards.json
│   ├── api-standards.json
│   └── wiki-rules.json
├── plan/
│   ├── _index.json
│   ├── backlog.json
│   ├── proposals/
│   └── sprints/
│       └── sprint-{N}.json
├── features/
│   ├── _index.json
│   ├── {feature-name}.json           ← simple feature
│   └── {complex-feature}/            ← folder when >3 sub-tasks
│       ├── _index.json
│       ├── breakdown.json
│       ├── design.json
│       ├── contracts.json
│       ├── test-cases.json
│       ├── impact-map.json
│       └── progress.json
├── bugs/
│   ├── _index.json
│   ├── {YYYY-MM-DD}-{slug}.json      ← simple bug
│   └── {YYYY-MM-DD}-{slug}/          ← folder when investigation needed
│       ├── _index.json
│       ├── investigation.json
│       ├── reproduction.json
│       └── fix.json
├── decisions/
│   ├── _index.json
│   └── {YYYY-MM-DD}-{slug}.json
├── techstack/
│   ├── _index.json
│   ├── backend.json
│   ├── frontend.json
│   └── infrastructure.json
├── business-workflow/
│   ├── _index.json
│   └── {domain}.json
├── api-contracts/
│   ├── _index.json
│   └── {module}.json
├── design/
│   ├── _index.json
│   ├── design-system.json
│   ├── components/
│   │   ├── _index.json
│   │   └── {component-name}.json
│   └── pages/
│       ├── _index.json
│       └── {page-name}.json
├── impact-map/
│   ├── _index.json
│   ├── entity-registry.json
│   └── {feature-name}-relations.json
├── test-cases/
│   ├── _index.json
│   └── {feature-name}.json
└── history/
    ├── _index.json
    └── {YYYY-MM-DD}.json
```

---

### All Wiki File Schemas

#### `wiki/dashboard.json`

```json
{
  "meta": { "type": "doc", "owner": "po" },
  "quick_facts": {
    "one_line": "Current project health snapshot",
    "build_status": {
      "backend": "passing | failing | unknown",
      "frontend": "passing | failing | unknown",
      "wiki_app": "passing | failing | unknown"
    },
    "open_bugs": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "sprint_number": 0,
    "sprint_goal": ""
  },
  "content": {
    "sprint": {
      "number": 0,
      "goal": "",
      "capacity": "S | M | L | XL",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    },
    "existing_modules": [],
    "existing_entities": [],
    "existing_routes": [],
    "existing_api_clients": [],
    "last_migration": "",
    "active_features": [
      { "id": "", "title": "", "status": "", "owner": "" }
    ],
    "blocked_features": [
      { "id": "", "blocked_by": "", "since": "YYYY-MM-DD" }
    ],
    "is_new_project": true,
    "project_initialized": null
  }
}
```

---

#### `wiki/techstack/backend.json`

```json
{
  "quick_facts": {
    "one_line": "Current backend module and entity registry",
    "module_count": 0,
    "entity_count": 0,
    "last_schema_change": "YYYY-MM-DD"
  },
  "content": {
    "modules": [
      {
        "name": "AuthModule",
        "path": "src/modules/auth",
        "entities": ["UserEntity"],
        "exports": ["JwtAuthGuard"],
        "endpoints": ["POST /api/auth/login"],
        "dependencies": ["UsersModule"]
      }
    ],
    "entities": [
      {
        "name": "UserEntity",
        "table": "users",
        "columns": ["id", "email", "password_hash", "created_at", "updated_at"],
        "relations": [],
        "used_by_modules": ["AuthModule"]
      }
    ],
    "app_module_imports": ["TypeOrmModule", "ConfigModule", "CacheModule", "ThrottlerModule"],
    "global_middleware": ["ValidationPipe", "HttpExceptionFilter", "TransformInterceptor"],
    "established_patterns": {
      "auth": "JWT with Redis refresh tokens — see decisions/YYYY-MM-DD-jwt-strategy.json",
      "pagination": "offset-based, page+limit, max 100 per page",
      "error_shape": "{ statusCode, message, error, timestamp, path }",
      "response_envelope": "{ data, meta } for lists, plain object for single items"
    }
  }
}
```

---

#### `wiki/techstack/frontend.json`

```json
{
  "quick_facts": {
    "one_line": "Current frontend routes, API clients, stores, and query keys",
    "route_count": 0,
    "store_count": 0,
    "api_client_count": 0
  },
  "content": {
    "routes": [
      {
        "path": "/login",
        "component": "LoginPage",
        "file": "src/pages/LoginPage.tsx",
        "auth_required": false
      }
    ],
    "api_clients": [
      {
        "file": "src/api/auth.api.ts",
        "module": "auth",
        "contract_version": "1.0",
        "endpoints_covered": ["POST /api/auth/login"]
      }
    ],
    "zustand_stores": [
      {
        "name": "useAuthStore",
        "file": "src/stores/auth.store.ts",
        "keys": ["user", "isAuthenticated"],
        "type": "client-state"
      }
    ],
    "react_query_keys": [
      {
        "key": ["users", "profile"],
        "description": "Current user profile",
        "invalidated_by": ["PATCH /api/users/profile"]
      }
    ],
    "shared_types": [
      {
        "file": "src/types/auth.types.ts",
        "contract_version": "1.0",
        "last_synced": "YYYY-MM-DD",
        "generated_by": "npm run types:generate"
      }
    ]
  }
}
```

---

#### `wiki/techstack/infrastructure.json`

```json
{
  "quick_facts": {
    "one_line": "Docker services, ports, and deployment configuration",
    "services_count": 6,
    "last_deploy": "YYYY-MM-DD"
  },
  "content": {
    "services": [
      {
        "name": "postgres",
        "image": "postgres:15-alpine",
        "port": 5432,
        "volume": "pgdata",
        "health_check": "pg_isready -U appuser"
      },
      {
        "name": "postgres-test",
        "image": "postgres:15-alpine",
        "port": 5433,
        "volume": "pgdata-test",
        "health_check": "pg_isready -U testuser",
        "note": "Dedicated test database — wiped and re-seeded per test suite run"
      },
      {
        "name": "redis",
        "image": "redis:7-alpine",
        "port": 6379,
        "volume": "redisdata",
        "health_check": "redis-cli ping"
      },
      {
        "name": "backend",
        "build": "./backend",
        "port": 3000,
        "swagger_url": "http://localhost:3000/api/docs",
        "health_check": "GET /health"
      },
      {
        "name": "frontend",
        "build": "./frontend",
        "port": 5173,
        "health_check": "GET /"
      },
      {
        "name": "wiki-app",
        "build": "./wiki-app",
        "port": 3001,
        "volume_mount": "./wiki:/app/wiki",
        "health_check": "GET /"
      }
    ],
    "environments": {
      "local": { "compose_file": "docker-compose.yml", "env_file": ".env" },
      "staging": { "compose_file": "docker-compose.staging.yml", "env_file": ".env.staging" },
      "production": { "compose_file": "docker-compose.prod.yml", "env_file": ".env.prod" }
    },
    "last_vulnerability_scan": "YYYY-MM-DD",
    "notes": ""
  }
}
```

---

#### `wiki/env-config.json`

```json
{
  "quick_facts": {
    "one_line": "All environment variables across all services",
    "total_vars": 0,
    "secret_vars": 0,
    "last_synced_with_env_example": "YYYY-MM-DD"
  },
  "content": {
    "variables": [
      {
        "key": "DATABASE_URL",
        "description": "PostgreSQL connection string",
        "required": true,
        "is_secret": false,
        "owner": "devops",
        "used_by": ["backend"],
        "example": "postgresql://appuser:apppass@postgres:5432/appdb",
        "added_date": "YYYY-MM-DD"
      },
      {
        "key": "REDIS_URL",
        "description": "Redis connection string",
        "required": true,
        "is_secret": false,
        "owner": "devops",
        "used_by": ["backend"],
        "example": "redis://:password@redis:6379",
        "added_date": "YYYY-MM-DD"
      },
      {
        "key": "JWT_SECRET",
        "description": "Secret for signing JWT access tokens",
        "required": true,
        "is_secret": true,
        "owner": "security",
        "used_by": ["backend"],
        "example": "generate-with-openssl-rand-base64-64",
        "added_date": "YYYY-MM-DD"
      },
      {
        "key": "JWT_REFRESH_SECRET",
        "description": "Secret for signing JWT refresh tokens",
        "required": true,
        "is_secret": true,
        "owner": "security",
        "used_by": ["backend"],
        "example": "generate-with-openssl-rand-base64-64",
        "added_date": "YYYY-MM-DD"
      },
      {
        "key": "TEST_DATABASE_URL",
        "description": "PostgreSQL connection string for test environment",
        "required": true,
        "is_secret": false,
        "owner": "devops",
        "used_by": ["backend"],
        "example": "postgresql://testuser:testpass@localhost:5433/testdb",
        "added_date": "YYYY-MM-DD"
      },
      {
        "key": "VITE_API_BASE_URL",
        "description": "Backend API base URL for the frontend",
        "required": true,
        "is_secret": false,
        "owner": "devops",
        "used_by": ["frontend"],
        "example": "http://localhost:3000",
        "added_date": "YYYY-MM-DD"
      }
    ],
    "do_not": [
      "Never commit .env files — only .env.example",
      "Never add secrets to docker-compose.yml directly",
      "Every new variable must be added here AND to .env.example on the same day"
    ]
  }
}
```

---

#### `wiki/state-map.json`

```json
{
  "quick_facts": {
    "one_line": "Frontend state ownership — what lives where and why",
    "server_state_count": 0,
    "client_state_count": 0,
    "last_updated": "YYYY-MM-DD"
  },
  "content": {
    "decision_rules": {
      "use_react_query_when": [
        "Data is fetched from an API",
        "Multiple components need the same server data",
        "Data needs cache invalidation after mutation"
      ],
      "use_zustand_when": [
        "State is UI-only with no server equivalent",
        "State must persist across page navigations",
        "State is shared between 3+ unrelated components"
      ],
      "use_local_state_when": [
        "State is local to one component",
        "State does not need to be shared",
        "State resets on unmount intentionally"
      ]
    },
    "server_state": [
      {
        "query_key": ["users", "profile"],
        "description": "Current authenticated user profile",
        "endpoint": "GET /api/users/profile",
        "invalidated_by": ["PATCH /api/users/profile"],
        "stale_time_ms": 300000,
        "file": "src/hooks/useUserProfile.ts"
      }
    ],
    "client_state": [
      {
        "store": "useAuthStore",
        "file": "src/stores/auth.store.ts",
        "keys": ["user", "isAuthenticated", "token"],
        "persisted": true,
        "reason": "Auth state must survive page refresh"
      }
    ],
    "do_not": [
      "Never create a new Zustand store without checking this file first",
      "Never use useEffect for data fetching — always React Query",
      "Never duplicate a query key — check react_query_keys in frontend.json"
    ]
  }
}
```

---

#### `wiki/onboarding.json`

```json
{
  "quick_facts": {
    "one_line": "5 steps from zero to running project",
    "estimated_time": "15 minutes",
    "last_validated": "YYYY-MM-DD"
  },
  "content": {
    "prerequisites": ["Docker Desktop installed", "Node.js 20+ installed", "Git installed"],
    "steps": [
      {
        "step": 1,
        "title": "Clone and configure",
        "commands": ["git clone {repo}", "cp .env.example .env", "# Edit .env with your values"]
      },
      {
        "step": 2,
        "title": "Start all services",
        "commands": ["./scripts/setup.sh"],
        "expected_output": "All 6 services healthy"
      },
      {
        "step": 3,
        "title": "Run migrations",
        "commands": ["./scripts/migrate.sh"],
        "expected_output": "Migrations complete"
      },
      {
        "step": 4,
        "title": "Verify services",
        "checks": [
          "Backend API: http://localhost:3000/api/docs",
          "Frontend: http://localhost:5173",
          "Wiki App: http://localhost:3001"
        ]
      },
      {
        "step": 5,
        "title": "Read the wiki",
        "description": "Open http://localhost:3001 to view project status, features, and decisions"
      }
    ],
    "troubleshooting": [
      {
        "problem": "Port already in use",
        "solution": "Run ./scripts/reset.sh to clean all containers"
      },
      {
        "problem": "Migration fails",
        "solution": "Check DATABASE_URL in .env matches docker-compose postgres service"
      }
    ]
  }
}
```

---

#### `wiki/glossary.json`

```json
{
  "quick_facts": {
    "one_line": "Domain terms defined once, referenced everywhere",
    "term_count": 0
  },
  "content": {
    "terms": [
      {
        "term": "Entity",
        "definition": "A TypeORM class decorated with @Entity() that maps to a database table",
        "used_in": ["backend", "db"],
        "first_defined": "YYYY-MM-DD"
      },
      {
        "term": "Contract",
        "definition": "The agreed API shape (endpoint, request, response) defined in wiki/api-contracts/ before any implementation",
        "used_in": ["backend", "frontend", "api-contractor"],
        "first_defined": "YYYY-MM-DD"
      }
    ]
  }
}
```

---

#### `wiki/rulebook/coding-standards.json`

```json
{
  "quick_facts": {
    "one_line": "Enforced coding standards for backend and frontend",
    "owners": ["backend", "frontend", "review"],
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "backend": {
      "mandatory": [
        "No any types anywhere in TypeScript",
        "No business logic in controllers — services only",
        "All DTOs validated with class-validator decorators",
        "All multi-step DB operations wrapped in transactions",
        "All list endpoints paginated with page+limit+total response",
        "All endpoints have Swagger @ApiOperation and @ApiResponse decorators",
        "All typed NestJS exceptions — never throw raw Error",
        "No raw SQL without an explanation comment",
        "No console.log in committed code"
      ],
      "naming": {
        "modules": "PascalCase + Module suffix e.g. UsersModule",
        "services": "PascalCase + Service suffix e.g. UsersService",
        "controllers": "PascalCase + Controller suffix e.g. UsersController",
        "entities": "PascalCase + Entity suffix e.g. UserEntity",
        "dtos": "PascalCase + Dto suffix e.g. CreateUserDto",
        "files": "kebab-case e.g. users.service.ts"
      }
    },
    "frontend": {
      "mandatory": [
        "No inline styles — Tailwind utility classes only",
        "No fetch or axios calls inside components — use src/api/ layer",
        "No useEffect for data fetching — use React Query",
        "Every data-fetching component handles loading, error, and empty states",
        "All interactive elements have accessible names",
        "TypeScript interfaces imported from src/types/ — never manually duplicated",
        "No duplicate Zustand stores — check wiki/state-map.json first",
        "No duplicate React Query keys — check wiki/techstack/frontend.json first"
      ],
      "naming": {
        "components": "PascalCase e.g. UserProfile",
        "hooks": "camelCase with use prefix e.g. useUserProfile",
        "stores": "camelCase with use prefix e.g. useAuthStore",
        "api_files": "kebab-case + .api.ts suffix e.g. users.api.ts",
        "type_files": "kebab-case + .types.ts suffix e.g. users.types.ts"
      }
    },
    "do_not": [
      "Never override these standards without a decision record in wiki/decisions/",
      "Never merge code that fails the code review checklist"
    ]
  }
}
```

---

#### `wiki/rulebook/api-standards.json`

```json
{
  "quick_facts": {
    "one_line": "API naming, versioning, response shape, and error standards",
    "owners": ["backend", "api-contractor"],
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "url_conventions": {
      "format": "kebab-case nouns, plural, no verbs",
      "examples": ["/api/users", "/api/user-profiles", "/api/auth/refresh"],
      "versioning": "prefix with /api/v2/ only on breaking changes"
    },
    "http_methods": {
      "GET": "Read — never mutates state",
      "POST": "Create — returns 201 with created resource",
      "PATCH": "Partial update — returns 200 with updated resource",
      "PUT": "Full replace — returns 200 with replaced resource",
      "DELETE": "Delete — returns 204 no content"
    },
    "response_shapes": {
      "single_resource": "{ id, ...fields, createdAt, updatedAt }",
      "list_resource": "{ data: [...], meta: { total, page, limit, totalPages } }",
      "error": "{ statusCode, message, error, timestamp, path }"
    },
    "status_codes": {
      "200": "Success with body",
      "201": "Created",
      "204": "Success, no body",
      "400": "Validation error",
      "401": "Unauthenticated",
      "403": "Unauthorized (authenticated but no permission)",
      "404": "Not found",
      "409": "Conflict (duplicate)",
      "500": "Internal error (never expose details)"
    },
    "query_params": {
      "pagination": "page (default 1), limit (default 20, max 100)",
      "sorting": "sortBy (field name), sortOrder (asc | desc)",
      "filtering": "field name as param e.g. ?status=active"
    }
  }
}
```

---

#### `wiki/rulebook/devops-rules.json`

```json
{
  "quick_facts": {
    "one_line": "Enforced DevOps and infrastructure rules",
    "owners": ["devops", "security"],
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "rules": [
      { "id": "DEV-001", "rule": "Multi-stage Docker builds only — builder stage + minimal runtime stage" },
      { "id": "DEV-002", "rule": "Alpine base images only — no full Debian/Ubuntu images" },
      { "id": "DEV-003", "rule": "No secrets in Dockerfile or docker-compose.yml — env vars only" },
      { "id": "DEV-004", "rule": ".env.example must always match wiki/env-config.json exactly" },
      { "id": "DEV-005", "rule": "Health checks defined for every Docker service" },
      { "id": "DEV-006", "rule": "Named volumes for all persistent data — never anonymous volumes" },
      { "id": "DEV-007", "rule": "docker-compose up from clean state must work at all times" },
      { "id": "DEV-008", "rule": "wiki-app service always included in docker-compose.yml" },
      { "id": "DEV-009", "rule": "Non-root user in all production Dockerfiles" },
      { "id": "DEV-010", "rule": "Vulnerability scan on every new image build — block on CRITICAL CVEs" }
    ],
    "do_not": [
      "Never use latest tag for base images — always pin to a version",
      "Never expose internal services (postgres, redis) to public network",
      "Never store backup files inside containers"
    ]
  }
}
```

---

#### `wiki/rulebook/wiki-rules.json`

```json
{
  "quick_facts": {
    "one_line": "Rules for writing, structuring, and maintaining the wiki",
    "owners": ["documentation", "po"],
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "file_rules": [
      "All wiki files are .json — never .md",
      "Every file uses the universal envelope schema",
      "Every file has quick_facts filled before sections",
      "Every file has version integer — increment on every write",
      "File size budgets: _index 80 lines, feature 150, bug 100, decision 80, contract 120"
    ],
    "promotion_rules": {
      "file_to_folder_triggers": [
        "Feature has more than 3 sub-tasks",
        "Bug requires multi-session investigation",
        "Any file approaches its size budget"
      ],
      "folder_must_have": "_index.json as dashboard — all other files linked from it"
    },
    "naming": {
      "bugs": "YYYY-MM-DD-short-slug.json",
      "features": "feature-name-kebab-case.json",
      "decisions": "YYYY-MM-DD-decision-slug.json",
      "proposals": "YYYY-MM-DD-proposal-slug.json",
      "history": "YYYY-MM-DD.json"
    },
    "do_not": [
      "Never create a wiki file without the universal envelope",
      "Never leave see_also links pointing to non-existent files",
      "Never exceed file size budgets — split first"
    ]
  }
}
```

---

#### `wiki/rulebook/security-rules.json`

```json
{
  "quick_facts": {
    "one_line": "Enforced security rules — all roles must comply",
    "owners": ["security", "devops", "backend"],
    "rule_count": 10,
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "rules": [
      { "id": "SEC-001", "rule": "Never return passwords, raw tokens, or secrets in API responses", "applies_to": ["backend"], "severity_if_violated": "critical" },
      { "id": "SEC-002", "rule": "JWT access token expiry max 15 minutes, refresh token max 7 days", "applies_to": ["backend", "security"], "severity_if_violated": "high" },
      { "id": "SEC-003", "rule": "Rate limiting on all auth endpoints — max 10 req/min per IP", "applies_to": ["backend"], "severity_if_violated": "high" },
      { "id": "SEC-004", "rule": "Helmet middleware active in all environments", "applies_to": ["backend"], "severity_if_violated": "high" },
      { "id": "SEC-005", "rule": "CORS explicit origins only — no wildcard in non-local environments", "applies_to": ["backend", "devops"], "severity_if_violated": "critical" },
      { "id": "SEC-006", "rule": "Authorization checked at service layer, not only at guard level", "applies_to": ["backend"], "severity_if_violated": "critical" },
      { "id": "SEC-007", "rule": "No secrets in code — all via env vars consumed through ConfigService", "applies_to": ["backend", "devops"], "severity_if_violated": "critical" },
      { "id": "SEC-008", "rule": "No request body logging where credentials may appear", "applies_to": ["backend"], "severity_if_violated": "high" },
      { "id": "SEC-009", "rule": "Input sanitized for free-text fields beyond class-validator", "applies_to": ["backend"], "severity_if_violated": "high" },
      { "id": "SEC-010", "rule": "All auth architecture decisions logged in wiki/decisions/", "applies_to": ["security", "backend"], "severity_if_violated": "medium" }
    ],
    "established_patterns": {
      "auth_implementation": {
        "description": "How JWT auth is implemented in this project",
        "reference_file": "src/modules/auth/auth.service.ts",
        "decision_record": "decisions/YYYY-MM-DD-jwt-strategy.json"
      },
      "rate_limiting": {
        "description": "ThrottlerModule with Redis store, 10 req/min on auth endpoints",
        "reference_file": "src/app.module.ts"
      }
    },
    "rotation_protocols": {
      "jwt_secret": "Update JWT_SECRET in .env — all existing access tokens immediately invalidated. Users must re-login.",
      "jwt_refresh_secret": "Update JWT_REFRESH_SECRET in .env — all refresh tokens invalidated. All sessions terminated.",
      "db_password": "Update DB_PASSWORD in .env + docker-compose, recreate postgres container, backend will reconnect",
      "redis_password": "Update REDIS_PASSWORD in .env + docker-compose, recreate redis container"
    }
  }
}
```

---

#### `wiki/design/design-system.json`

```json
{
  "quick_facts": {
    "one_line": "Design tokens, typography, spacing, and global rules",
    "dark_mode": "enabled | disabled | planned",
    "last_updated": "YYYY-MM-DD"
  },
  "content": {
    "colors": {
      "primary": "#[hex] — main brand color",
      "secondary": "#[hex] — secondary accent",
      "destructive": "#[hex] — errors and danger actions",
      "muted": "#[hex] — subdued text and borders",
      "background": "#[hex]",
      "foreground": "#[hex] — main text",
      "card": "#[hex]",
      "border": "#[hex]"
    },
    "dark_mode_colors": {
      "note": "Only populated if dark_mode is enabled",
      "background": "#[hex]",
      "foreground": "#[hex]"
    },
    "typography": {
      "font_sans": "Inter, system-ui, sans-serif",
      "scale": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem"
      }
    },
    "spacing": {
      "base_unit": "4px",
      "scale": "Tailwind default: 1=4px, 2=8px, 4=16px, 6=24px, 8=32px"
    },
    "border_radius": {
      "sm": "0.125rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "full": "9999px"
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px"
    },
    "do_not": [
      "Never use hex colors directly in components — use Tailwind token classes only",
      "Never create a component without checking this file for the correct spacing scale",
      "Never add a new breakpoint without updating this file"
    ]
  }
}
```

---

#### `wiki/plan/backlog.json`

```json
{
  "quick_facts": {
    "one_line": "Prioritised feature backlog awaiting sprint assignment",
    "total_items": 0,
    "unassigned_count": 0
  },
  "content": {
    "items": [
      {
        "id": "feature-id",
        "title": "Feature title",
        "type": "feature | bug | chore | spike",
        "priority": "critical | high | medium | low",
        "effort": "S | M | L | XL",
        "status": "backlog | sprint | done",
        "sprint": null,
        "owner": null,
        "feature_file": "features/feature-id.json",
        "added_date": "YYYY-MM-DD",
        "notes": ""
      }
    ],
    "do_not": [
      "Never add items to backlog without PO approval",
      "Never modify priorities without PO sign-off"
    ]
  }
}
```

---

#### `wiki/plan/sprints/sprint-{N}.json`

```json
{
  "quick_facts": {
    "one_line": "Sprint N goal and outcomes",
    "sprint_number": 0,
    "status": "planning | active | completed"
  },
  "content": {
    "goal": "",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "capacity": "S | M | L | XL",
    "features": [
      { "id": "feature-id", "title": "", "status": "done | in-progress | not-started", "owner": "" }
    ],
    "velocity": {
      "planned": 0,
      "completed": 0,
      "carried_over": []
    },
    "retrospective": {
      "went_well": [],
      "to_improve": [],
      "action_items": []
    },
    "bugs_found": [],
    "bugs_resolved": [],
    "decisions_made": []
  }
}
```

---

#### `wiki/business-workflow/{domain}.json`

```json
{
  "quick_facts": {
    "one_line": "Business domain workflow and rules",
    "domain": "e.g. payments, notifications, user-management",
    "owner": "po"
  },
  "content": {
    "description": "Plain English description of this business domain",
    "actors": ["user", "admin", "system"],
    "flows": [
      {
        "name": "Flow name",
        "trigger": "What starts this flow",
        "steps": ["Step 1", "Step 2"],
        "outcome": "What the flow produces",
        "edge_cases": []
      }
    ],
    "business_rules": [
      "Rule 1: explicit constraint",
      "Rule 2: explicit constraint"
    ],
    "related_features": [],
    "related_entities": []
  }
}
```

---

#### `wiki/impact-map/entity-registry.json`

```json
{
  "quick_facts": {
    "one_line": "Maps every TypeORM entity to all features and modules that touch it",
    "entity_count": 0,
    "last_updated": "YYYY-MM-DD"
  },
  "content": {
    "entities": [
      {
        "name": "UserEntity",
        "table": "users",
        "touched_by_features": [
          {
            "feature_id": "user-authentication",
            "operations": ["read", "create"],
            "test_files": ["e2e/auth.spec.ts", "src/modules/auth/auth.service.spec.ts"]
          }
        ],
        "touched_by_modules": ["AuthModule", "UsersModule"],
        "shared_contracts": ["api-contracts/users.json"]
      }
    ]
  }
}
```

---

#### `wiki/test-cases/_index.json`

```json
{
  "quick_facts": {
    "one_line": "Registry of all test files and their feature coverage",
    "total_test_files": 0
  },
  "content": {
    "test_file_registry": [
      {
        "feature": "user-authentication",
        "unit_tests": ["src/modules/auth/auth.service.spec.ts"],
        "integration_tests": ["src/modules/auth/auth.integration.spec.ts"],
        "e2e_tests": ["e2e/auth.spec.ts"],
        "ux_tests": ["e2e/auth-ux.spec.ts"],
        "last_all_passing": "YYYY-MM-DD"
      }
    ],
    "regression_groups": [
      {
        "group": "auth-related",
        "description": "Run when auth, users, or tokens are touched",
        "test_files": ["e2e/auth.spec.ts"]
      }
    ]
  }
}
```

---

#### `wiki/history/{date}.json`

```json
{
  "quick_facts": {
    "one_line": "Changes made on YYYY-MM-DD",
    "session_count": 1,
    "roles_active": []
  },
  "content": {
    "sessions": [
      {
        "session_id": "YYYY-MM-DD-001",
        "role": "backend",
        "feature": "feature-id",
        "completed_tasks": [],
        "files_changed": [],
        "wiki_updated": [],
        "tests_added": [],
        "bugs_logged": [],
        "bugs_resolved": [],
        "decisions_made": [],
        "next_session_notes": "What to do first next session",
        "scratch_notes": "Running notes appended during session for accuracy"
      }
    ]
  }
}
```

---

#### `wiki/features/{complex-feature}/progress.json`

```json
{
  "quick_facts": {
    "one_line": "Task completion state — read this to resume partial work",
    "completed_count": 0,
    "total_count": 0,
    "last_session": "YYYY-MM-DD",
    "last_role": "backend"
  },
  "content": {
    "tasks": [
      {
        "id": "TASK-001",
        "title": "Create UserProfile migration",
        "role": "db",
        "status": "done | in-progress | not-started",
        "completed_date": null,
        "notes": ""
      }
    ],
    "session_log": [
      {
        "date": "YYYY-MM-DD",
        "role": "backend",
        "completed_tasks": [],
        "started_tasks": [],
        "blockers": [],
        "next_session_start": "Exact instruction for next session"
      }
    ]
  }
}
```

---

#### `wiki/design/components/{name}.json`

```json
{
  "quick_facts": {
    "one_line": "Component purpose in one sentence",
    "variant_count": 0,
    "used_on_pages": [],
    "last_reviewed": "YYYY-MM-DD"
  },
  "content": {
    "name": "ComponentName",
    "description": "What this component does and when to use it",
    "variants": ["default", "loading", "error", "empty"],
    "props": [
      { "name": "prop", "type": "string", "required": true, "default": null, "description": "" }
    ],
    "variant_matrix": [
      {
        "variant": "loading",
        "props_required": ["isLoading: true"],
        "visual": "spinner replaces content",
        "behavior": "all interactions disabled"
      }
    ],
    "wireframe": [
      "┌─────────────────────────────┐",
      "│  Component wireframe here   │",
      "└─────────────────────────────┘"
    ],
    "states": {
      "default": "",
      "loading": "",
      "error": "",
      "empty": "",
      "success": ""
    },
    "transitions": {
      "hover": "bg shifts 150ms ease",
      "loading": "fade in spinner 200ms",
      "enter": "slide up 200ms ease-out",
      "exit": "fade out 150ms"
    },
    "interactions": [],
    "accessibility": [],
    "spacing": "",
    "responsive": "",
    "dark_mode": "inherits design-system tokens | custom: ...",
    "do_not": []
  },
  "review_history": [
    {
      "date": "YYYY-MM-DD",
      "reviewer": "designer",
      "result": "approved | ux-regression",
      "bugs_logged": []
    }
  ]
}
```

---

#### `wiki/bugs/{date}-{slug}.json`

```json
{
  "quick_facts": {
    "one_line": "Short bug description",
    "severity": "critical | high | medium | low | ux-regression",
    "severity_emoji": "🔴 | 🟠 | 🟡 | 🟢 | 🔵",
    "discovered_by": "build | unit-test | playwright | manual | code-review",
    "area": "backend | frontend | devops | design | both"
  },
  "content": {
    "description": "",
    "reproduction": {
      "environment": {
        "backend_version": "",
        "frontend_version": "",
        "node_version": "",
        "docker_version": "",
        "os": "",
        "db_seed_state": "fresh | seeded-dev | seeded-test"
      },
      "steps": [],
      "expected": "",
      "actual": ""
    },
    "root_cause": null,
    "fix_applied": null,
    "verification": null
  }
}
```

---

#### `wiki/decisions/{date}-{slug}.json`

```json
{
  "quick_facts": {
    "one_line": "Decision title and outcome",
    "decided_by": [],
    "decision_date": "YYYY-MM-DD"
  },
  "content": {
    "context": "What situation led to this decision",
    "decision": "What was decided",
    "rationale": "Why this was chosen",
    "alternatives_considered": [
      { "option": "", "rejected_reason": "" }
    ],
    "consequences": {
      "positive": [],
      "negative": [],
      "neutral": []
    },
    "established_pattern": {
      "description": "Concrete implementation pattern for this project",
      "code_example_location": "src/modules/auth/auth.service.ts:42",
      "applies_to": []
    },
    "revisit_if": "",
    "do_not": []
  }
}
```

---

#### `wiki/changelog.json`

```json
{
  "meta": { "type": "doc", "owner": "po" },
  "quick_facts": {
    "one_line": "Recent changes across all wiki files, newest first",
    "entry_count": 0,
    "last_entry": "YYYY-MM-DD"
  },
  "content": {
    "entries": [
      {
        "date": "YYYY-MM-DD",
        "role": "backend | frontend | devops | design | qa | po | ba | security | review",
        "action": "created | updated | status-changed | approved | rejected | deployed",
        "description": "What changed in plain English",
        "file_changed": "relative/path/to/file.json",
        "feature": "feature-id or null",
        "tags": ["backend", "auth", "sprint-3"],
        "version_before": 0,
        "version_after": 1
      }
    ],
    "max_entries": 100,
    "archive_note": "When entries exceed max_entries, move oldest to wiki/history/{date}.json"
  }
}
```

---

#### `wiki/plan/proposals/{date}-{slug}.json`

```json
{
  "meta": {
    "type": "plan",
    "status": "pending | approved | rejected",
    "owner": "po"
  },
  "quick_facts": {
    "one_line": "Proposal summary in one sentence",
    "proposed_by": "po",
    "proposed_date": "YYYY-MM-DD",
    "decision_date": null
  },
  "content": {
    "requirement_raw": "user's exact original words",
    "existing_context": {
      "related_features": [],
      "related_modules": [],
      "complexity_note": ""
    },
    "options": [
      {
        "id": "option-a",
        "title": "",
        "pros": [],
        "cons": [],
        "effort": "S | M | L | XL",
        "risks": []
      }
    ],
    "recommendation": "option-a",
    "rationale": "",
    "out_of_scope": [],
    "dependencies": []
  },
  "approval": {
    "required": true,
    "approved_by": null,
    "approved_at": null,
    "status": "pending | approved | rejected",
    "notes": ""
  }
}
```

---

### Wiki File Rules

**Hierarchy promotion:**
```
Single .json file → default for all new items
Promote to folder when ANY trigger hits:
  - Feature: more than 3 sub-tasks
  - Bug: requires multi-session investigation
  - Any file approaching its size budget
```

**File size budgets:**
```
_index / dashboard  : max 80 lines
Feature files       : max 150 lines → promote to folder
Bug files           : max 100 lines → promote to folder
Decision files      : max 80 lines
Contract files      : max 120 lines
Design components   : max 100 lines
Rulebook files      : max 200 lines
```

**Version conflict protocol:**
Every write must: read current `meta.version`, increment by 1, write with new version. If version doesn't match what you expect, log a `wiki-conflict` entry in `wiki/history/{date}.json` and surface in the wiki-app conflict queue.

**Type generation:**
Shared TypeScript interfaces between backend and frontend are generated with:
```bash
npm run types:generate
```
This script (defined in `backend/package.json`) reads `wiki/api-contracts/{module}.json` and outputs typed interfaces to `frontend/src/types/{module}.types.ts`. Run this whenever a contract version changes.

**Test database setup:**
Integration tests require a separate PostgreSQL instance to avoid wiping dev data. The `postgres-test` service in docker-compose runs on port 5433 with its own named volume. Define `TEST_DATABASE_URL` in `.env` pointing to this test DB (`postgresql://testuser:testpass@localhost:5433/testdb`). The test DB is wiped and re-seeded before each test suite run. Never run integration tests against the primary dev database on port 5432.
---

## 🎭 Layer 0 — Orchestration

### `vibe-project-manager`

```yaml
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
---
```

**SKILL.md body must include:**

**1. Session Start Protocol**
```
Every session, in this exact order:

STEP 1: Read wiki/dashboard.json
  → Check is_new_project: if true AND project_initialized is null
      → Run PROJECT INITIALIZATION (see references/project-init.md)
      → Do not proceed to routing until initialization is complete
  → Check quick_facts.build_status: if any "failing"
      → Note which services are failing
      → Log as pre-existing bug BEFORE touching any code
  → Note: existing_modules, existing_entities, existing_routes

STEP 2: Read wiki/changelog.json
  → Filter entries by tags matching current request's feature or module
  → If any entry newer than 3 days matches: read that wiki/history/{date}.json
  → This answers "what changed since last session"

STEP 3: Apply TIERED READING (see references/tiered-reading.md)
  → Choose the correct tier for this request type
  → Stop reading when all STOP READING questions are answered

STEP 4: Open scratch note
  → Append to wiki/history/{date}.json scratch_notes as you work
  → Format: "[action] — [file changed or decision made]"
  → Use this at end of session for accurate wiki updates
```

**2. New vs Existing Project Detection**
```
wiki/dashboard.json → is_new_project: true AND project_initialized: null
  → This is a brand new project
  → Run references/project-init.md before any feature work
  → project-init.md covers: folder scaffold, package installs,
    docker-compose setup, wiki initialization, initial build verification

wiki/dashboard.json → is_new_project: false
  → Existing project — proceed to tiered reading and routing
```

**3. Blocked Feature Check (Sprint Start)**
```
At start of every new sprint:
Read wiki/dashboard.json blocked_features array
For each blocked feature:
  → Check if unblock_condition is now satisfied
  → If satisfied: update feature status to planning, notify PO
  → If not: leave blocked, update wiki/history with check date
```

**4. Routing Table** — see `references/routing-table.md`

**5. Tiered Reading** — see `references/tiered-reading.md`

**6. Completion Checklist** — see `references/completion-checklist.md`

**7. Wiki Update Protocol**
```
At end of every session (use scratch_notes for accuracy):
→ wiki/history/{date}.json — write full session entry
→ wiki/features/{name}/progress.json — update task completion states
→ wiki/features/{name}.json or _index.json — update status
→ wiki/api-contracts/{module}.json — if endpoints changed
→ wiki/env-config.json — if new vars added
→ wiki/impact-map/entity-registry.json — if entities modified
→ wiki/impact-map/{feature}-relations.json — if new relations found
→ wiki/decisions/ — entry if architectural decision made
→ wiki/techstack/backend.json — if new module, entity, or pattern added
→ wiki/techstack/frontend.json — if new route, store, API client, or query key added
→ wiki/dashboard.json — refresh all quick_facts
→ wiki/changelog.json — prepend new entry with relevant tags
```

**`references/project-init.md`** must cover:
```
PROJECT INITIALIZATION PROCEDURE (new projects only)

STEP 1: Scaffold backend
  npx @nestjs/cli new backend --package-manager npm
  cd backend && npm install [all required packages with versions]
  Create: src/config/, src/common/, src/modules/auth/, src/modules/users/
  Create: main.ts with ValidationPipe, filters, interceptors, Swagger, CORS, Helmet
  Run: npm run build — must pass before continuing

STEP 2: Scaffold frontend
  npm create vite@latest frontend -- --template react-ts
  cd frontend && npm install [all required packages with versions]
  Create: src/api/, src/components/ui/, src/components/features/
  Create: src/hooks/, src/pages/, src/stores/, src/types/, src/utils/
  Add: tailwind.config.ts, vite.config.ts with test config
  Run: npm run build — must pass before continuing

STEP 3: Scaffold wiki-app
  npx create-next-app@latest wiki-app --typescript --tailwind --app
  Install: shadcn/ui, react-flow or d3
  Create all page routes matching wiki folder structure
  Run: npm run build — must pass before continuing

STEP 4: Initialize wiki folder structure
  Create all folders and _index.json files per wiki structure definition
  Create wiki/dashboard.json with is_new_project: true, set project_initialized: TODAY
  Create wiki/rulebook/ files from schemas defined in this document
  Create wiki/onboarding.json with actual setup steps

STEP 4b: Populate vibe-project-manager wiki-templates
  Create the 5 templates in references/wiki-templates/ using the exact JSON schemas
  provided in the Wiki System section of this document:
    - feature.template.json   (from wiki/features/{name}.json schema)
    - bug.template.json       (from wiki/bugs/{date}-{slug}.json schema)
    - decision.template.json  (from wiki/decisions/{date}-{slug}.json schema)
    - contract.template.json  (from wiki/api-contracts/{module}.json schema)
    - progress.template.json  (from wiki/features/{complex-feature}/progress.json schema)
  These templates are used by agents to create new wiki entries with the correct structure.

STEP 5: Create project root files
  Create docker-compose.yml with all 6 services (see vibe-devops-docker)
  Create .env.example from wiki/env-config.json template
  Create scripts/setup.sh, scripts/reset.sh, scripts/migrate.sh
  Create README.md with project overview

STEP 6: First build verification
  Run ./scripts/setup.sh from clean state
  Verify all 6 service health checks pass
  Run npm run test in backend — must pass
  Run npm run test in frontend — must pass
  Set wiki/dashboard.json build_status all to "passing"
  Set is_new_project: false
```

**`references/tiered-reading.md`** must define:
```
TIER 1 — Quick task (bug fix, small isolated change):
  Required: wiki/dashboard.json (quick_facts only)
            wiki/bugs/{bug}.json OR wiki/features/{name}.json (quick_facts + issue)
  Optional: wiki/api-contracts/{module}.json (only if API is touched)
  Skip:     All other files
  STOP READING WHEN:
    □ I understand exactly what is broken or needs changing
    □ I know what file(s) to touch
    □ I know which tests must still pass after

TIER 2 — Feature work (adding to or modifying an existing feature):
  Required: wiki/dashboard.json
            wiki/features/{name}/progress.json (what's already done)
            wiki/features/{name}/impact-map.json (regression scope)
            wiki/api-contracts/{module}.json (if API touched)
  Conditional: wiki/design/pages/{page}.json (if UI is touched)
               wiki/rulebook/coding-standards.json relevant section only
  Skip:     wiki/plan/, wiki/decisions/ (unless making a decision), wiki/glossary.json
  STOP READING WHEN:
    □ I know what already exists that's relevant
    □ I know the API contract shape
    □ I know what other features will be affected
    □ I know which tests must still pass

TIER 3 — New feature kickoff (first session of a brand new feature):
  Required: wiki/dashboard.json (full content)
            wiki/rulebook/_index.json (scan only)
            wiki/rulebook/techstack-decisions.json
            wiki/features/_index.json (status_table scan only)
            wiki/api-contracts/_index.json (status_table scan only)
            wiki/design/components/_index.json (status_table scan only)
            wiki/impact-map/_index.json (status_table scan only)
            wiki/impact-map/entity-registry.json
            wiki/test-cases/_index.json
  Then: role-specific reads defined in each skill
  STOP READING WHEN:
    □ I know what modules and entities already exist
    □ I know which existing contracts overlap with this feature
    □ I know which existing components can be reused
    □ I know which existing test files cover related features
    □ I know which features share entities with this feature
```

**`references/routing-table.md`** must define:

| Request Type | Tier | Layer 1 Skill | Layer 2 Skill |
|---|---|---|---|
| New requirement from user | 3 | vibe-product-owner | — wait for approval |
| Feature kickoff (after approval) | 3 | vibe-ba → vibe-designer-uxui → vibe-api-contractor | all dev skills |
| Backend task on existing feature | 2 | vibe-backend-general | vibe-backend-nestjs |
| Frontend task on existing feature | 2 | vibe-frontend-general | vibe-frontend-react |
| Full-stack feature | 3 | vibe-api-contractor first | both BE + FE |
| DB schema change | 2 | vibe-db-general | vibe-db-postgresql |
| Caching task | 2 | vibe-backend-general | vibe-cache-redis |
| Bug fix: critical | 1 | HOTFIX workflow | role skill for area |
| Bug fix: high / medium / low | 1 | vibe-qa-general | role skill for area |
| Security concern | 2 | vibe-security-general | vibe-security-nestjs |
| Docker / deploy | 2 | vibe-devops-general | vibe-devops-docker |
| Documentation gap | 1 | vibe-documentation | — self-contained |
| Design decision | 2 | vibe-designer-uxui | vibe-design-tailwind |
| Code review | 2 | vibe-code-review | — self-contained |
| Test writing | 2 | vibe-qa-general | vibe-qa-stack |
| Refactoring | 2 | vibe-backend-general OR vibe-frontend-general | appropriate L2 |
| Dependency update | 1 | vibe-devops-general | — |
| Sprint planning | 1 | vibe-product-owner | — |
| Wiki initialization | 1 | vibe-documentation | vibe-wiki-app-nextjs |

**`references/completion-checklist.md`** must define:
```
PRE-WORK:
[ ] wiki/dashboard.json read — build status noted
[ ] Changelog filtered — recent changes for this feature noted
[ ] Tiered reading applied — correct tier selected
[ ] Impact map read — regression_test_ids noted
[ ] Pre-existing test failures logged to wiki/bugs/ before touching code

BUILD:
[ ] npm run build — backend (if touched) — must pass
[ ] npm run build — frontend (if touched) — must pass
[ ] npm run build — wiki-app (if touched) — must pass
[ ] Every build error → wiki/bugs/ entry (even if fixed immediately)

TEST:
[ ] Unit tests written for every new function, service, or component
[ ] Full unit test suite passes — zero regressions allowed
[ ] Regression tests pass for all features in impact map entity registry
[ ] Playwright e2e passes for affected feature flows
[ ] QA manual + UX review against wireframes (if UI changed)

SECURITY (any new endpoint or auth change):
[ ] All SEC-001 through SEC-010 rules checked
[ ] No new env var added without DevOps review + env-config.json update

CODE REVIEW:
[ ] vibe-code-review triggered after dev, before QA sign-off
[ ] Implementation matches coding-standards.json
[ ] Implementation matches established_patterns in backend.json or frontend.json

ROLLBACK (if session cannot complete):
[ ] wiki/features/{name}/progress.json updated with partial state
[ ] next_session_notes written with exact resumption point
[ ] Feature status set to "in-progress" — never "done" unless complete
[ ] If code reverted: feature status → "planning", bug logged for what was attempted

WIKI UPDATE:
[ ] history/{date}.json — session entry written using scratch_notes
[ ] features/{name}/progress.json — all task states updated
[ ] features/{name}.json — status updated
[ ] api-contracts/ — updated if endpoints changed
[ ] env-config.json — updated if new vars added
[ ] impact-map/entity-registry.json — updated if entities modified
[ ] decisions/ — entry added for any architectural choice
[ ] techstack/backend.json — updated if new module or entity added
[ ] techstack/frontend.json — updated if new route, store, or API client added
[ ] dashboard.json — quick_facts refreshed
[ ] changelog.json — top entry added with relevant tags

DONE:
[ ] All checklist items green
[ ] wiki/features/{name}/progress.json: ALL tasks status "done"
[ ] No open critical or high bugs against this feature
[ ] No open ux-regression bugs against this feature
[ ] Wiki viewer reflects current state
```

**`references/hotfix-workflow.md`** must define:
```
HOTFIX WORKFLOW — Critical bugs only. Bypasses normal feature kickoff.

1. PM reads bug entry — confirm severity is "critical"
2. vibe-ba: impact assessment only (no full breakdown, 15 min max)
   → Which entities are touched?
   → Which tests must pass after the fix?
3. vibe-security-general: is this a security incident?
   → If yes: follow rotation_protocols from security-rules.json
4. Backend or Frontend: implement the fix
5. vibe-qa-general: expedited check
   → Unit test written for the specific fix
   → Playwright test for the affected flow only
6. vibe-devops-general: deploy to staging → verify → deploy to production
7. Wiki updates: bug status resolved, history entry, changelog entry
8. Post-mortem: write wiki/decisions/ entry on root cause and prevention
```

**`references/sprint-protocol.md`** must define:
```
SPRINT END CHECKLIST:
[ ] All in-progress features have progress.json updated
[ ] Incomplete features: status → "planning", progress.json preserved for next sprint
[ ] wiki/plan/sprints/sprint-{N}.json written with velocity and retrospective
[ ] wiki/bugs/_index.json counts verified accurate
[ ] vibe-documentation: full wiki audit checklist run
[ ] wiki/onboarding.json: follow all 5 steps in a clean environment to verify accuracy

SPRINT START CHECKLIST:
[ ] Create wiki/plan/sprints/sprint-{N+1}.json
[ ] Read dashboard.json blocked_features — evaluate unblock conditions
[ ] PO reads backlog.json — selects items and assigns to sprint
[ ] Update dashboard.json sprint fields
[ ] For each carried-over feature: read progress.json, update sprint number
[ ] Run full test suite from clean state — log any pre-existing failures
```

---

## 🎭 Layer 1 — Role General Skills

### `vibe-ba` — Business Analyst

```yaml
---
name: vibe-ba
description: >
  Business Analyst for the vibe fullstack project. Triggers after PO gets user
  approval and before any dev skill runs. Triggers on: "breakdown", "user story",
  "task breakdown", "what needs to be built", "acceptance criteria", "impact map",
  "edge cases", "requirements", "define tasks", or any request needing
  requirements turned into implementable work. Always runs before
  vibe-api-contractor. Ends with structured handoff to vibe-api-contractor.
---
```

**SKILL.md body:**

**1. Existing System Discovery — MANDATORY FIRST STEP**
```
Read in this exact order before writing anything:
1. wiki/dashboard.json → note existing_modules, existing_entities
2. wiki/techstack/backend.json → full module and entity list
   → Answer: Which existing entities does this feature touch?
   → Answer: Which existing modules need extending vs new modules needed?
3. wiki/api-contracts/_index.json → scan status_table
   → Answer: Do any existing contracts overlap with what this feature needs?
4. wiki/impact-map/entity-registry.json
   → Answer: Which features already use the entities this feature will touch?
5. wiki/test-cases/_index.json → test_file_registry
   → Answer: Which existing test files cover related features?

STOP READING WHEN: all 5 questions have clear answers.
Write an "Existing System Summary" at the top of breakdown.json before writing stories.
```

**2. User Story Format**
```json
{
  "id": "US-001",
  "story": "As a [role] I want [action] so that [value]",
  "existing_system_context": "What already exists that relates to this story",
  "tasks": [
    {
      "id": "TASK-001",
      "title": "",
      "role": "backend | frontend | db | devops | design | qa",
      "depends_on": [],
      "estimate": "S | M | L",
      "touches_existing": ["UserEntity", "AuthModule"]
    }
  ],
  "acceptance_criteria": [
    {
      "id": "AC-001",
      "given": "",
      "when": "",
      "then": "",
      "edge_cases": [
        "empty or null input",
        "duplicate or conflict",
        "unauthorized access attempt",
        "network timeout",
        "concurrent modification"
      ]
    }
  ],
  "out_of_scope": ["Explicitly what this story does NOT cover"]
}
```

**3. Impact Map Format**

The BA writes a **feature-scoped** impact map inside the feature folder. After writing, the BA MUST also update the **global** relations file under `wiki/impact-map/`.

**Feature-scoped impact map** → `wiki/features/{name}/impact-map.json`:
```json
{
  "feature": "feature-name",
  "existing_system_summary": "What BA found during discovery",
  "affects": [
    {
      "feature": "user-profile",
      "reason": "Shares UserEntity — modifying columns affects profile reads",
      "test_files": ["e2e/user-profile.spec.ts"],
      "risk": "high | medium | low"
    }
  ],
  "depends_on": [
    { "feature": "user-authentication", "reason": "Auth token required" }
  ],
  "shared_entities": ["UserEntity"],
  "new_entities_needed": [],
  "shared_api_contracts": ["api-contracts/users.json"],
  "regression_test_ids": ["e2e/auth.spec.ts", "src/modules/users/users.service.spec.ts"]
}
```

**Global relations file** → `wiki/impact-map/{feature-name}-relations.json`:
After writing the feature-scoped impact map above, the BA MUST mirror the cross-feature relationships into `wiki/impact-map/{feature-name}-relations.json` using the same data. This global file is consumed by the wiki-app impact graph visualizer and by other roles checking cross-feature impact. Both files must stay in sync — any update to one requires updating the other.

**4. BA / Designer Reconciliation**
After Designer writes wireframes, BA reads `wiki/features/{name}/design.json` and checks: does every acceptance criterion have a corresponding wireframe state? Any AC without a wireframe representation is a design gap — add to breakdown.json `design_gaps` array. Designer must resolve gaps before dev starts.

**5. Definition of Done**
```
[ ] Existing system discovery documented in breakdown.json
[ ] Every user story has at least one acceptance criterion
[ ] Every acceptance criterion has at least 2 edge cases
[ ] Impact map written with all fields populated (feature-scoped AND global relations file)
[ ] entity-registry.json cross-checked — no missed affected features
[ ] Out-of-scope explicitly documented per story
[ ] progress.json initialized for this feature with all tasks at "not-started"
```

> **Note:** BA / Designer reconciliation is NOT part of BA's DoD. It is performed by the Designer after wireframes are written (see vibe-designer-uxui Definition of Done). The BA hands off to the Designer, who then confirms every AC has wireframe representation.

**6. Handoff to Designer**
```
HANDOFF BLOCK:
{
  "feature_name": "",
  "breakdown_location": "wiki/features/{name}/breakdown.json",
  "impact_map_location": "wiki/features/{name}/impact-map.json",
  "existing_contracts_to_extend": [],
  "new_contracts_needed": [],
  "entities_touched": [],
  "regression_test_ids": []
}
→ Trigger vibe-designer-uxui with this context
→ After Designer completes and BA/Designer reconciliation passes,
  Designer triggers vibe-api-contractor (see Designer handoff)
```

---

### `vibe-product-owner` — Project Lead + PO

```yaml
---
name: vibe-product-owner
description: >
  Product Owner and Project Lead for the vibe fullstack project. Triggers on:
  any new requirement from the user, backlog changes, sprint planning, scope
  changes, priority decisions, "what should we build", "add to backlog", "plan",
  "roadmap", "proposal", "requirement", or any input needing clarification before
  work begins. Always runs before vibe-ba. Nothing enters the backlog without PO
  approval. Ends with handoff to vibe-ba once user approves.
---
```

**SKILL.md body:**

**1. Existing Context Read — MANDATORY FIRST STEP**
```
Read in this order:
1. wiki/dashboard.json (full)
   → Note existing_modules, active_features, blocked_features, sprint state
   → Is this requirement related to a blocked feature? Check first.
2. wiki/features/_index.json → status_table scan
   → Is there already a feature for this requirement?
3. wiki/plan/backlog.json → scan items
   → Is this already in the backlog at a different priority?

STOP READING WHEN: "I know what exists, what is in flight, and what is planned."
```

**2. Requirement Intake Workflow**
```
1. Read existing context (above)
2. Clarify requirement if ambiguous — ask ONE question maximum
3. Write proposal to wiki/plan/proposals/{date}-{slug}.json
   → Must include existing_context section from step 1
   → Must include 2-3 options with tradeoffs
   → Must include recommendation and rationale
   → Set approval.status: "pending"
4. Proposal appears in wiki-app approval queue
5. STOP — wait for user approval. Do not proceed.
6. On approval: write wiki/features/{name}.json, update backlog.json
7. Trigger vibe-ba with handoff block
```

**3. Proposal Format** — uses the `wiki/plan/proposals/{date}-{slug}.json` schema (see Wiki System schemas section). Key content fields:
```json
{
  "content": {
    "requirement_raw": "user's exact original words",
    "existing_context": {
      "related_features": [],
      "related_modules": [],
      "complexity_note": ""
    },
    "options": [
      {
        "id": "option-a",
        "title": "",
        "pros": [],
        "cons": [],
        "effort": "S | M | L | XL",
        "risks": []
      }
    ],
    "recommendation": "option-a",
    "rationale": "",
    "out_of_scope": [],
    "dependencies": []
  },
  "approval": { "required": true, "status": "pending" }
}
```

**4. Definition of Done**
```
[ ] Proposal written with existing_context section populated
[ ] 2-3 options with tradeoffs documented
[ ] User has approved in wiki-app approval queue
[ ] wiki/features/{name}.json created
[ ] wiki/plan/backlog.json updated
[ ] wiki/dashboard.json active_features updated
```

**5. Handoff to BA**
```
HANDOFF BLOCK:
{
  "proposal_location": "wiki/plan/proposals/{date}-{slug}.json",
  "feature_id": "",
  "approved_option": "option-a",
  "feature_file": "wiki/features/{name}.json",
  "priority": "high | medium | low",
  "sprint_target": 0,
  "po_notes": ""
}
→ Trigger vibe-ba with this context
```

---

### `vibe-designer-uxui` — Senior UX/UI Designer

```yaml
---
name: vibe-designer-uxui
description: >
  Senior UX/UI Designer for the vibe fullstack project. Triggers after BA
  breakdown is written and before frontend development starts. Also triggers on:
  any UI work, new page, new component, layout decision, UX flow question,
  "wireframe", "design", "layout", "component design", "what should this look
  like", "user flow", or any task producing visual output. Always runs before
  frontend dev. Ends with handoff to vibe-design-tailwind.
---
```

**SKILL.md body:**

**1. Existing Component Discovery — MANDATORY FIRST STEP**
```
Read in this order:
1. wiki/design/design-system.json
   → Does the design system exist? If not → initialize it first (see component-first.md)
   → Note dark_mode setting, color tokens, spacing scale
2. wiki/design/components/_index.json → status_table
   → List all existing components
   → For each UI element in this feature: can an existing component be extended?
3. wiki/design/pages/_index.json → status_table
   → Are any existing pages being modified? Read their design files first.

STOP READING WHEN: "I know which components already exist and what needs creating."
```

**2. Component-First Workflow**
```
Step 1: List all UI elements needed from BA breakdown
Step 2: For each element → check existing components (step above)
Step 3: Group elements into components — one concern per component
Step 4: Write component JSON files BEFORE page files
Step 5: Compose pages from components
Step 6: Mark design ready → BA reconciliation check runs
```

**3. Component and Page formats** — see wiki schema section above for full JSON structure

**4. UX Review (after frontend builds)**
```
Read wiki/design/pages/{name}.json and relevant component files.
Compare built output against wireframes state by state.
Check: loading, error, empty, success, hover, focus states.
Check: all accessibility requirements.
Log any deviation as bug: type "ux-regression", severity 🔵.
Update wiki/design/components/{name}.json review_history.
No feature is done with open ux-regression bugs.
```

**5. Definition of Done**
```
[ ] Existing component discovery complete — no unnecessary new components
[ ] Design system initialized (new project) or confirmed (existing)
[ ] Component JSON files written for every new or extended component
[ ] Page JSON file written with composition wireframe
[ ] All 5 states documented: default, loading, error, empty, success
[ ] Accessibility requirements listed for every interactive element
[ ] BA reconciliation passed — all ACs have wireframe representation
[ ] wiki/design/components/_index.json status_table updated
[ ] wiki/design/pages/_index.json status_table updated
```

**6. Handoff to Tailwind Skill AND API Contractor**
```
HANDOFF BLOCK (to vibe-design-tailwind):
{
  "new_components": [],
  "extended_components": [],
  "reused_unchanged": [],
  "component_files": [],
  "page_files": [],
  "dark_mode_required": true,
  "layer2_reference_needed": "design-tokens | component-library | wireframe-to-code | responsive-patterns"
}
→ Trigger vibe-design-tailwind with this context

HANDOFF BLOCK (to vibe-api-contractor — after BA/Designer reconciliation passes):
{
  "feature_name": "",
  "breakdown_location": "wiki/features/{name}/breakdown.json",
  "impact_map_location": "wiki/features/{name}/impact-map.json",
  "design_files": [],
  "existing_contracts_to_extend": [],
  "new_contracts_needed": [],
  "entities_touched": [],
  "regression_test_ids": []
}
→ Trigger vibe-api-contractor with this context
```

---

### `vibe-backend-general` — Backend General

```yaml
---
name: vibe-backend-general
description: >
  General backend engineering principles for the vibe fullstack project.
  Triggers on any backend task: API endpoint, service, guard, middleware,
  interceptor, module, entity, or backend bug fix. Also triggers for backend
  refactoring. Reads contract and impact map before any coding. Ends with
  structured handoff to vibe-backend-nestjs. Never implement without reading
  the approved contract first.
---
```

**SKILL.md body:**

**1. Existing System Read — MANDATORY FIRST STEP**
```
Read in this order:
1. wiki/dashboard.json → quick_facts.build_status (is backend currently passing?)
2. wiki/techstack/backend.json
   → modules: does this module already exist?
   → entities: does this entity already exist?
   → app_module_imports: what is already wired in AppModule?
   → established_patterns: what auth, pagination, error patterns are in use?
3. wiki/api-contracts/{module}.json (check _index first to confirm it exists)
   → GUARD: if status !== "approved" → STOP. Alert PM and API Contractor.
   → Check contract version
4. wiki/features/{name}/impact-map.json
5. wiki/impact-map/entity-registry.json for affected entities
6. wiki/rulebook/coding-standards.json backend section only
7. wiki/rulebook/security-rules.json (if endpoint involves auth or user data)

STOP READING WHEN:
  □ I know whether to create a new module or extend an existing one
  □ I know which entities are involved and whether they exist
  □ I know the exact contract I am implementing
  □ I know which regression tests must still pass
  □ I know the established patterns already used in this project
```

**2. Architecture Principles (tech-agnostic)**
- Controllers: HTTP only — zero business logic, no DB calls
- Services: all business logic — no raw HTTP concepts
- Repositories: only for complex queries — simple CRUD stays in service
- One module per domain — no cross-module direct imports without exports

**3. API Design Standards** — see `references/api-design-standards.md`

**4. Refactoring Protocol** — see `references/refactoring-protocol.md`

**5. Definition of Done**
```
[ ] Implementation exactly matches api-contract (every field, every status code)
[ ] Unit tests on service layer with mocked repositories
[ ] Security checklist passed for this endpoint
[ ] wiki/techstack/backend.json updated — new module, entity, or established pattern
[ ] wiki/api-contracts/{module}.json status updated to "implemented"
[ ] wiki/impact-map/entity-registry.json updated if entity was modified
[ ] .env.example updated if new config was needed
```

**6. Handoff to NestJS Skill**
```
HANDOFF BLOCK:
{
  "task_type": "new-module | extend-module | new-endpoint | entity-change",
  "module_name": "",
  "is_new_module": false,
  "entity_status": "new | existing | extending-existing",
  "contract_location": "wiki/api-contracts/{module}.json",
  "contract_version": "1.0",
  "impact_map_location": "wiki/features/{name}/impact-map.json",
  "layer2_reference_needed": "module-patterns | auth-patterns | typeorm-patterns | redis-patterns | ...",
  "established_pattern_note": "see wiki/techstack/backend.json established_patterns"
}
→ Trigger vibe-backend-nestjs with this context
```

---

### `vibe-frontend-general` — Frontend General

```yaml
---
name: vibe-frontend-general
description: >
  General frontend engineering principles for the vibe fullstack project.
  Triggers on any frontend task: component, page, state management, API
  integration, routing, or frontend bug fix. Reads design files and API
  contract before coding. Also triggers for frontend refactoring. Ends with
  structured handoff to vibe-frontend-react. Never build a component without
  reading the wireframe first.
---
```

**SKILL.md body:**

**1. Existing System Read — MANDATORY FIRST STEP**
```
Read in this order:
1. wiki/dashboard.json → quick_facts.build_status (is frontend passing?)
2. wiki/techstack/frontend.json
   → routes: does this page or route already exist?
   → api_clients: does this module's API client already exist?
   → shared_types: what version is the current types file?
3. wiki/design/pages/{page}.json → wireframe and component list
4. wiki/design/components/{each component needed} → wireframe, states, props
5. wiki/api-contracts/{module}.json
   → GUARD: if status !== "approved" → STOP. Alert PM and API Contractor.
   → Compare contract version to shared_types[module].contract_version in frontend.json
   → If versions mismatch: run npm run types:generate before building
6. wiki/state-map.json — answer the state decision questions below

STOP READING WHEN:
  □ I know which routes and components already exist vs need creating
  □ I know the wireframe for every component I'm building
  □ I have the approved contract and verified types file version matches
  □ I know where this state belongs (server or client, existing or new)
```

**2. State Decision Questions**
When reading wiki/state-map.json, answer these exactly:
```
Q1: Is this data fetched from an API?
  YES → React Query (server state)
    → Does a query for this endpoint already exist in frontend.json react_query_keys?
    → YES: reuse existing key, do not create a new one
    → NO: define new key following [module, entity, params?] convention
  NO → check Q3

Q2: Does this state need to persist across page navigation or refresh?
  YES → Zustand with persist middleware
  NO → React Query cache handles server state; local useState for UI state

Q3: Is this UI state shared between 3 or more unrelated components?
  YES → Zustand store
    → Does a relevant store already exist in frontend.json zustand_stores?
    → YES: add to it if same domain
    → NO: create new store, update wiki/state-map.json AND frontend.json
  NO → local useState (max 2 levels of prop drilling before reconsidering)
```

**3. Type Version Check**
```
Before building any component that calls an API:
1. Read wiki/api-contracts/{module}.json → note version field
2. Read wiki/techstack/frontend.json → find shared_types entry for this module → note contract_version
3. If versions match: proceed
4. If mismatch: run npm run types:generate, update frontend.json shared_types last_synced
Never build against a stale types file.
```

**4. Component Architecture** — see `references/component-architecture.md`

**5. Definition of Done**
```
[ ] Built output matches Designer's wireframe for all states
[ ] No inline styles anywhere
[ ] All API calls through src/api/ layer only
[ ] Loading, error, and empty states all handled
[ ] Unit test written for component logic
[ ] Accessibility attributes on all interactive elements
[ ] wiki/techstack/frontend.json updated if new route, store, or query key added
```

**6. Handoff to React Skill**
```
HANDOFF BLOCK:
{
  "task_type": "new-component | new-page | extend-component | api-integration",
  "components_to_build": [],
  "design_files": [],
  "state_decision": {
    "server_state_queries": ["existing key OR new key: [module, entity]"],
    "client_state_store": "existing store OR new store name"
  },
  "contract_location": "wiki/api-contracts/{module}.json",
  "contract_version": "1.0",
  "types_file": "src/types/{module}.types.ts",
  "types_version_verified": true,
  "layer2_reference_needed": "component-patterns | state-patterns | form-patterns | ..."
}
→ Trigger vibe-frontend-react with this context
```

---

### `vibe-db-general` — Database / Migration Manager

```yaml
---
name: vibe-db-general
description: >
  Database migration and schema management for the vibe fullstack project.
  Triggers on: any schema change, new table, column addition or removal,
  index creation, "migration", "schema change", "add column", "new table",
  "drop column", "rename column", or any database structure task. Runs before
  backend codes against any new schema. No schema change without this skill.
  Ends with handoff to vibe-db-postgresql.
---
```

**SKILL.md body:**

**1. Pre-Migration Read**
```
Before any schema change:
1. wiki/techstack/backend.json → entities section
   → Does this entity already exist?
   → What columns does it already have?
2. wiki/impact-map/entity-registry.json
   → What features and modules already use this entity?
   → Changing this entity triggers regression tests for all of them.
3. wiki/dashboard.json → last_migration
   → What was the last migration run? Check for ordering conflicts.

STOP READING WHEN:
  □ I know exactly what exists vs what needs to change
  □ I know which features will be affected by this change
```

**2. Migration Discipline**
```
Naming: {timestamp}-{verb}-{noun}.ts
  e.g. 1705123456789-add-bio-to-users.ts

Breaking change rule (MANDATORY for column removal or rename):
  Sprint N:   Add new nullable column
  Sprint N+1: Migrate data, make non-nullable if needed, remove old column
  Never: drop or rename a column in a single migration

Rollback rule:
  Every migration must have a complete down() function that reverses up() exactly.
  Test down() locally before committing any migration.

Index rule:
  All foreign key columns must have an index.
  All columns used in WHERE clauses on large tables must have an index.
```

**3. Definition of Done**
```
[ ] Migration naming follows convention
[ ] up() migration tested locally — passes
[ ] down() rollback tested locally — reverses cleanly
[ ] Indexes created for all foreign keys and frequent query columns
[ ] Seed files updated if new required data added
[ ] wiki/techstack/backend.json entities section updated
[ ] wiki/impact-map/entity-registry.json updated
[ ] wiki/dashboard.json last_migration updated
```

**4. Handoff to PostgreSQL Skill**
```
HANDOFF BLOCK:
{
  "change_type": "new-table | add-column | modify-column | add-index | seed-update",
  "tables_affected": [],
  "breaking_change": false,
  "two_step_required": false,
  "layer2_reference_needed": "migration-patterns | schema-design | index-strategy | seed-patterns | query-patterns | performance-patterns"
}
→ Trigger vibe-db-postgresql with this context
```

---

### `vibe-api-contractor` — API Contractor

```yaml
---
name: vibe-api-contractor
description: >
  API Contract owner for the vibe fullstack project. Triggers on any feature
  touching both backend and frontend, "define contract", "API spec", "endpoint
  design", "what is the API shape", "request response shape", or any time
  backend and frontend need to coordinate on an interface. Always runs before
  backend or frontend starts on a shared feature. Contract must reach
  approved status before any implementation begins. No exceptions.
---
```

**SKILL.md body:**

**1. Existing Contract Check — MANDATORY FIRST STEP**
```
Read in this order:
1. wiki/api-contracts/_index.json → status_table
   → Does a contract file already exist for this module?
2. If yes → read wiki/api-contracts/{module}.json
   → What endpoints already exist?
   → What response DTOs are already defined?
   → What is the current version?
   → Are any endpoints deprecated? If so, do not add to that module — version it.
3. wiki/techstack/backend.json → established_patterns
   → Use the project's established error_shape and pagination shape, not generic patterns.

STOP READING WHEN: "I know exactly which endpoints exist and what conventions to follow."
```

**2. Contract-First Rule**
```
GUARD: Neither backend nor frontend may write code until:
  → wiki/api-contracts/{module}.json exists
  → approval.status === "approved"

If contract is missing when dev is requested:
  → Write contract first, set status: "draft"
  → Alert PM and both dev roles to review
  → Only proceed when status is "approved"
```

**3. Contract Format** — see `references/contract-format.md`

**4. Contract Validation**
```
After backend builds:
  → Run integration test: every API response field must match contract exactly
  → Any field difference = bug, not a verbal agreement to deviate
  → Update contract status to "implemented" only after validation passes

After frontend builds:
  → Check that every field consumed by frontend exists in the contract
  → Check that no fields are accessed that aren't in the contract
  → Any deviation = bug
```

**5. Version Protocol**
```
Backward-compatible change (add optional field): 1.0 → 1.1
Breaking change (remove field, rename, change type, change path): 1.0 → 2.0
On any version bump:
  → Update wiki/api-contracts/{module}.json version field
  → Run npm run types:generate
  → Update wiki/techstack/frontend.json shared_types contract_version for this module
  → Notify PM: frontend types must be regenerated before frontend builds
```

**6. Definition of Done**
```
[ ] Existing contracts checked — no duplication or conflict
[ ] All endpoints for this feature defined with full request, response, and error shapes
[ ] Types generated to src/types/{module}.types.ts
[ ] approval.status set to "approved"
[ ] wiki/api-contracts/_index.json status_table updated
[ ] wiki/techstack/frontend.json shared_types entry created or updated
```

**7. Handoff**
```
HANDOFF BLOCK:
{
  "contract_location": "wiki/api-contracts/{module}.json",
  "contract_version": "1.0",
  "contract_status": "approved",
  "types_generated": true,
  "types_file": "src/types/{module}.types.ts",
  "endpoints_defined": [],
  "ready_for_backend": true,
  "ready_for_frontend": true
}
→ Notify PM → PM unblocks backend and frontend in parallel
```

---

### `vibe-security-general` — Security General

```yaml
---
name: vibe-security-general
description: >
  Security principles and rulebook owner for the vibe fullstack project.
  Triggers on: any new endpoint, any auth change, security concern, "is this
  secure", "auth", "permissions", "rate limiting", "CORS", "helmet",
  "sanitize", "secrets", JWT, refresh token, or any task touching
  authentication or authorization. Also runs as a review step after any
  backend task adds new endpoints. Co-owns rulebook with DevOps and Backend.
  Ends with handoff to vibe-security-nestjs.
---
```

**SKILL.md body:**

**1. Pre-Review Read**
```
Read in this order:
1. wiki/rulebook/security-rules.json — full rules + established_patterns
2. wiki/decisions/ — scan for any previous auth architecture decisions
3. wiki/api-contracts/{module}.json — what does this endpoint expose?

STOP READING WHEN:
  □ I know all applicable security rules for this endpoint
  □ I know the established auth patterns already in use
```

**2. Security Checklist**
Run for every new endpoint and every auth change:
```
[ ] SEC-001: No passwords, raw tokens, or secrets in responses
[ ] SEC-002: JWT expiry within limits (access 15min, refresh 7days)
[ ] SEC-003: Rate limiting applied to auth endpoints
[ ] SEC-004: Helmet middleware active
[ ] SEC-005: CORS uses explicit origins only
[ ] SEC-006: Authorization checked at service layer, not only at guard
[ ] SEC-007: No secrets in code — all via ConfigService
[ ] SEC-008: No credential logging
[ ] SEC-009: Free-text inputs sanitized
[ ] SEC-010: Auth decisions logged in wiki/decisions/
```

**3. Rulebook Ownership**
Any new security rule requires agreement from Security, DevOps, and Backend lead. All three must sign the audit array entry in security-rules.json before the rule is enforced.

**4. Draft Contract Guard**
Never review security of a contract with status "draft". Only review "approved" contracts — an approved contract is the final implementation target.

**5. Definition of Done**
```
[ ] All SEC-001 through SEC-010 rules checked and passed
[ ] Any new rule proposed → all three owners agreed → rulebook updated
[ ] Auth architecture decisions logged in wiki/decisions/
[ ] established_patterns in security-rules.json updated if new pattern introduced
```

**6. Handoff to Security NestJS Skill**
```
HANDOFF BLOCK:
{
  "concern_type": "auth-implementation | api-hardening | input-sanitization | secrets",
  "contract_location": "wiki/api-contracts/{module}.json",
  "rules_violated": [],
  "layer2_reference_needed": "auth-security | api-security | input-security | secrets-management"
}
→ Trigger vibe-security-nestjs with this context
```

---

### `vibe-qa-general` — QA/QC General

```yaml
---
name: vibe-qa-general
description: >
  Senior Quality Engineer for the vibe fullstack project. Runs in three phases:
  pre-dev (with PO and BA before coding starts), during-dev (unit tests as
  features are completed), and post-dev (e2e, manual, and UX after feature
  is built). Triggers on: "test this", "write tests", "QA", "check quality",
  "does this work", "test cases", UX review requests, accessibility check,
  or any quality verification. Ends with handoff to vibe-qa-stack.
---
```

**SKILL.md body:**

**1. Pre-Dev Phase — Read Protocol**
```
Read in this order:
1. wiki/features/{name}/breakdown.json → acceptance criteria and edge cases
2. wiki/features/{name}/impact-map.json → regression_test_ids
3. wiki/features/{name}/design.json → wireframe states for UX test cases
   → GUARD: if design.json does not exist yet, write PASS 1 only.
             Do NOT write UX test cases until designer completes design.json.
4. wiki/test-cases/_index.json → regression_groups for affected area
5. wiki/impact-map/entity-registry.json → all features sharing touched entities

STOP READING WHEN:
  □ I have all acceptance criteria
  □ I know all wireframe states to test (or know design is not yet ready)
  □ I know all regression test files to run
```

**2. Two-Pass Test Case Writing**
```
PASS 1 — Functional test cases (written after BA done, before designer done):
  Source: breakdown.json acceptance criteria
  Covers: happy path, sad path, all edge cases listed in ACs, error states
  Type: "functional"
  Written to: wiki/test-cases/{feature}.json sections[0]

PASS 2 — UX test cases (written after Designer done):
  Source: design.json wireframes and component states
  Covers: loading state appearance, error state appearance, empty state,
          transitions, hover states, focus states, responsive at breakpoints,
          accessibility (ARIA labels, focus order, contrast)
  Type: "ux"
  Written to: wiki/test-cases/{feature}.json sections[1]
  Each UX test case must reference the specific wireframe state it verifies.

Both passes must complete before the feature is marked done.
```

**3. Regression Impact Protocol**
```
Before running any tests after a code change:
1. Read wiki/features/{name}/impact-map.json → regression_test_ids
2. Read wiki/impact-map/entity-registry.json → all features using same entities
3. Run regression test files from both sources before feature-specific tests
4. Any new failure in regression = new bug logged before any other work continues
```

**4. Bug Logging Protocol** — see `references/bug-protocol.md`

**5. Definition of Done**

Pre-dev phase (before coding starts):
```
[ ] PASS 1 functional test cases WRITTEN to wiki/test-cases/{feature}.json
[ ] PASS 2 UX test cases WRITTEN (after design complete) to wiki/test-cases/{feature}.json
[ ] Regression test files identified from impact map
[ ] wiki/test-cases/_index.json test_file_registry updated with planned test files
```

Post-dev phase (after feature is built):
```
[ ] PASS 1 functional test cases all PASSING
[ ] PASS 2 UX test cases all PASSING
[ ] Regression test files all PASSING
[ ] Playwright e2e test written and passing
[ ] Manual browser test completed
[ ] UX review against wireframes completed
[ ] No open bugs of any severity against this feature
```

**6. Handoff to QA Stack**
```
HANDOFF BLOCK:
{
  "feature": "",
  "test_cases_location": "wiki/test-cases/{feature}.json",
  "functional_test_count": 0,
  "ux_test_count": 0,
  "regression_files": [],
  "layer2_reference_needed": "playwright-patterns | vitest-patterns | nestjs-testing-patterns | supertest-patterns | ux-testing-patterns"
}
→ Trigger vibe-qa-stack with this context
```

---

### `vibe-devops-general` — DevOps General

```yaml
---
name: vibe-devops-general
description: >
  DevOps and infrastructure principles for the vibe fullstack project. Triggers
  on: Docker issues, deploy questions, "container", "docker-compose",
  "environment variable", "new env var", "deploy", "setup", "infrastructure",
  "dockerfile", "how do I run this", "setup script", "staging", "production",
  or any task touching containers or deployment. Co-owns devops rulebook with
  Security. Ends with handoff to vibe-devops-docker.
---
```

**SKILL.md body:**

**1. Pre-Work Read**
```
Read in this order:
1. wiki/techstack/infrastructure.json — current services, ports, environments
2. wiki/env-config.json — all current env vars
3. wiki/rulebook/devops-rules.json — enforced rules

STOP READING WHEN:
  □ I know the current service configuration
  □ I know all existing env vars
  □ I know which rules apply to this task
```

**2. Environment Config Workflow**
```
When any role needs a new environment variable:
1. DevOps reviews the request — is it necessary?
2. DevOps adds to docker-compose.yml env section
3. DevOps adds to .env.example with example value
4. DevOps adds to wiki/env-config.json with all required fields
5. Security classifies: is_secret true or false?
6. Role updates their config module to consume via ConfigService
7. All 6 steps must complete before the feature using the var is considered done.
```

**3. Container Principles**
```
Every Docker service must have:
- Multi-stage build (builder → runtime)
- Alpine base image
- Non-root user in runtime stage
- Health check defined
- Named volume for persistent data (if any)
- No secrets in Dockerfile — env vars only
```

**4. Environment Promotion**
```
LOCAL → STAGING:
  [ ] Build images with staging env vars
  [ ] Run migrations against staging DB
  [ ] Smoke test: all health endpoints, auth flow, one critical path
  [ ] wiki/techstack/infrastructure.json staging section updated

STAGING → PRODUCTION:
  [ ] All staging smoke tests passed
  [ ] DB backup taken before migration
  [ ] Migrations run with rollback plan ready
  [ ] Health checks verified post-deploy
  [ ] wiki/history/{date}.json deploy entry written
```

**5. Definition of Done**
```
[ ] docker-compose up from clean state works end to end
[ ] .env.example matches wiki/env-config.json exactly
[ ] All DEV-001 through DEV-010 rules satisfied
[ ] wiki/techstack/infrastructure.json reflects current setup
[ ] scripts/setup.sh runs without error on clean machine
```

**6. Handoff to Docker Skill**
```
HANDOFF BLOCK:
{
  "task_type": "new-service | dockerfile-update | compose-update | setup-script | env-var | deploy",
  "services_affected": [],
  "layer2_reference_needed": "dockerfile-nestjs | dockerfile-react | dockerfile-nextjs | docker-compose-patterns | redis-docker | setup-scripts | security-scanning"
}
→ Trigger vibe-devops-docker with this context
```

---

### `vibe-code-review` — Code Review (Self-Contained)

```yaml
---
name: vibe-code-review
description: >
  Code review skill for the vibe fullstack project. Triggers after any dev
  completes implementation and BEFORE QA sign-off. Also triggers on: "review
  code", "check implementation", "code quality", "does this follow standards",
  "review my code", or any quality check on written code. Reviews against
  wiki rulebook, established patterns, and contract compliance. No feature
  is marked done without passing code review. This skill is self-contained
  with no Layer 2 counterpart.
---
```

**SKILL.md body:**

**1. Review Read Protocol**
```
Read in this order:
1. wiki/rulebook/coding-standards.json → applicable role section (backend or frontend)
2. wiki/techstack/backend.json established_patterns (if reviewing backend)
   OR wiki/techstack/frontend.json (if reviewing frontend)
3. wiki/api-contracts/{module}.json → verify response shape matches exactly
4. wiki/rulebook/security-rules.json → applicable rules

STOP READING WHEN: ready to review the code.
```

**2. Backend Review Checklist** — see `references/backend-review-checklist.md`

**3. Frontend Review Checklist** — see `references/frontend-review-checklist.md`

`references/backend-review-checklist.md` must cover:
```
[ ] No business logic in controller
[ ] No any types anywhere
[ ] All DTOs have class-validator decorators
[ ] Every service method has a unit test
[ ] Response shape matches api-contract exactly (check every field name and type)
[ ] All exceptions are typed NestJS exceptions (not raw Error)
[ ] Multi-step DB operations use transactions
[ ] Swagger @ApiOperation and @ApiResponse on every endpoint
[ ] No raw SQL without explanation comment
[ ] No console.log in committed code
[ ] SEC-001 through SEC-010 all respected
[ ] Code follows established_patterns from wiki/techstack/backend.json
[ ] No new pattern introduced without a wiki/decisions/ entry
```

`references/frontend-review-checklist.md` must cover:
```
[ ] No inline styles — Tailwind classes only
[ ] No fetch or axios calls inside components
[ ] No useEffect for data fetching
[ ] Loading, error, and empty states all handled
[ ] Types imported from src/types/ only — not manually defined
[ ] Accessibility attributes on all interactive elements
[ ] Component matches wireframe design file exactly
[ ] Unit test written for component logic
[ ] No duplicate query keys (check frontend.json react_query_keys)
[ ] No duplicate Zustand stores (check frontend.json zustand_stores)
[ ] No new Zustand store without updating wiki/state-map.json
```

**4. Review Output**
```
PASS: update wiki/features/{name}/progress.json code-review task to "done"
FAIL: create bug entry for each violation
  → Standards violation: severity "medium"
  → Contract mismatch: severity "high"
  → Security rule violation: severity "high"
  → No fix can proceed until all bugs resolved
```

**5. Definition of Done**
```
[ ] Both backend and frontend review checklists completed (as applicable)
[ ] All violations logged as bugs with correct severity
[ ] All violations resolved and verified
[ ] progress.json code-review task marked "done"
```

---

### `vibe-documentation` — Documentation Specialist (Self-Contained)

```yaml
---
name: vibe-documentation
description: >
  Documentation specialist for the vibe fullstack project. Triggers on:
  "update docs", "document this", wiki audit, sprint end documentation,
  "wiki is outdated", stale files, missing entries, "add to wiki", glossary
  updates, onboarding updates, or any documentation gap. Also runs
  automatically at sprint end as a mandatory audit step. Enforces JSON
  schema, file size budgets, and hierarchy rules. This skill is
  self-contained with no Layer 2 counterpart.
---
```

**SKILL.md body:**

**1. Sprint Audit Protocol** — see `references/wiki-audit-checklist.md`

**2. Schema Enforcement**
```
Validate all wiki files against wiki/_schema/ definitions.
Any file failing schema validation: fix before audit is complete.
Any file exceeding size budget: split into sub-files and update _index.json.
```

**3. Cross-Reference Audit**
```
Every see_also link must resolve to an existing file.
Every _index.json status_table link must resolve.
No orphan files — every file reachable from a _index.json.
```

**4. Onboarding Validation**
```
At every sprint end: follow wiki/onboarding.json steps 1-5 in a fresh environment.
If any step fails: fix onboarding.json before sprint end is complete.
This is not optional — a stale onboarding.json is a critical documentation bug.
```

**5. Wiki-App Sync**
```
After any new file or folder added to wiki/:
Update wiki-app sidebar navigation to include the new item.
Run npm run build in wiki-app — must pass.
```

**6. Definition of Done**
```
[ ] All wiki files pass schema validation
[ ] No file exceeds size budget
[ ] All _index.json files have required sections
[ ] No orphan files
[ ] wiki/glossary.json covers all new domain terms introduced this sprint
[ ] wiki/onboarding.json validated in clean environment
[ ] wiki-app sidebar reflects current wiki structure
[ ] wiki/env-config.json matches .env.example exactly
```
---

## 🎭 Layer 2 — Tech-Specific Skills

### Layer 2 Mandatory Header

Every Layer 2 SKILL.md must begin with these two guard blocks before any other content:

```
## Stack Validation Guard
Read wiki/rulebook/techstack-decisions.json.
Confirm: {relevant decision}.chosen === "{expected technology}".
If mismatch: STOP. Alert PM. This skill does not apply to this project's stack.

## Layer 1 Bypass Guard
If you were triggered directly (not from a Layer 1 skill), complete these checks first:
[ ] Read wiki/dashboard.json (quick_facts)
[ ] Read wiki/api-contracts/{module}.json — GUARD: status must be "approved"
[ ] Read wiki/features/{name}/impact-map.json
[ ] Read wiki/rulebook/security-rules.json established_patterns
[ ] Read wiki/techstack/backend.json OR frontend.json established_patterns
Only after all checks are complete, proceed to the reference file routing table.
```

---

### `vibe-backend-nestjs`

```yaml
---
name: vibe-backend-nestjs
description: >
  NestJS senior engineer skill for the vibe fullstack project. Triggered by
  vibe-backend-general. Also triggers directly on: "NestJS", "nest module",
  "nest service", "nest controller", "TypeORM", "entity", "guard",
  "interceptor", "pipe", "nest decorator", "swagger decorator", "nest test",
  or any NestJS-specific implementation question. Loads ONLY the single
  reference file matching the current task type. Always runs stack validation
  and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| New project scaffold | `references/project-setup.md` | [comprehensive] |
| New module / controller / service / repo | `references/module-patterns.md` | [comprehensive] |
| Auth / JWT / guards / decorators | `references/auth-patterns.md` | [comprehensive] |
| DTO / class-validator / pipes | `references/validation-patterns.md` | [medium] |
| TypeORM entity / relations / QueryBuilder | `references/typeorm-patterns.md` | [comprehensive] |
| Redis / caching / rate limiting | `references/redis-patterns.md` | [medium] |
| Pagination / sorting / filtering | `references/pagination-patterns.md` | [focused] |
| Exception handling / filters / error shapes | `references/error-patterns.md` | [medium] |
| Swagger / OpenAPI decoration | `references/swagger-patterns.md` | [medium] |
| Unit tests / integration tests | `references/testing-patterns.md` | [comprehensive] |
| N+1 / query optimization / performance | `references/performance-patterns.md` | [medium] |

**Reference file content requirements:**

`project-setup.md` [comprehensive]: CLI scaffold commands with exact package versions (include `json-schema-to-typescript` as a dev dependency for type generation), `main.ts` with ValidationPipe (whitelist+transform), HttpExceptionFilter, TransformInterceptor, Swagger DocumentBuilder+SwaggerModule, CORS with ConfigService, Helmet, `app.module.ts` with TypeOrmModule.forRootAsync, ConfigModule with Joi validation, CacheModule with Redis adapter, ThrottlerModule. `database.config.ts` full pattern. Mandatory folder structure with every directory. All required env vars. package.json scripts including migration commands AND `"types:generate"` script that: reads all `wiki/api-contracts/*.json` files, extracts request/response schemas, runs `json-schema-to-typescript` to convert each schema to TypeScript interfaces, writes output to `../frontend/src/types/{module}.types.ts`, and logs generated files. Include the full script implementation (either inline Node.js script or a `scripts/generate-types.ts` file referenced by the npm script) — do NOT leave as a placeholder.

`module-patterns.md` [comprehensive]: Full module template (imports, controllers, providers, exports). Controller template with decorators in correct order. Service template with DI, transaction usage. Repository class template (when vs when not). `@GetUser()` custom decorator. Module re-export rules. Circular dependency avoidance. Feature module integration checklist (add to AppModule).

`auth-patterns.md` [comprehensive]: JwtStrategy with validate method and payload shape. RefreshTokenStrategy. JwtAuthGuard with `@Public()` decorator. RBAC with `@Roles()` and RolesGuard. AuthModule full wiring (PassportModule, JwtModule, strategies). Full login flow: validate → sign access token → sign refresh token → store refresh hash in Redis. Full refresh flow: validate → rotate tokens → update Redis. Logout: remove from Redis. All auth DTOs.

`validation-patterns.md` [medium]: All common class-validator decorators with examples. Custom validator creation. `@Type()` for nested objects and arrays. `@Transform()` for sanitization. `@ValidateNested()` + `@Type()` for nested DTOs. Global ValidationPipe config. Validation error response shape.

`typeorm-patterns.md` [comprehensive]: Entity with all column types. `@PrimaryGeneratedColumn('uuid')`. `@CreateDateColumn`, `@UpdateDateColumn`. Soft delete with `@DeleteDateColumn`. `@ManyToOne` / `@OneToMany` with onDelete cascade. `@ManyToMany` with junction table. `@BeforeInsert` / `@BeforeUpdate` hooks. Repository injection. DataSource transaction pattern. QueryBuilder (select, where, join, orderBy, skip, take). Raw SQL rules (always parameterized). Migration generation command.

`redis-patterns.md` [medium]: `CacheModule.registerAsync` with Redis adapter. Manual CacheManager injection. `cache.get`, `cache.set`, `cache.del`. Cache key naming: `{module}:{entity}:{id}`. TTL table: user data 5min, public data 60min, session 7 days. ThrottlerModule + Redis store. Per-endpoint throttle override. Refresh token hash storage pattern.

`pagination-patterns.md` [focused]: PaginationDto class. Service returning `{ data, meta: { total, page, limit, totalPages } }`. `findAndCount` TypeORM pattern. QueryBuilder skip/take. Sort field whitelist.

`error-patterns.md` [medium]: All NestJS built-in exceptions with use cases. HttpExceptionFilter implementation. TransformInterceptor for consistent response envelope. Error shape `{ statusCode, message, error, timestamp, path }`. Custom exception classes. Log without leaking internals.

`swagger-patterns.md` [medium]: All `@Api*` decorators. `@ApiProperty` with type, example, description, enum. `@ApiPropertyOptional`. `@ApiBody`, `@ApiParam`, `@ApiQuery`. Response DTO decoration. Bearer auth setup in DocumentBuilder.

`testing-patterns.md` [comprehensive]: TestingModule with mocked providers. Repository mock factory. Service unit test template (happy path, not-found, forbidden, conflict). Controller unit test with mocked service. Supertest integration test setup with test DB (using TEST_DATABASE_URL). `beforeEach` seeding, `afterEach` cleanup. Testing guards with mock ExecutionContext. jest.config.ts with 80% coverage threshold.

`performance-patterns.md` [medium]: N+1 identification and fix with explicit JOINs. `select` specific columns. QueryBuilder `leftJoinAndSelect` vs `leftJoin` + manual select. EXPLAIN ANALYZE usage. Redis cache decision: when to cache a service method. Connection pool config. `@nestjs/schedule` for background jobs.

---

### `vibe-frontend-react`

```yaml
---
name: vibe-frontend-react
description: >
  React senior engineer skill for the vibe fullstack project. Triggered by
  vibe-frontend-general. Also triggers directly on: "React component",
  "React Query", "Zustand", "Vite", "Tailwind component", "React Router",
  "React Hook Form", "Vitest", "RTL", or any React-specific implementation
  question. Loads ONLY the single reference file matching the current task.
  Always runs stack validation and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| New project scaffold | `references/project-setup.md` | [comprehensive] |
| New UI or feature component | `references/component-patterns.md` | [comprehensive] |
| Server state / React Query | `references/state-patterns.md` | [medium] |
| API client / Axios | `references/api-patterns.md` | [medium] |
| Routing / protected routes | `references/routing-patterns.md` | [focused] |
| Forms / React Hook Form + Zod | `references/form-patterns.md` | [medium] |
| Vitest / RTL unit tests | `references/testing-patterns.md` | [comprehensive] |
| WCAG AA / ARIA / focus management | `references/accessibility-patterns.md` | [medium] |
| Code splitting / memoization | `references/performance-patterns.md` | [medium] |

**Reference file content requirements:**

`project-setup.md` [comprehensive]: `npm create vite@latest` with exact packages and versions (react-router-dom, @tanstack/react-query, axios, zustand, react-hook-form, zod, @hookform/resolvers, tailwindcss, clsx, lucide-react). Dev dependencies (vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test, msw). `tailwind.config.ts` with content paths. `vite.config.ts` with test config and coverage. `tsconfig.json` strict settings. Axios instance at `src/api/client.ts`. QueryClient in main.tsx. Complete folder structure. `VITE_API_BASE_URL` env var.

`component-patterns.md` [comprehensive]: UI component template (no API, pure props). Feature component template (with React Query). Props interface with JSDoc. `cn()` utility with clsx + tailwind-merge. All state variants mandatory (loading skeleton, error with retry, empty with CTA, success). `forwardRef` for input components. Compound component pattern. When to split (>150 lines or >5 props). Component barrel exports.

`state-patterns.md` [medium]: `useQuery` template with queryKey, queryFn, staleTime, enabled. Query key factory pattern. `useMutation` with onSuccess invalidation and onError toast. Optimistic update pattern. `useInfiniteQuery` for paginated lists. Zustand store template with actions and typed selectors. `persist` middleware. Never: useEffect for data fetching, useState for server data.

`api-patterns.md` [medium]: Axios instance (baseURL from VITE_API_BASE_URL, timeout, withCredentials). Request interceptor: attach Authorization header. Response interceptor: 401 → logout, 403 → forbidden toast, 500 → error toast. Per-module API function template (typed request + response). Error type matching backend error shape.

`routing-patterns.md` [focused]: React Router v6 setup in main.tsx. ProtectedRoute component. PublicRoute component (redirect if authenticated). `React.lazy` + `Suspense` for route-level code splitting. `useNavigate`, `useParams` with validation.

`form-patterns.md` [medium]: `useForm` with zodResolver. Zod schema matching backend DTO. `register` for simple fields, `Controller` for complex. Field-level error display. Async submission with loading state. Form reset after success. File upload field.

`testing-patterns.md` [comprehensive]: vitest.config.ts with jsdom and coverage. setup.ts with jest-dom matchers. Component render with providers wrapper (QueryClient, Router). `screen` queries — prefer getByRole over getByTestId. userEvent patterns. `waitFor` and `findBy*` for async. MSW for API mocking. React Query mock with `retry: false`. Zustand mock with `useStore.setState`. Coverage 70% minimum.

`accessibility-patterns.md` [medium]: All interactive elements need accessible names. Form inputs need associated labels. Error messages via `aria-describedby`. Loading states with `aria-live="polite"`. Focus management after modal open/close. Skip links. `role` attribute rules. axe-core integration with vitest.

`performance-patterns.md` [medium]: React.lazy + Suspense for routes. React.memo rules (pure components only). useMemo rules (expensive calculations only). useCallback rules (memoized children only). react-virtual for lists >100 items. Image `loading="lazy"`. Bundle analysis with rollup-plugin-visualizer.

---

### `vibe-db-postgresql`

```yaml
---
name: vibe-db-postgresql
description: >
  PostgreSQL and TypeORM database skill for the vibe fullstack project.
  Triggered by vibe-db-general. Also triggers directly on: "PostgreSQL",
  "TypeORM migration", "create migration", "schema design", "add index",
  "seed data", "query optimization", "EXPLAIN", "slow query", or any
  database implementation task. Loads ONLY the single reference file
  matching the current task. Always runs stack validation and Layer 1
  bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| New table design | `references/schema-design.md` | [medium] |
| Migration creation / rollback | `references/migration-patterns.md` | [comprehensive] |
| Index creation | `references/index-strategy.md` | [medium] |
| Seed data | `references/seed-patterns.md` | [focused] |
| Complex queries / QueryBuilder | `references/query-patterns.md` | [medium] |
| Slow query / EXPLAIN ANALYZE | `references/performance-patterns.md` | [medium] |

**Reference file content requirements:**

`schema-design.md` [medium]: PostgreSQL naming (snake_case tables and columns). Column type selection guide. NOT NULL defaults. Unique and check constraints. UUID with `gen_random_uuid()`. `created_at` / `updated_at` defaults. Soft delete with `deleted_at`. JSON vs JSONB rules.

`migration-patterns.md` [comprehensive]: TypeORM CLI commands (generate, run, revert). Migration file anatomy (up + down). Add column (nullable first). Remove column (two-step: deprecate then remove). Rename column (two-step: add + copy + remove). Data migration pattern. Migration test checklist (up, down, up again). Naming: `{timestamp}-{verb}-{noun}.ts`.

`index-strategy.md` [medium]: Always index foreign keys. Index frequent WHERE columns. Composite index column order (selectivity descending). Partial index for filtered queries. GIN for JSONB queries. Full-text search with tsvector. Index naming: `IDX_{table}_{columns}`. Over-indexing warning signs.

`seed-patterns.md` [focused]: TypeORM seeder class pattern. Seed execution order (parent tables first). Idempotent seeds (check before insert). Dev seeds (rich realistic data). Test seeds (minimal predictable data). Prod seeds (reference data only, no test accounts).

`query-patterns.md` [medium]: Repository `find` options vs QueryBuilder decision rules. QueryBuilder joins. Subqueries. Raw SQL rules (parameterized only, never string concatenation). Pagination with skip/take. Aggregations (count, sum, avg).

`performance-patterns.md` [medium]: `EXPLAIN ANALYZE` in psql. Seq scan vs index scan identification. N+1 elimination with explicit join. TypeORM connection pool config (`extra.max`). Query result caching via Redis. Slow query log setup.

---

### `vibe-cache-redis`

```yaml
---
name: vibe-cache-redis
description: >
  Redis caching skill for the vibe fullstack project. Triggered by
  vibe-backend-general when caching is involved, or directly on: "Redis",
  "cache", "caching strategy", "cache invalidation", "rate limit",
  "refresh token storage", "session", or any task involving Redis.
  Loads ONLY the single reference file matching the current task.
  Always runs stack validation and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| Cache strategy decision | `references/cache-strategy.md` | [medium] |
| Cache invalidation | `references/invalidation-patterns.md` | [medium] |
| NestJS CacheModule setup | `references/nestjs-integration.md` | [medium] |
| Session / refresh tokens / rate limiting | `references/session-patterns.md` | [medium] |

**Reference file content requirements:**

`cache-strategy.md` [medium]: What to cache (read-heavy, rarely changing). What NOT to cache (user-specific sensitive data, PII without encryption, auth tokens in response bodies). TTL table: user-specific 5min, public data 60min, static reference 24hr, session 7days. Cache-aside pattern. Never cache: passwords, raw tokens, full user objects with sensitive fields.

`invalidation-patterns.md` [medium]: Key pattern delete. Event-driven invalidation via service method on mutation. Cache stampede prevention (locking pattern). Stale-while-revalidate simulation. Manual invalidation endpoint for admin use.

`nestjs-integration.md` [medium]: `CacheModule.registerAsync` with `cache-manager-ioredis` adapter. Manual `@Inject(CACHE_MANAGER) private cache: Cache`. `cache.get(key)`, `cache.set(key, value, ttl)`, `cache.del(key)`. Cache key naming convention: `{module}:{entity}:{id}`. Testing cached services (mock CacheManager).

`session-patterns.md` [medium]: Refresh token stored as hash (`crypto.createHash('sha256').update(token).digest('hex')`), never raw. TTL = token expiry. Revocation by key deletion. `@nestjs/throttler` with `ThrottlerStorageRedisService`. Per-endpoint override with `@Throttle()`.

---

### `vibe-design-tailwind`

```yaml
---
name: vibe-design-tailwind
description: >
  Tailwind CSS and shadcn/ui design system skill for the vibe fullstack
  project. Triggered by vibe-designer-uxui after design files are written,
  or directly on: "Tailwind", "style this", "CSS", "design tokens", "color
  system", "typography", "spacing", "responsive", "shadcn", "component
  styling", or any styling task. Loads ONLY the single reference file
  matching the current task. Always runs stack validation and Layer 1
  bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| Design tokens / theme config | `references/design-tokens.md` | [medium] |
| shadcn/ui components | `references/component-library.md` | [medium] |
| Wireframe to Tailwind code | `references/wireframe-to-code.md` | [medium] |
| Responsive layout | `references/responsive-patterns.md` | [focused] |

**Reference file content requirements:**

`design-tokens.md` [medium]: `tailwind.config.ts` extend with project color palette from design-system.json tokens (primary, secondary, destructive, muted, background, foreground). Typography scale. Spacing scale. Border radius. Dark mode config: read `wiki/design/design-system.json quick_facts.dark_mode` — if "enabled" set `darkMode: 'class'` and populate dark color tokens; if "disabled" omit `darkMode` entirely and skip dark color tokens; if "planned" set `darkMode: 'class'` but leave dark color tokens empty with TODO comments. CSS custom properties for runtime theming.

`component-library.md` [medium]: shadcn/ui CLI setup (`npx shadcn-ui@latest init`). Component installation commands. `cn()` utility (clsx + tailwind-merge). Extending shadcn without forking (className prop override). lucide-react icon usage. Never override shadcn styles with `!important`.

`wireframe-to-code.md` [medium]: ASCII wireframe → flex vs grid decision. Common layout patterns (sidebar, card grid, form layout, header+main+footer). Spacing system application (use scale, not arbitrary values). Component composition from design files. State class patterns (loading: opacity-50 + pointer-events-none, error: border-destructive, empty: text-muted-foreground).

`responsive-patterns.md` [focused]: Mobile-first prefix order (base → sm: → md: → lg: → xl:). Stack on mobile / side-by-side on desktop pattern. Responsive navigation (hamburger → full sidebar). Responsive typography. Breakpoints from design-system.json.

---

### `vibe-security-nestjs`

```yaml
---
name: vibe-security-nestjs
description: >
  NestJS security implementation skill for the vibe fullstack project.
  Triggered by vibe-security-general. Also triggers directly on: "implement
  auth", "JWT setup", "bcrypt", "Helmet config", "CORS config", "rate
  limiting setup", "input sanitization", "secrets config", or any NestJS
  security implementation task. Loads ONLY the single reference file
  matching the current task. Always runs stack validation and Layer 1
  bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| JWT / bcrypt / auth flow | `references/auth-security.md` | [comprehensive] |
| Helmet / CORS / rate limiting | `references/api-security.md` | [medium] |
| Input sanitization / injection prevention | `references/input-security.md` | [medium] |
| Env vars / secrets / ConfigService | `references/secrets-management.md` | [medium] |
| Docker image CVE scanning | `references/vulnerability-scanning.md` | [focused] |

**Reference file content requirements:**

`auth-security.md` [comprehensive]: bcrypt 12 salt rounds. `crypto.randomBytes(32).toString('hex')` for refresh tokens. `crypto.createHash('sha256')` before Redis storage. JWT payload (sub, email, iat, exp — nothing sensitive, no passwords or roles in payload). `@nestjs/jwt` sign options. 15min access token. 7day refresh token. Full token rotation implementation. Logout with Redis key deletion. All auth-related security patterns.

`api-security.md` [medium]: Helmet in main.ts with recommended defaults. CORS configuration: `origin` array from ConfigService (never `*` outside local). ThrottlerModule 10 req/min on auth endpoints. `@SkipThrottle()` for safe public endpoints. `@Throttle()` for custom limits.

`input-security.md` [medium]: `sanitize-html` for rich text fields. Server-side MIME type check for file uploads (not extension only). TypeORM parameterization (prevents SQL injection by default). `@IsUrl()`, `@IsEmail()` for format validation. No direct user input in Redis keys.

`secrets-management.md` [medium]: `@nestjs/config` with Joi schema (fail fast on missing required vars). `ConfigService` injection everywhere — never `process.env.X` directly. Secrets never logged (redact in interceptor). `.env.example` always in sync with wiki/env-config.json. Secret classification: `is_secret: true` vars get extra protection.

`vulnerability-scanning.md` [focused]: `trivy image {image-name}` command. `docker scout cves {image-name}` as alternative. Run after every `docker build`. CRITICAL CVEs block deployment. HIGH CVEs logged to wiki/bugs/ with severity "high". Schedule: automated scan on every CI build.

---

### `vibe-qa-stack`

```yaml
---
name: vibe-qa-stack
description: >
  Testing tools skill for the vibe fullstack project. Triggered by
  vibe-qa-general. Also triggers directly on: "write Playwright test",
  "write Vitest test", "write Supertest test", "e2e test", "unit test",
  "integration test", "test setup", "test this component", "test this
  endpoint", or any test implementation task. Loads ONLY the single
  reference file matching the current task. Always runs stack validation
  and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| Playwright e2e test | `references/playwright-patterns.md` | [comprehensive] |
| Vitest + RTL frontend unit test | `references/vitest-patterns.md` | [comprehensive] |
| NestJS backend unit test | `references/nestjs-testing-patterns.md` | [comprehensive] |
| Supertest API integration test | `references/supertest-patterns.md` | [medium] |
| UX / visual / accessibility test | `references/ux-testing-patterns.md` | [medium] |

**Reference file content requirements:**

`playwright-patterns.md` [comprehensive]: `playwright.config.ts` (baseURL from env, chromium+firefox+webkit projects, screenshot on failure, video on failure). Page Object Model class template. `test.use({ storageState: 'auth.json' })` for pre-authenticated tests. `test.beforeAll` auth fixture that logs in and saves storage state. `data-testid` naming convention. `page.getByRole` preferred over `page.locator`. `expect(page).toHaveURL`. `expect(page).toHaveTitle`. `page.route` for network mocking. Full feature flow test template. Parallel test config. Run against local Docker stack.

`vitest-patterns.md` [comprehensive]: vitest.config.ts with jsdom. setup.ts with jest-dom. Component render helper with all providers. `screen` query guidance (getByRole > getByText > getByTestId). `userEvent.type`, `userEvent.click`, `userEvent.selectOptions`. `waitFor` and `findBy*`. MSW handler patterns for API mocking. React Query mock setup. Zustand mock with `useStore.setState`. Snapshot testing rules (avoid except for stable UI).

`nestjs-testing-patterns.md` [comprehensive]: TestingModule setup with all mocked providers. Repository mock factory (`{ find: jest.fn(), findOne: jest.fn(), save: jest.fn(), delete: jest.fn(), create: jest.fn() }`). Service unit test template covering: happy path, not-found, forbidden, conflict, DB error. Controller unit test with mocked service. Guard testing with mock ExecutionContext. Custom decorator testing. Coverage config (80% minimum for services).

`supertest-patterns.md` [medium]: Test DB setup using TEST_DATABASE_URL env var. `beforeAll` create test DB connection and run migrations. `beforeEach` seed specific required data. `afterEach` clean test data. `afterAll` close connection. Test auth endpoint → extract token → use in subsequent request headers. Assert response body shape field by field. Assert response status codes.

`ux-testing-patterns.md` [medium]: axe-playwright setup with `checkA11y(page)`. Screenshot comparison setup (Playwright visual comparisons). Wireframe state verification — check that loading state renders spinner, error state renders message, empty state renders CTA. Tab key navigation test for focus order. Color contrast check with axe. UX regression bug logging: create wiki/bugs/ entry with type "ux-regression" and screenshot reference.

---

### `vibe-devops-docker`

```yaml
---
name: vibe-devops-docker
description: >
  Docker and Docker Compose skill for the vibe fullstack project. Triggered
  by vibe-devops-general. Also triggers directly on: "Dockerfile",
  "docker-compose", "container", "build image", "multi-stage build",
  "alpine", "health check", "setup script", "docker build", or any container
  implementation task. Loads ONLY the single reference file matching the
  current task. Always runs stack validation and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| Backend Dockerfile | `references/dockerfile-nestjs.md` | [medium] |
| Frontend Dockerfile | `references/dockerfile-react.md` | [medium] |
| Wiki app Dockerfile | `references/dockerfile-nextjs.md` | [medium] |
| docker-compose.yml | `references/docker-compose-patterns.md` | [comprehensive] |
| Redis container config | `references/redis-docker.md` | [focused] |
| Setup / reset / migrate scripts | `references/setup-scripts.md` | [medium] |
| CVE scanning | `references/security-scanning.md` | [focused] |

**Reference file content requirements:**

`dockerfile-nestjs.md` [medium]: 3-stage (deps → builder → runtime). `node:20-alpine` for all stages. Non-root user `node` in runtime. `.dockerignore` (node_modules, dist, .env, *.spec.ts, coverage). `HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1`. Production install only (`npm ci --only=production`). Copy only dist/ and node_modules/. Expose 3000.

`dockerfile-react.md` [medium]: 2-stage (node:20-alpine builder → nginx:alpine). nginx.conf with `try_files $uri $uri/ /index.html` for SPA routing. Gzip on. Cache-control headers for static assets. Build args for `VITE_API_BASE_URL`. Expose 80.

`dockerfile-nextjs.md` [medium]: `output: 'standalone'` in next.config.js. 2-stage build (node:20-alpine). Volume mount point `/app/wiki` for wiki JSON files. Non-root user. Copy standalone build output. Expose 3001.

`docker-compose-patterns.md` [comprehensive]: All 6 services with exact config (postgres, postgres-test, redis, backend, frontend, wiki-app). The `postgres-test` service uses the same image as postgres but maps to port 5433, uses a separate named volume `pgdata-test`, and is configured with `POSTGRES_DB=testdb`, `POSTGRES_USER=testuser`, `POSTGRES_PASSWORD=testpass`. Backend service depends on both postgres and postgres-test. Named volumes for pgdata, pgdata-test, and redisdata. Health checks with `condition: service_healthy` in depends_on. `env_file: [.env]`. `restart: unless-stopped`. `networks: [app-network]` with bridge driver. Port mappings matching the port table in project root structure. wiki-app volume mount `./wiki:/app/wiki` (NOT read-only — wiki-app approval flow writes back to wiki JSON files).

`redis-docker.md` [focused]: `redis:7-alpine`. `command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru`. Named volume for persistence. `HEALTHCHECK CMD redis-cli -a ${REDIS_PASSWORD} ping`.

`setup-scripts.md` [medium]: `setup.sh`: check Docker installed, check .env exists else copy .env.example with instruction to edit, `docker-compose pull`, `docker-compose up -d`, wait loop checking all 6 health checks, print all service URLs. `reset.sh`: `docker-compose down -v`, then call setup.sh. `migrate.sh`: `docker-compose exec backend npm run migration:run`.

`security-scanning.md` [focused]: `trivy image {image}` for each service. Run after every `docker build`. CRITICAL = block, log to console. HIGH = log to wiki/bugs/ as severity "high". Example commands for scanning each of the 6 service images (skip postgres-test as it uses same image as postgres).

---

### `vibe-wiki-app-nextjs`

```yaml
---
name: vibe-wiki-app-nextjs
description: >
  Next.js wiki viewer app skill for the vibe fullstack project. Triggered
  by vibe-devops-general for wiki-app container setup, or by vibe-documentation
  for app updates. Also triggers directly on: "wiki-app", "wiki viewer",
  "wiki UI", "approval queue", "update wiki app", "add wiki page",
  "impact graph", or any task building or modifying the wiki-app.
  Loads ONLY the single reference file matching the current task.
  Always runs stack validation and Layer 1 bypass guard first.
---
```

**Reference Routing Table:**

| Task | Reference File | Scope |
|---|---|---|
| App structure / new page | `references/app-structure.md` | [comprehensive] |
| Reading wiki JSON files | `references/wiki-reader-api.md` | [medium] |
| Approval queue UI | `references/approval-flow.md` | [medium] |
| Impact graph visualization | `references/impact-graph.md` | [medium] |

**Reference file content requirements:**

`app-structure.md` [comprehensive]: Full Next.js 14 App Router structure. `layout.tsx` with sidebar auto-generated from wiki folder scan. TypeScript interfaces matching universal JSON envelope (the `wiki-types.ts` file). All page templates: dashboard (build status, sprint, open bugs), features list+detail, bugs list+detail, decisions timeline, design system viewer (components + pages), impact map, api-contracts browser, approval queue. Tailwind + shadcn/ui. Server components read `quick_facts` only for list views — load full content only on detail pages.

`wiki-reader-api.md` [medium]: `fs.readFileSync` in Server Components. Recursive `_index.json` scanner for sidebar navigation tree. JSON parse with try/catch and schema validation. `unstable_cache` wrapper for file reads (revalidate: 60s). `quick_facts` extraction pattern for list rendering. File path resolution relative to `wiki/` volume mount.

`approval-flow.md` [medium]: Approval queue page listing all items where `approval.status === "pending"`. Renders `content.tldr` + `content.summary` + options if proposal. Approve and Reject buttons. `/api/approve/route.ts` Server Action: reads file, verifies `meta.version` matches, writes only `approval` fields and appends audit entry, increments `meta.version`. On approval of proposals: moves item from `proposals/` to `plan/backlog.json`. Version mismatch: returns conflict error displayed in UI.

`impact-graph.md` [medium]: React Flow setup for feature relation visualization. Reads `wiki/impact-map/entity-registry.json` and all `wiki/impact-map/{feature}-relations.json` files. Node = feature (color by status: planning=grey, in-progress=blue, done=green, blocked=red). Edge = relation with reason label. Click node → navigate to feature detail page. Highlight regression path when hovering over a feature.
---

## 🔀 Tech Stack Decisions

`wiki/rulebook/techstack-decisions.json` — created during project initialization, drives Layer 2 skill routing.

```json
{
  "decisions": [
    {
      "id": "backend-framework",
      "category": "backend",
      "chosen": "NestJS",
      "version": "10.x",
      "routes_to_skill": "vibe-backend-nestjs",
      "evaluated": [
        { "option": "Express", "rejected_reason": "Too unopinionated for multi-agent consistency" },
        { "option": "Fastify", "rejected_reason": "NestJS DI and module system better fits agent role boundaries" }
      ],
      "rationale": "NestJS enforces module/service/controller structure that maps cleanly to agent role boundaries",
      "revisit_if": "Project pivots to microservices or serverless"
    },
    {
      "id": "orm",
      "category": "backend",
      "chosen": "TypeORM",
      "version": "0.3.x",
      "routes_to_skill": "vibe-backend-nestjs → references/typeorm-patterns.md",
      "evaluated": [
        { "option": "Prisma", "rejected_reason": "TypeORM migrations give more control for complex schema evolution" }
      ],
      "rationale": "TypeORM native NestJS integration and full migration control",
      "revisit_if": "Team prefers schema-first workflow or project adds GraphQL"
    },
    {
      "id": "database",
      "category": "database",
      "chosen": "PostgreSQL",
      "version": "15.x",
      "routes_to_skill": "vibe-db-postgresql",
      "evaluated": [
        { "option": "MySQL", "rejected_reason": "PostgreSQL JSONB, full-text search, and advanced constraints superior" },
        { "option": "MongoDB", "rejected_reason": "Relational data model fits project domain better" }
      ],
      "rationale": "PostgreSQL for ACID compliance, rich type system, full-text search",
      "revisit_if": "Data model becomes predominantly unstructured or document-oriented"
    },
    {
      "id": "caching",
      "category": "backend",
      "chosen": "Redis",
      "version": "7.x",
      "routes_to_skill": "vibe-cache-redis",
      "evaluated": [
        { "option": "In-memory NestJS cache", "rejected_reason": "Not shared across instances, lost on restart" },
        { "option": "Memcached", "rejected_reason": "Redis data structures needed for rate limiting and sessions" }
      ],
      "rationale": "Redis for caching, rate limiting, refresh token storage, and session management",
      "revisit_if": "Infrastructure budget requires eliminating Redis"
    },
    {
      "id": "frontend-framework",
      "category": "frontend",
      "chosen": "React + Vite",
      "version": "React 18.x + Vite 5.x",
      "routes_to_skill": "vibe-frontend-react",
      "evaluated": [
        { "option": "Next.js", "rejected_reason": "Project is SPA — SSR not needed. wiki-app uses Next.js." },
        { "option": "Vue 3", "rejected_reason": "React ecosystem and agent familiarity superior" }
      ],
      "rationale": "React + Vite for fast SPA with maximum agent pattern availability",
      "revisit_if": "SEO becomes a hard requirement"
    },
    {
      "id": "design-system",
      "category": "frontend",
      "chosen": "Tailwind CSS + shadcn/ui",
      "version": "Tailwind 3.x",
      "routes_to_skill": "vibe-design-tailwind",
      "evaluated": [
        { "option": "Material UI", "rejected_reason": "Tailwind gives more design control without fighting a component system" }
      ],
      "rationale": "Utility-first styling with accessible primitives for vibe-coding speed",
      "revisit_if": "Design system must match a specific enterprise brand"
    },
    {
      "id": "e2e-testing",
      "category": "qa",
      "chosen": "Playwright",
      "version": "1.x",
      "routes_to_skill": "vibe-qa-stack → references/playwright-patterns.md",
      "evaluated": [
        { "option": "Cypress", "rejected_reason": "Playwright cross-browser support and speed advantages decisive" }
      ],
      "rationale": "Playwright for cross-browser e2e with parallelism and network mocking",
      "revisit_if": "Team has strong existing Cypress expertise"
    },
    {
      "id": "containerization",
      "category": "devops",
      "chosen": "Docker + Docker Compose",
      "routes_to_skill": "vibe-devops-docker",
      "evaluated": [
        { "option": "Kubernetes", "rejected_reason": "Docker Compose sufficient for dev and simple production — K8s adds unnecessary complexity" }
      ],
      "rationale": "One-command full stack — simple enough for any agent to operate without orchestration expertise",
      "revisit_if": "Traffic requires horizontal scaling or multi-server deployment"
    },
    {
      "id": "wiki-viewer",
      "category": "documentation",
      "chosen": "Next.js",
      "version": "14.x App Router",
      "routes_to_skill": "vibe-wiki-app-nextjs",
      "rationale": "SSR for fast initial load, API routes for write-back approvals, file-based routing maps to wiki sections",
      "revisit_if": "Wiki becomes fully static with no approval write-back needed"
    }
  ]
}
```

---

## 🔄 Universal Workflow

Every role. Every request. Every time. No exceptions.

```
═══════════════════════════════════════════════════════════
SESSION START
═══════════════════════════════════════════════════════════

1. Read wiki/dashboard.json
   → is_new_project: true AND project_initialized: null → run project-init.md
   → build_status failing → log pre-existing bug before touching code
   → Note: existing_modules, existing_entities, existing_routes

2. Read wiki/changelog.json
   → Filter entries by tags matching current task's feature or module
   → Any entry < 3 days old matching? Read that wiki/history/{date}.json entry.

3. Apply tiered reading — choose Tier 1, 2, or 3
   → Stop when all STOP READING questions answered

4. Open scratch note in wiki/history/{date}.json scratch_notes
   → Append running notes throughout session
   → Use at end of session for accurate wiki updates

═══════════════════════════════════════════════════════════
REQUIREMENT GATE (new features only)
═══════════════════════════════════════════════════════════

5.  vibe-product-owner: reads existing context → writes proposal → wiki/plan/proposals/
6.  Proposal appears in wiki-app approval queue
7.  STOP — wait for explicit user approval before proceeding
8.  On approval: write wiki/features/{name}.json → vibe-ba handoff

═══════════════════════════════════════════════════════════
FEATURE KICKOFF (every new feature, after approval)
═══════════════════════════════════════════════════════════

9.  vibe-ba: existing system discovery → breakdown.json + impact-map.json
10. vibe-designer-uxui: existing component discovery → component files + page files
11. BA / Designer reconciliation: every AC has a wireframe representation
12. vibe-api-contractor: existing contract check → contracts defined → status: approved
13. vibe-qa-general: PASS 1 functional test cases (from BA breakdown)
14. vibe-qa-general: PASS 2 UX test cases (from Designer wireframes — after design complete)
15. vibe-project-manager: go-ahead → dev begins

═══════════════════════════════════════════════════════════
IMPACT CHECK (before any code change, every time)
═══════════════════════════════════════════════════════════

16. Read wiki/features/{name}/impact-map.json → regression_test_ids
17. Read wiki/impact-map/entity-registry.json → all features using same entities
18. Read wiki/test-cases/_index.json → regression_groups for affected area
19. Run existing test suite from clean state
20. Log any pre-existing failures to wiki/bugs/ BEFORE touching code

═══════════════════════════════════════════════════════════
LAYER 1 → LAYER 2 ROUTING
═══════════════════════════════════════════════════════════

21. Layer 1 skill: applies general principles + mandatory pre-coding reads
22. Layer 1 skill: compiles HANDOFF BLOCK with all context
23. Layer 1 skill: triggers Layer 2 with handoff block
24. Layer 2: Stack Validation Guard — confirm technology matches techstack-decisions.json
25. Layer 2: Layer 1 Bypass Guard — if triggered directly, complete Layer 1 checks first
26. Layer 2: reads ONLY the single reference file matching the task type

═══════════════════════════════════════════════════════════
IMPLEMENT
═══════════════════════════════════════════════════════════

27. Backend: reads approved contract + established_patterns from backend.json
    → Implements to contract exactly — no deviations
28. Frontend: reads design files + approved contract + verifies type version matches
    → Applies state decision tree from state-map.json
    → Builds component matching wireframe exactly
29. Neither side deviates from contract → any deviation triggers vibe-api-contractor

═══════════════════════════════════════════════════════════
BUILD
═══════════════════════════════════════════════════════════

30. npm run build — backend (if touched) — MUST PASS before continuing
31. npm run build — frontend (if touched) — MUST PASS before continuing
32. npm run build — wiki-app (if touched) — MUST PASS before continuing
33. Every build error → wiki/bugs/ entry even if fixed in same session
34. Update progress.json: mark completed tasks

═══════════════════════════════════════════════════════════
TEST
═══════════════════════════════════════════════════════════

35. Unit tests written for every new function, service, or component
36. Full unit test suite: zero regressions
37. Regression tests: ALL files from impact map entity registry pass
38. Playwright e2e: affected feature flows pass
39. QA PASS 1: functional test cases all pass
40. QA PASS 2: UX test cases all pass
41. Designer: UX review against wireframes → update review_history → log any ux-regression bugs

═══════════════════════════════════════════════════════════
CODE REVIEW
═══════════════════════════════════════════════════════════

42. vibe-code-review: triggered after dev, before QA sign-off
43. Backend checklist: coding-standards.json + established_patterns + contract shape
44. Frontend checklist: coding-standards.json + wireframe match + state rules
45. PASS → progress.json code-review task "done"
    FAIL → bug entries created, resolved before marking done

═══════════════════════════════════════════════════════════
SECURITY
═══════════════════════════════════════════════════════════

46. For any new endpoint or auth change: vibe-security-general checklist
47. Verify against established_patterns in security-rules.json
48. Any violation = bug (high severity minimum) before marking done
49. New Docker image built: run vulnerability scan

═══════════════════════════════════════════════════════════
LOG
═══════════════════════════════════════════════════════════

50. Every failure → wiki/bugs/ (even resolved in same session)
51. Complex bug → promote to folder immediately
52. Architectural choice → wiki/decisions/ entry with established_pattern

═══════════════════════════════════════════════════════════
WIKI UPDATE (use scratch_notes for accuracy)
═══════════════════════════════════════════════════════════

53. wiki/history/{date}.json → full session entry from scratch_notes
54. wiki/features/{name}/progress.json → all task states updated
55. wiki/features/{name}.json or _index → status updated
56. wiki/api-contracts/{module}.json → if endpoints changed
57. wiki/env-config.json → if new vars added
58. wiki/impact-map/entity-registry.json → if entities modified
59. wiki/impact-map/{feature}-relations.json → if new relations found
60. wiki/decisions/ → entry if architectural decision made
61. wiki/design/components/{name}.json → review_history if designer reviewed
62. wiki/techstack/backend.json → if new module, entity, or established pattern
63. wiki/techstack/frontend.json → if new route, store, API client, or query key
64. wiki/dashboard.json → refresh all quick_facts
65. wiki/changelog.json → prepend entry with relevant tags

═══════════════════════════════════════════════════════════
DONE
═══════════════════════════════════════════════════════════

66. All completion checklist items green
67. wiki/features/{name}/progress.json: ALL tasks "done"
68. No open critical or high bugs against this feature
69. No open ux-regression bugs
70. Wiki viewer reflects current state
```

---

## 🤝 Cross-Role Handoff Protocols

```
User Requirement
  → PO reads existing context (dashboard, features, backlog)
  → PO writes proposal with existing_context section
  → Proposal → wiki-app approval queue
  → STOP: user approves or rejects
  → On approval: feature entry written → BA handoff

BA
  → Existing system discovery (5-step read protocol)
  → breakdown.json + impact-map.json written
  → HANDOFF BLOCK to Designer

Designer
  → Existing component discovery (design system + components _index)
  → Component files written (components before pages)
  → Page files written
  → Design ready flag set
  → BA reconciliation: every AC has wireframe representation
  → HANDOFF BLOCK to API Contractor

API Contractor
  → Existing contract check (_index + module file if exists)
  → Contracts written (draft → approved)
  → Types generated: npm run types:generate
  → GUARD: neither backend nor frontend starts until status === "approved"
  → HANDOFF BLOCK to PM → PM unblocks backend and frontend

QA (pre-dev, two passes)
  → PASS 1: functional test cases from BA (after BA done)
  → PASS 2: UX test cases from Designer (after Designer done)
  → Test cases in wiki/test-cases/{feature}.json before dev starts

Backend
  → Reads existing system (modules, entities, established_patterns)
  → Reads approved contract, verifies version
  → Implements to contract exactly
  → Build must pass
  → After build: API Contractor validates implementation vs contract
  → vibe-code-review: backend review checklist

Frontend
  → Reads existing system (routes, stores, types)
  → Verifies type version matches contract version (run types:generate if mismatch)
  → Reads design files (wireframe + component specs)
  → Applies state decision tree
  → Implements to wireframe + contract
  → After build: API Contractor validates consumption vs contract
  → vibe-code-review: frontend review checklist

Designer (post-build)
  → Reviews built feature against wireframes state by state
  → Updates review_history in component files
  → Logs ux-regression bugs for any deviation

QA (post-dev)
  → Runs PASS 1 functional tests
  → Runs PASS 2 UX tests
  → Runs regression group tests from impact map
  → Logs all bugs with severity
  → No "done" until all tests pass and all bugs resolved

Bug lifecycle:
  Logged by: QA | build | code-review
  Triaged by: PM (severity assignment + owner assignment)
  critical → HOTFIX workflow (bypasses kickoff)
  high/medium/low → assigned to role, added to sprint
  Fixed by: assigned role
  Verified by: QA
  Status → resolved
  Security-related? → Security Reviewer confirms fix, updates established_patterns

New environment variable:
  Any role requests → DevOps reviews necessity
  DevOps: docker-compose.yml + .env.example updated
  DevOps: wiki/env-config.json updated (version incremented)
  Security: classify is_secret
  Role: config module updated to consume via ConfigService
  All 5 steps before feature using the var is considered done

New security rule:
  Any role identifies need → Security Reviewer proposes
  Security + DevOps + Backend lead all agree
  wiki/rulebook/security-rules.json updated (all three in audit array)
  wiki/changelog.json entry with "security" tag

Schema change:
  BA identifies in breakdown.json new_entities_needed
  vibe-db-general reviews and approves change
  Migration written, up() and down() both tested
  Backend codes against new schema ONLY after migration approved
  wiki/impact-map/entity-registry.json updated
  wiki/techstack/backend.json entities section updated

Sprint boundary:
  Sprint end: PM runs sprint-protocol.md end checklist
  Sprint end: Documentation runs full wiki audit
  Sprint end: Documentation validates wiki/onboarding.json in clean environment
  Sprint start: PM runs sprint-protocol.md start checklist
  Sprint start: blocked_features check → evaluate unblock conditions
```

---

## 📐 Wiki Quality Standards

### For AI Agents

| Standard | Implementation |
|---|---|
| Fast scanning | `quick_facts` at top of every file — read before `content.sections` |
| Status without full read | `meta.status` + `quick_facts.one_line` sufficient for routing decisions |
| Role-aware navigation | `_index.json navigation.by_role` — go directly where your role needs |
| Over-read prevention | `content.skip_if` on every file + tiered reading in PM skill |
| Regression discovery | `impact-map/entity-registry.json` — single source for cross-feature impact |
| Settled decisions | `wiki/decisions/` with `established_pattern` — never re-debate |
| Contract guard | `approval.status === "approved"` before any implementation |
| Partial work recovery | `progress.json` per feature — resume exactly where previous session stopped |
| Change detection | `changelog.json` with tags — filter to relevant changes since last session |
| Conflict detection | `meta.version` integer — detect concurrent write conflicts |
| New vs existing project | `dashboard.json is_new_project` flag |
| Project patterns | `backend.json established_patterns` + `security-rules.json established_patterns` |
| Type freshness | `frontend.json shared_types contract_version` vs `api-contracts version` |

### For Humans

| Standard | Implementation |
|---|---|
| Browser navigation | wiki-app at http://localhost:3001 |
| Project health | Dashboard page: build status, sprint status, open bug counts |
| Bug urgency | 🔴 critical 🟠 high 🟡 medium 🟢 low 🔵 ux-regression |
| Recent changes | changelog.json top-20 on dashboard, filterable by tag |
| Approval workflow | wiki-app approval queue — read proposal, approve or reject |
| Feature relations | Impact graph — D3/React Flow visual map of feature dependencies |
| Design system | wiki-app design page — component library + wireframe viewer |
| Sprint progress | Sprint page — feature status bars + velocity chart |
| Onboarding | wiki/onboarding.json → 5 steps from zero to running |

---

## ✅ Skill Generation Checklist

When generating all 22 skills from this prompt, verify every skill:

### Every Skill
```
[ ] YAML frontmatter with name + description (pushy triggers, explicit phrases)
[ ] SKILL.md under 500 lines
[ ] Session start: read wiki/dashboard.json instruction
[ ] Wiki update instruction at end of every task
[ ] Build + test gate before marking done
[ ] "Do Not" section with explicit constraints
[ ] Definition of Done section
```

### Layer 0 — Project Manager
```
[ ] New vs existing project detection
[ ] Tiered reading (3 tiers) with STOP trigger questions per tier
[ ] Routing table covering all 18 request types
[ ] references/project-init.md defined (full scaffold procedure incl. wiki-templates generation)
[ ] references/wiki-templates/ — all 5 template files created from wiki JSON schemas
[ ] references/completion-checklist.md defined (all steps)
[ ] references/sprint-protocol.md defined (start + end checklists)
[ ] references/hotfix-workflow.md defined
[ ] Scratch note instruction
[ ] "What changed since last session" changelog filter
[ ] Blocked feature check at sprint start
```

### Layer 1 Skills
```
[ ] Existing system read protocol (specific to this role)
[ ] "STOP READING WHEN" questions (specific to this role)
[ ] Structured HANDOFF BLOCK at end (not just "trigger X")
[ ] Reference files listed with scope tags
[ ] Tech-agnostic principles only (no NestJS, React, etc.)
[ ] No workflow content duplicated from PM skill
[ ] Definition of Done section present
[ ] Frontmatter with pushy description present
```

### Self-Contained Layer 1 Skills (code-review, documentation)
```
[ ] Frontmatter with explicit self-contained note (no Layer 2)
[ ] No HANDOFF BLOCK (these do not trigger Layer 2)
[ ] Skill generation checklist carve-out documented
[ ] Reference files have full content requirements defined
[ ] Definition of Done present
```

### Layer 2 Skills
```
[ ] Frontmatter with name and description
[ ] Stack Validation Guard at top
[ ] Layer 1 Bypass Guard at top
[ ] Reference file routing TABLE with scope tags
[ ] Instruction: load ONLY the single reference file for current task
[ ] All reference files in routing table have content requirements defined
[ ] No wiki navigation or workflow content (Layer 1 handles that)
```

### API Contractor
```
[ ] Existing contract check as first step
[ ] Contract status guard (approved before implementation)
[ ] npm run types:generate instruction (script fully implemented via json-schema-to-typescript)
[ ] Contract validation after backend build
[ ] Contract validation after frontend build
[ ] Version bump protocol (minor vs major change)
[ ] HANDOFF BLOCK notifies PM to unblock both BE and FE
```

### QA
```
[ ] Two-pass test cases (PASS 1 from BA, PASS 2 from Designer)
[ ] Guard: don't write PASS 2 until design.json exists
[ ] Pre-dev DoD separated from post-dev DoD (cases written vs cases passing)
[ ] Reads impact map and entity registry before running tests
[ ] UX regression bug type defined (🔵 severity)
```

### Designer
```
[ ] Existing component discovery as first step
[ ] Design system initialization check (new vs existing project)
[ ] Component-first workflow (components before pages)
[ ] BA reconciliation step after wireframes written
[ ] review_history update after reviewing built features
[ ] All 5 states: default, loading, error, empty, success
[ ] variant_matrix field in component files
[ ] transitions field in component files
[ ] dark_mode field in component files
```

### DevOps
```
[ ] Environment promotion protocol (local → staging → production)
[ ] Backup and recovery reference
[ ] Dependency update reference
[ ] Vulnerability scanning reference
[ ] wiki-app service always in docker-compose
[ ] postgres-test service in docker-compose on port 5433 with separate volume
[ ] setup.sh + reset.sh + migrate.sh defined
[ ] Port table consistent with project root structure (6 services)
```

### Wiki App
```
[ ] quick_facts read optimization (server components read quick_facts for lists)
[ ] Approval write-back with version conflict check
[ ] wiki volume mounted WITHOUT :ro flag (approval flow requires write access)
[ ] Impact graph with entity-registry.json AND impact-map/{feature}-relations.json as data sources
[ ] Conflict queue for version mismatch display
[ ] Dark mode support (conditional on design-system.json dark_mode setting)
[ ] Tag-based changelog filtering
```

---

## 📊 Document Summary

```
Total skills          : 22 (1 Layer 0, 12 Layer 1, 9 Layer 2)
Self-contained L1     : 2 (vibe-code-review, vibe-documentation — no Layer 2)
Total reference files : 63
Wiki sections         : 16 top-level folders
Wiki files w/ schema  : 24 (all referenced files have defined schemas, incl. changelog + proposals)
Workflow steps        : 70 (authoritative universal workflow)
Port assignments      : 6 services, all defined in project root structure table
Docker services       : 6 (postgres, postgres-test, redis, backend, frontend, wiki-app)

Key design decisions:
  Project root structure defined — top-level folder layout explicit
  Port table — all 6 services with ports in one place
  Type generation — npm run types:generate using json-schema-to-typescript, fully implemented in project-setup.md
  Test database — dedicated postgres-test Docker service on port 5433, never shares primary dev DB
  All 24 wiki JSON files have schemas — no referenced file without a schema
  All 22 skills have frontmatter — no skill missing YAML triggers
  All skills have Definition of Done — consistent completion criteria
  Self-contained skills carved out — code-review and documentation don't trigger Layer 2
  Role name consistency — vibe-db-general = DB Migration Manager everywhere
  Skill count accurate — header, summary, and tree all say 22
  Impact map dual-file — feature-scoped in features/{name}/ AND global in impact-map/, BA keeps both in sync
  BA → Designer → API Contractor — handoff chain corrected, BA/Designer reconciliation owned by Designer
  QA split DoD — pre-dev (cases written) separated from post-dev (cases passing)
  Dark mode conditional — Tailwind darkMode config driven by design-system.json setting
  Wiki-app volume writable — no :ro flag, approval write-back requires filesystem writes
  Wiki templates — 5 template files explicitly generated during project initialization
```