# docker-compose.yml Blueprint

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: eam_postgres
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
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
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # In-memory for speed
    networks:
      - eam_network

  redis:
    image: redis:7-alpine
    container_name: eam_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
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
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules  # Anonymous volume to preserve node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - eam_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: eam_frontend
    env_file: ./frontend/.env.local
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - eam_network

  wiki:
    build:
      context: ./wiki-app
      dockerfile: Dockerfile
    container_name: eam_wiki
    ports:
      - "3001:3001"
    volumes:
      - ./wiki:/wiki:ro  # Read-only mount of wiki JSON files
    networks:
      - eam_network

volumes:
  postgres_data:
  redis_data:

networks:
  eam_network:
    driver: bridge
```
