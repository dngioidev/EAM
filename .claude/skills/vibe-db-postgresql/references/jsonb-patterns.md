# JSONB Usage Patterns

## When to Use JSONB

Use JSONB for:
- Configuration/settings that vary per entity
- Flexible audit metadata
- Third-party API response caching

Do NOT use JSONB for:
- Core business fields that you'll query/filter on (use proper columns)
- Data that needs FK constraints or joins

## Entity Column Definition

```typescript
@Column({ name: 'metadata', type: 'jsonb', nullable: true })
metadata: Record<string, unknown> | null;

@Column({ name: 'config', type: 'jsonb', default: '{}' })
config: Record<string, unknown>;
```

## Querying JSONB in TypeORM

```typescript
// Exact match on JSONB field
const result = await this.repo
  .createQueryBuilder('store')
  .where("store.config ->> 'theme' = :theme", { theme: 'dark' })
  .getMany();

// Check if JSONB key exists
.where("store.config ? 'customLogo'")

// Nested JSONB path
.where("store.config #>> '{notification, email}' = :val", { val: 'true' })

// JSONB contains
.where("store.config @> :config", { config: JSON.stringify({ active: true }) })
```

## Type Safety with Interfaces

```typescript
interface StoreConfig {
  theme: 'light' | 'dark';
  taxRate: number;
  notification: {
    email: boolean;
    sms: boolean;
  };
}

// Cast when reading:
const config = store.config as StoreConfig;
```
