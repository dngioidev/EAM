# docker-compose.yml Blueprint

The canonical 8-service compose definition for EAM.

**Port summary:**
| Port | Service | Reason exposed |
|------|---------|----------------|
| 80   | nginx   | Main API gateway — single public entry point |
| 3001 | wiki    | Documentation viewer |
| 5050 | pgadmin | DB admin UI (dev only) |
| 5433 | postgres-test | Host test runner needs direct DB access |
| 5173 | frontend | Vite HMR WebSocket (profile=frontend only) |

**Internal only (no host port):** postgres:5432, redis:6379, backend:3000

```yaml
# -----------------------------------------------------------------------------
# Host-exposed ports:
#   :80   ? nginx         API gateway + Swagger
#   :3001 ? wiki-app      Documentation viewer
#   :5050 ? pgAdmin       Database admin UI
#   :5433 ? postgres-test Test DB for host-side test runner (npm test)
# -----------------------------------------------------------------------------

services:

  postgres:
    image: postgres:15-alpine
    container_name: eam_postgres
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    # No host port — access via pgAdmin (:5050) or internal services
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - eam_network

  postgres-test:
    image: postgres:15-alpine
    container_name: eam_postgres_test
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_TEST_PASSWORD}
      POSTGRES_DB: ${DATABASE_TEST_NAME}
    ports:
      - "5433:5432"             # Exposed: host test runner needs this
    tmpfs:
      - /var/lib/postgresql/data
    networks:
      - eam_network

  redis:
    image: redis:7-alpine
    container_name: eam_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    # No host port — internal only
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - eam_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: eam_backend
    env_file: ./backend/.env
    environment:
      # Override localhost values from .env with Docker service hostnames
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    # No host port — nginx routes /api/* to backend:3000 internally
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - eam_network
    restart: unless-stopped

  nginx:
    image: nginx:1.27-alpine
    container_name: eam_nginx
    ports:
      - "80:80"                 # Single public entry point for API
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      backend:
        condition: service_started
    networks:
      - eam_network
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: eam_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
      PGADMIN_CONFIG_SERVER_MODE: "False"
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: "False"
    ports:
      - "5050:80"               # Exposed: DB admin UI
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - eam_network

  wiki:
    build:
      context: ./wiki-app
      dockerfile: Dockerfile
    container_name: eam_wiki
    ports:
      - "3001:3001"             # Exposed: documentation browser
    volumes:
      - ./wiki:/wiki:ro
    networks:
      - eam_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: eam_frontend
    env_file: ./frontend/.env.local
    ports:
      - "5173:5173"             # Exposed directly for Vite HMR WebSocket
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - eam_network
    profiles:
      - frontend

volumes:
  postgres_data:
  redis_data:
  pgadmin_data:

networks:
  eam_network:
    driver: bridge
```

## Required .env variables

Root `.env` must include:
```
# --- pgAdmin ---
PGADMIN_EMAIL=admin@eam.local
PGADMIN_PASSWORD=your-secure-password
```

## First-time pgAdmin setup

1. Open http://localhost:5050
2. Login with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD`
3. Right-click Servers ? Register ? Server
   - Name: EAM Local
   - Host: `postgres`
   - Port: `5432`
   - Username: `DATABASE_USER` value
   - Password: `DATABASE_PASSWORD` value
