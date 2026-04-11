# Index Patterns

## Partial Indexes (Low-Cardinality Columns)

```typescript
// In TypeORM entity via migration (NOT @Index decorator for partial)
// Migration:
await queryRunner.query(`
  CREATE INDEX CONCURRENTLY idx_orders_pending
  ON orders (created_at)
  WHERE status = 'pending'
`);

// This index is used by:
// SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at
```

## Composite Index

```typescript
// Use when queries filter on multiple columns together
await queryRunner.query(`
  CREATE INDEX CONCURRENTLY idx_order_items_order_product
  ON order_items (order_id, product_id)
`);
```

## Full-Text Search Index (Vietnamese)

```typescript
// Add tsvector computed column + GIN index for Vietnamese search
await queryRunner.query(`
  ALTER TABLE products
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', unaccent(coalesce(name, '')))
  ) STORED;

  CREATE INDEX CONCURRENTLY idx_products_search
  ON products USING GIN (search_vector);
`);
```

## JSONB Index

```typescript
await queryRunner.query(`
  CREATE INDEX CONCURRENTLY idx_config_data
  ON store_configs USING GIN (config_data jsonb_path_ops)
`);
```

## Index Creation Rules

1. Always use `CONCURRENTLY` in production to avoid table lock
2. Check `pg_stat_user_indexes` for unused indexes before adding new ones
3. Every FK column should have an index
4. Indexes slow down writes — only add what queries actually need
5. After adding: run `ANALYZE table_name` to update statistics
