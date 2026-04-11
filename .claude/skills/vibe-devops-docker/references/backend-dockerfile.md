# Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /tmp/prod_node_modules
RUN npm ci  # Install dev deps for build

# ---- Build ----
FROM deps AS builder
COPY . .
RUN npm run build

# ---- Development ----
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["dumb-init", "node", "--watch", "dist/main.js"]
# In dev, use ts-node-dev or nodemon with volume mount instead:
# CMD ["dumb-init", "npm", "run", "start:dev"]

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /tmp/prod_node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
USER node  # Non-root for security
CMD ["dumb-init", "node", "dist/main.js"]
```

## Build Commands

```bash
# Development (with volume mount for hot reload)
docker compose up backend

# Production build (multi-stage, no dev deps)
docker build --target production -t eam-backend:latest ./backend

# Check image size
docker images eam-backend
```

## Security Notes

1. Use `USER node` in production — never run as root
2. `dumb-init` handles signal forwarding correctly (PID 1 problem)
3. Use `--only=production` for prod node_modules
4. Never COPY `.env` files into Docker image — use env_file in compose
