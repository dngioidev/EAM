---
name: vibe-db-postgresql
description: |
  Layer 2 PostgreSQL-specific patterns for EAM. Covers PostgreSQL 15.x + TypeORM 0.3.x: UUID extension, indexes, JSONB, full-text search, connection pooling, query analysis, and performance optimization. Activates alongside vibe-db-general.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-db-general) architecture approval.
  STACK VALIDATION GUARD: Verify wiki/techstack/backend.json → database = "PostgreSQL 15.x"
applyTo: "**"
---

# vibe-db-postgresql

## STACK GUARD

Verify `wiki/techstack/backend.json → database = "PostgreSQL 15.x"` before applying patterns.

## PostgreSQL Extensions (Required)

```sql
-- Always enable at DB init / first migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- Vietnamese text search without diacritics
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- Trigram fuzzy search
```

## Index Strategy

| Query Type | Index Type |
|---|---|
| Equality: `WHERE id = $1` | Default BTree (automatic on PK) |
| Equality: `WHERE status = $1` | Partial index (if low cardinality) |
| Range: `WHERE created_at BETWEEN` | BTree on timestamp column |
| Full-text search | GIN on tsvector |
| JSONB field query | GIN on jsonb column |
| Case-insensitive: `LIKE '%text%'` | GIN + pg_trgm |

## References

- [Connection Pool Config](references/connection-pool.md)
- [Index Patterns](references/index-patterns.md)
- [JSONB Usage](references/jsonb-patterns.md)
- [Full-Text Search (Vietnamese)](references/full-text-search.md)
- [Query Analysis](references/query-analysis.md)
- [Backup and Restore](references/pg-backup.md)
