# Project Init Reference [comprehensive]

## PROJECT INITIALIZATION PROCEDURE (new projects only)

Only runs when `wiki/dashboard.json → is_new_project: true AND project_initialized: null`.

---

## STEP 1: Scaffold Backend

```bash
npx @nestjs/cli new backend --package-manager npm
cd backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/cache-manager cache-manager cache-manager-ioredis ioredis
npm install @nestjs/throttler
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install bcrypt helmet
npm install joi
npm install --save-dev @types/bcrypt @types/passport-jwt json-schema-to-typescript
```

**Create folder structure:**
```
backend/src/
  config/           ← database.config.ts, redis.config.ts
  common/
    decorators/     ← get-user.decorator.ts
    filters/        ← http-exception.filter.ts
    interceptors/   ← transform.interceptor.ts
    guards/         ← jwt-auth.guard.ts, roles.guard.ts
    pipes/          ← validation.pipe.ts
  modules/
    auth/           ← auth.module.ts, auth.service.ts, auth.controller.ts, strategies/
    users/          ← users.module.ts, users.service.ts, users.controller.ts, entities/
  scripts/
    generate-types.ts
```

**main.ts pattern:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors({ origin: configService.get('CORS_ORIGINS', '').split(','), credentials: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('V-Smart Ledger API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

**package.json scripts (add to generated):**
```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/config/database.config.ts",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/config/database.config.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/config/database.config.ts",
  "types:generate": "ts-node src/scripts/generate-types.ts"
}
```

**scripts/generate-types.ts (full implementation):**
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { compile } from 'json-schema-to-typescript';

const CONTRACTS_DIR = path.join(__dirname, '../../wiki/api-contracts');
const TYPES_OUTPUT_DIR = path.join(__dirname, '../../frontend/src/types');

async function generateTypes() {
  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.log('No api-contracts directory found, skipping type generation.');
    return;
  }
  fs.mkdirSync(TYPES_OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(CONTRACTS_DIR).filter(f => f.endsWith('.json') && f !== '_index.json');
  for (const file of files) {
    const moduleName = path.basename(file, '.json');
    const contract = JSON.parse(fs.readFileSync(path.join(CONTRACTS_DIR, file), 'utf-8'));
    const schemas = contract.content?.schemas ?? contract.schemas ?? {};
    let output = `// AUTO-GENERATED from wiki/api-contracts/${file} — do not edit manually\n// Run: npm run types:generate to regenerate\n\n`;
    for (const [name, schema] of Object.entries(schemas)) {
      try {
        const ts = await compile(schema as any, name, { bannerComment: '' });
        output += ts + '\n';
      } catch (e) {
        console.error(`Failed to compile schema ${name}:`, e);
      }
    }
    const outFile = path.join(TYPES_OUTPUT_DIR, `${moduleName}.types.ts`);
    fs.writeFileSync(outFile, output, 'utf-8');
    console.log(`Generated: frontend/src/types/${moduleName}.types.ts`);
  }
}

generateTypes().catch(console.error);
```

Run: `npm run build` — must pass before continuing.

---

## STEP 2: Scaffold Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom @tanstack/react-query axios zustand
npm install react-hook-form zod @hookform/resolvers
npm install tailwindcss @tailwindcss/forms postcss autoprefixer
npm install clsx tailwind-merge lucide-react
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install --save-dev @playwright/test msw
npx tailwindcss init -p
```

**Create folder structure:**
```
frontend/src/
  api/        ← client.ts + {module}.api.ts files
  components/
    ui/       ← shadcn-style primitives
    features/ ← domain-specific components
  hooks/      ← useXxx.ts custom hooks
  pages/      ← route-level page components
  stores/     ← zustand stores
  types/      ← generated .types.ts files (from types:generate)
  utils/      ← cn.ts, formatters, etc.
```

Run: `npm run build` — must pass before continuing.

---

## STEP 3: Scaffold Wiki App

```bash
npx create-next-app@latest wiki-app --typescript --tailwind --app
cd wiki-app
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install reactflow
npx shadcn-ui@latest init
```

Create page routes matching wiki folder structure:
- `/` → dashboard
- `/features` → features list
- `/features/[id]` → feature detail
- `/bugs` → bugs list
- `/decisions` → decisions timeline
- `/design` → design system viewer
- `/impact-map` → impact graph
- `/api-contracts` → contracts browser
- `/approval-queue` → pending approvals

Run: `npm run build` — must pass before continuing.

---

## STEP 4: Initialize Wiki Folder Structure

Create all folders and `_index.json` files per wiki structure definition in the main prompt.

```bash
mkdir -p wiki/_schema wiki/rulebook wiki/plan/proposals wiki/plan/sprints
mkdir -p wiki/features wiki/bugs wiki/decisions wiki/techstack
mkdir -p wiki/business-workflow wiki/api-contracts wiki/design/components wiki/design/pages
mkdir -p wiki/impact-map wiki/test-cases wiki/history
```

Create `wiki/dashboard.json` with:
- `is_new_project: true`
- `project_initialized: "YYYY-MM-DD"` (today's date)
- All fields from dashboard schema

Create `wiki/rulebook/` files from schemas in the main prompt document.
Create `wiki/onboarding.json` with actual setup steps.

---

## STEP 4b: Populate Wiki Templates

Create these 5 template files in `skills/vibe-project-manager/references/wiki-templates/` using the exact JSON schemas defined in the main prompt:

- `feature.template.json` → from `wiki/features/{name}.json` schema
- `bug.template.json` → from `wiki/bugs/{date}-{slug}.json` schema
- `decision.template.json` → from `wiki/decisions/{date}-{slug}.json` schema
- `contract.template.json` → from `wiki/api-contracts/{module}.json` schema
- `progress.template.json` → from `wiki/features/{complex-feature}/progress.json` schema

These are used by all agents to create new wiki entries with correct structure.

---

## STEP 5: Create Project Root Files

```bash
# docker-compose.yml
# .env.example — from wiki/env-config.json variables
# scripts/setup.sh
# scripts/reset.sh
# scripts/migrate.sh
# README.md
```

**Required .env.example content:**
```
DATABASE_URL=postgresql://appuser:apppass@postgres:5432/appdb
REDIS_URL=redis://:password@redis:6379
JWT_SECRET=generate-with-openssl-rand-base64-64
JWT_REFRESH_SECRET=generate-with-openssl-rand-base64-64
TEST_DATABASE_URL=postgresql://testuser:testpass@localhost:5433/testdb
VITE_API_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
REDIS_PASSWORD=changeme
POSTGRES_PASSWORD=apppass
```

---

## STEP 6: First Build Verification

```bash
./scripts/setup.sh   # All 6 service health checks must pass
cd backend && npm run test    # Must pass
cd frontend && npm run test   # Must pass
```

On success:
- Set `wiki/dashboard.json → build_status` all to "passing"
- Set `wiki/dashboard.json → is_new_project: false`
- Set `wiki/dashboard.json → project_initialized: "YYYY-MM-DD"`

Initialization complete. Proceed to feature work via normal routing.
