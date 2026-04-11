# Query Analysis

## EXPLAIN ANALYZE

Run on slow queries to diagnose:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.*, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC
LIMIT 20;
```

Look for:
- `Seq Scan` on large tables → missing index
- `Nested Loop` on large result sets → may need `Hash Join`
- High `Actual Rows` vs `Estimated Rows` → run `ANALYZE table`
- `cost=` very high → refactor query

## Slow Query Detection

```sql
-- Show queries taking > 1 second
SELECT pid, now() - query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start IS NOT NULL
  AND now() - query_start > interval '1 second'
ORDER BY duration DESC;
```

## Index Usage Check

```sql
-- Find unused indexes (waste write performance)
SELECT
  schemaname || '.' || tablename AS table,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Table Bloat Check

```sql
-- Check table size and dead tuples (needs VACUUM if high)
SELECT
  relname AS table_name,
  n_dead_tup AS dead_tuples,
  n_live_tup AS live_tuples,
  pg_size_pretty(pg_total_relation_size(oid)) AS total_size
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 10;
```

## Performance Rules

1. Never `SELECT *` in production — always specify columns
2. Paginate all list queries — never return unbounded result sets
3. After any schema change, run `ANALYZE {table}` to refresh statistics
4. Monitor query time in logs — alert on queries > 500ms
