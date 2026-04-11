---
name: vibe-devops-docker
description: |
  Layer 2 Docker/Docker Compose patterns for V-Smart Ledger / EAM-Tax. Full docker-compose.yml with 6 services, Dockerfiles for backend and wiki-app, health checks, volume mounts, network config, and .dockerignore. Activates alongside vibe-devops-general.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-devops-general) environment approval.
  STACK GUARD: Verify docker-compose.yml exists and matches this blueprint before modifying.
applyTo: "**"
---

# vibe-devops-docker

## Six-Service Compose Architecture

```
services:
  postgres      — PostgreSQL 15 (port 5432)
  postgres-test — PostgreSQL 15 test instance (port 5433)
  redis         — Redis 7 (port 6379)
  backend       — NestJS (port 3000)
  frontend      — Vite dev server (port 5173)
  wiki          — Next.js wiki app (port 3001)
```

## References

- [docker-compose.yml Blueprint](references/docker-compose-blueprint.md)
- [Backend Dockerfile](references/backend-dockerfile.md)
- [Wiki App Dockerfile](references/wiki-dockerfile.md)
- [Health Checks](references/health-checks.md)
- [Volume and Network Config](references/volumes-networks.md)
- [.dockerignore](references/dockerignore.md)
- [CI/CD Pipeline Notes](references/cicd-notes.md)
