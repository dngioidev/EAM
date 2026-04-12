# ─────────────────────────────────────────────────────────────────────────────
# EAM Project Scripts
#
# Run all scripts from the project root or the scripts/ folder.
# All scripts require Docker + Docker Compose to be running.
# ─────────────────────────────────────────────────────────────────────────────

## Quick Reference

| Script                   | Purpose                                    | Platform  |
|:------------------------ |:------------------------------------------ |:--------- |
| `setup-dev.ps1`          | First-time dev setup (build + migrate + seed) | Windows |
| `migrate.ps1 run`        | Apply all pending TypeORM migrations       | Windows   |
| `migrate.ps1 revert`     | Revert last migration                      | Windows   |
| `migrate.ps1 show`       | Show migration status                      | Windows   |
| `migrate.ps1 generate X` | Generate new migration named X             | Windows   |
| `seed.ps1 admin`         | Seed default admin user (idempotent)       | Windows   |
| `reset-db.ps1`           | DEV ONLY: wipe + remigrate DB              | Windows   |
| `backup-db.ps1`          | pg_dump to backups/ folder                 | Windows   |
| `health-check.ps1`       | Verify all services are healthy            | Windows   |
| `logs.ps1 [service]`     | Tail Docker logs for a service             | Windows   |
| `migrate.sh run`         | Apply migrations (CI/CD / Linux)           | Linux/CI  |
| `seed.sh admin`          | Seed admin user (CI/CD / Linux)            | Linux/CI  |
| `backup-db.sh`           | pg_dump backup (CI/CD / Linux)             | Linux/CI  |

## Prerequisites

- Docker Desktop running
- `backend/.env` file populated (copy from `backend/.env.example`)
- Stack up: `docker compose up -d`

## Common Workflows

### First-time setup
```powershell
./scripts/setup-dev.ps1
```

### After pulling new migrations
```powershell
./scripts/migrate.ps1 run
```

### Adding a new DB migration
```powershell
# 1. Make entity changes in backend/src/
# 2. Generate the migration:
./scripts/migrate.ps1 generate CreateInvoiceTable
# 3. Review the generated file in backend/src/database/migrations/
# 4. Apply it:
./scripts/migrate.ps1 run
```

### Daily dev start
```powershell
docker compose up -d
./scripts/health-check.ps1
```

### Backup before risky change
```powershell
./scripts/backup-db.ps1
```

### Reset dev database
```powershell
./scripts/reset-db.ps1 -SeedAdmin
```
