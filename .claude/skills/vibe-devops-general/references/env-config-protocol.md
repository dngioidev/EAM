# Env Config Protocol

## Environment Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | YES | Key names only, placeholder values |
| `.env` | NO | Local development real values |
| `.env.test` | NO | Test DB only (port 5433) |
| `.env.staging` | NO | Staging environment |
| `.env.production` | NEVER | Production (hosted in platform env vars only) |

---

## Required Variables

All environments must define these:

```dotenv
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=eam_db
DATABASE_USER=eam_user
DATABASE_PASSWORD=<secret>

# Test Database (only needed for .env.test)
DATABASE_TEST_PORT=5433
DATABASE_TEST_NAME=eam_test_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<secret>

# App
NODE_ENV=development|test|production
BACKEND_PORT=3000
FRONTEND_PORT=5173
WIKI_APP_PORT=3001

# Auth
JWT_SECRET=<secret>
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=<secret>
JWT_REFRESH_EXPIRES_IN=604800

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## `wiki/env-config.json` Update Protocol

When any environment variable is added, changed, or removed:

1. Update `.env.example` first
2. Update `wiki/env-config.json`:
   ```json
   {
     "VARIABLE_NAME": {
       "description": "What this variable controls",
       "required": true,
       "example": "placeholder-not-real-value",
       "changed_in_sprint": 3,
       "changed_reason": "Added Redis auth support"
     }
   }
   ```
3. Notify all developers to update their local `.env` files
4. Update staging env vars in hosting platform

---

## Config Validation at Startup

Backend must validate all required env vars at startup:

```typescript
// In main.ts or AppModule constructor
const requiredVars = [
  'DATABASE_HOST', 'DATABASE_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET',
  'REDIS_HOST', 'REDIS_PASSWORD', 'CORS_ORIGIN'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required env var: ${varName}`);
  }
}
```

This prevents silent failures from undefined secrets.
