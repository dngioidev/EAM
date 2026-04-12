# Migration & Seed Management

## Overview

All database schema changes and initial data are managed via TypeORM migrations and idempotent seed scripts. Everything runs inside Docker — no direct `npm run` against `localhost` DNS.

---

## Architecture

```
docker compose up -d
│
├── postgres (healthy)
│     ↓
├── migrate  ←── runs migration:run, then exits 0
│     ↓ (service_completed_successfully)
└── backend  ←── starts only after migrate exits cleanly
```

Seeds are **not** in the default stack. They run on-demand via profile:

```
docker compose --profile seed run --rm seed-admin
# or:
./scripts/seed.ps1 admin
```

---

## Migration Lifecycle

### 1. Adding a new entity field or table

```powershell
# After editing the TypeORM entity file:
./scripts/migrate.ps1 generate CreateInvoiceTable

# Review the generated SQL in:
# backend/src/database/migrations/<timestamp>-CreateInvoiceTable.ts

# Apply it:
./scripts/migrate.ps1 run
```

### 2. Checking what's been applied

```powershell
./scripts/migrate.ps1 show
```

### 3. Reverting the last migration (dev only)

```powershell
./scripts/migrate.ps1 revert
# Then fix the migration file and re-run
./scripts/migrate.ps1 run
```

### 4. Migration on docker compose up

The `migrate` service runs automatically. On every `docker compose up -d`:
- If no pending migrations → exits 0 immediately (no-op, fast)
- If pending migrations → applies them → exits 0
- If migration fails → exits non-zero → `backend` does NOT start (intentional)

Check migrate logs if backend fails to start:
```powershell
./scripts/logs.ps1 migrate
```

---

## Seed Lifecycle

### When to seed

- First-time environment setup (creates admin user)
- Staging environment reset
- CI/CD pipeline that needs base data

### Running seeds

```powershell
./scripts/seed.ps1 admin
```

All seeds are **idempotent** — running them twice is safe (they check for existence before inserting).

### Adding a new seed

1. Create `backend/src/database/seeds/<name>.seed.ts`
2. Implement idempotency check (query before insert)
3. Add npm script in `backend/package.json`:
   ```json
   "seed:<name>": "ts-node src/database/seeds/<name>.seed.ts"
   ```
4. Add service in `docker-compose.yml` (copy `seed-admin` blueprint, set `profiles: ["seed"]`)
5. Add to `scripts/seed.ps1` `ValidateSet` + `switch`
6. Add to `scripts/seed.sh` `case` block
7. Document in `wiki/techstack/backend.json` under `seeds`

---

## Rules

| Rule | Detail |
|:---- |:------- |
| `synchronize: false` always | Never use `synchronize: true` — schema drift is untrackable |
| Migrations committed with entities | Entity file change + migration file = 1 commit, never separate |
| No raw DDL outside migrations | ALTER TABLE / CREATE TABLE only inside migration files |
| Seeds never in default compose | Always use `profiles: ["seed"]` — seeds are destructive/additive |
| Seeds idempotent | Always check existence before inserting |
| DATABASE_HOST override mandatory | All DB services set `DATABASE_HOST: postgres` in compose `environment:` |

---

## Naming Conventions

| Type | Pattern | Example |
|:---- |:------- |:------- |
| Migration | `<timestamp>-<PascalCaseName>.ts` | `1713830400000-CreateStoreTable.ts` |
| Seed | `<kebab-name>.seed.ts` | `admin.seed.ts` |
| Seed npm script | `seed:<name>` | `seed:admin` |
| Compose service | `seed-<name>` | `seed-admin` |

---

## Troubleshooting

| Problem | Diagnosis | Fix |
|:------- |:--------- |:--- |
| backend never starts | `docker inspect eam_migrate --format "{{.State.ExitCode}}"` shows non-0 | Fix migration error, run `./scripts/migrate.ps1 show`, re-up |
| ECONNREFUSED in migrate logs | Missing `DATABASE_HOST: postgres` in compose | Add environment override to migrate service |
| Migration already applied error | Migration name collision | Check `./scripts/migrate.ps1 show`, revert if needed |
| seed:admin fails | postgres not healthy or migrations not applied | Run `./scripts/migrate.ps1 run` first, then seed |
| Duplicate migration timestamp | Two developers generated migrations at same second | Manually rename one file with incremented timestamp |
