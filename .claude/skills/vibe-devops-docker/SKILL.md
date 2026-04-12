---
name: vibe-devops-docker
description: |
  Layer 2 Docker/Docker Compose patterns for V-Smart Ledger / EAM-Tax. Full docker-compose.yml with 8 services, Dockerfiles for backend and wiki-app, nginx reverse proxy, pgAdmin DB UI, health checks, volume mounts, network config, and .dockerignore. Activates alongside vibe-devops-general.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-devops-general) environment approval.
  STACK GUARD: Verify docker-compose.yml exists and matches this blueprint before modifying.
applyTo: "**"
---

# vibe-devops-docker

## Eight-Service Compose Architecture (+ 2 lifecycle services)

```
HOST-EXPOSED ports                    INTERNAL ONLY (Docker network)
─────────────────────────────────────  ────────────────────────────────────
:80   nginx         API gateway        :3000  backend  NestJS (via nginx)
:3001 wiki          Documentation      :5432  postgres main DB (via pgAdmin)
:5050 pgadmin       DB admin UI        :6379  redis    cache (via backend)
:5433 postgres-test Test DB for CI
:5173 frontend      Vite HMR (profile)
```

**Services:**
- `postgres`      — PostgreSQL 15 (internal only — use pgAdmin at :5050 to inspect)
- `postgres-test` — PostgreSQL 15 test instance (port 5433, for host `npm test`)
- `redis`         — Redis 7 (internal only)
- `migrate`       — **one-shot**: runs `migration:run` on every `docker compose up`, exits when done
- `seed-admin`    — **one-shot, opt-in** (`profiles: ["seed"]`): seeds admin user via `./scripts/seed.ps1 admin`
- `backend`       — NestJS app (starts ONLY after `migrate` completes successfully)
- `nginx`         — Reverse proxy gateway (port 80 → backend:3000 for /api/)
- `wiki`          — Next.js wiki viewer (port 3001)
- `pgadmin`       — pgAdmin 4 DB management UI (port 5050)
- `frontend`      — Vite dev server (port 5173, profile=frontend only)

## Migration Service Blueprint

```yaml
migrate:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: development        # needs ts-node for typeorm-ts-node-commonjs
  container_name: eam_migrate
  env_file: ./backend/.env
  environment:
    DATABASE_HOST: postgres    # MUST override .env localhost
    REDIS_HOST: redis
  command: ["npm", "run", "migration:run"]
  volumes:
    - ./backend:/app           # bind-mount so latest migration files are used
    - /app/node_modules        # anonymous volume preserves container node_modules
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - eam_network
  restart: "no"                # one-shot: exits after migrations complete
```

**Backend dependency on migrate:**
```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
    migrate:
      condition: service_completed_successfully   # backend waits for migrate to exit 0
```

## Seed Service Blueprint (profile-gated)

```yaml
seed-admin:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: development
  container_name: eam_seed_admin
  profiles: ["seed"]           # NEVER starts on plain `docker compose up`
  env_file: ./backend/.env
  environment:
    DATABASE_HOST: postgres
    REDIS_HOST: redis
  command: ["npm", "run", "seed:admin"]
  volumes:
    - ./backend:/app
    - /app/node_modules
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - eam_network
  restart: "no"
```

Run seed via: `docker compose --profile seed run --rm seed-admin`
Or via script: `./scripts/seed.ps1 admin`

## Adding a New Seed

1. Create `backend/src/database/seeds/<name>.seed.ts`
2. Add npm script in `backend/package.json`: `"seed:<name>": "ts-node src/database/seeds/<name>.seed.ts"`
3. Add a new service in `docker-compose.yml` following the `seed-admin` blueprint above
4. Add to `scripts/seed.ps1` `ValidateSet` and `switch` block
5. Add to `scripts/seed.sh` `case` block
6. Document in `wiki/techstack/backend.json` under `seeds`

## MANDATORY Pre-Completion Checklist

**Every time docker-compose.yml or a Dockerfile is created or changed:**

- [ ] Every `build:` service has a matching Dockerfile at the referenced path
- [ ] Every Dockerfile has a matching `.dockerignore`
- [ ] All `target:` stage names exist as stages in the Dockerfile
- [ ] All `env_file:` paths exist on disk
- [ ] Every new service is classified as exposed or internal-only in devops-rules.json
- [ ] Services using localhost in `.env` have Docker hostname overrides in compose `environment:` block
- [ ] `migrate` service is present and `backend.depends_on` includes `migrate: service_completed_successfully`
- [ ] New seeds use `profiles: ["seed"]` and are NEVER in the default service set
- [ ] `docker compose config` runs without error
- [ ] `docker compose up -d` starts — all containers reach running/healthy
- [ ] `eam_migrate` container exits with code 0 (check: `docker inspect eam_migrate --format "{{.State.ExitCode}}"`)
- [ ] `docker compose logs migrate --tail 30` shows no fatal errors
- [ ] `docker compose logs <service> --tail 30` shows no fatal errors for other services
- [ ] nginx config tested: `docker exec eam_nginx nginx -t`

## Critical ENV Overrides for Docker (ENV-RULE-01)

Backend `.env` has `DATABASE_HOST=localhost` (for local host dev). **This MUST be overridden in docker-compose.yml:**

```yaml
backend:
  env_file: ./backend/.env
  environment:
    DATABASE_HOST: postgres   # override localhost → Docker service name
    REDIS_HOST: redis         # override localhost → Docker service name
```

Failure to do this causes `ECONNREFUSED` on startup inside the container.

## nginx Config Pattern

nginx is stock `nginx:1.27-alpine` with config bind-mounted read-only:

```yaml
nginx:
  image: nginx:1.27-alpine
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

After editing `nginx/nginx.conf`, reload without restart:
```
docker exec eam_nginx nginx -t        # test config
docker exec eam_nginx nginx -s reload # apply changes
```

## pgAdmin Connection Setup (first run only)

1. Open http://localhost:5050
2. Login: `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from `.env`
3. Add server: Host = `postgres`, Port = `5432`, DB = value of `DATABASE_NAME`

## References

- [docker-compose.yml Blueprint](references/docker-compose-blueprint.md)
- [nginx Config Patterns](references/nginx-config.md)
- [Backend Dockerfile](references/backend-dockerfile.md)
- [Wiki App Dockerfile](references/wiki-dockerfile.md)
- [Health Checks](references/health-checks.md)
- [Volume and Network Config](references/volumes-networks.md)
- [.dockerignore](references/dockerignore.md)
- [CI/CD Pipeline Notes](references/cicd-notes.md)
- [Migration & Seed Service Patterns](../vibe-devops-general/references/migration-seed.md)
