# Full-Text Search (Vietnamese)

## Setup

Vietnamese language has diacritics (ắ, ộ, ể…) that must be stripped for flexible search. Use `unaccent` extension.

```sql
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## Generated tsvector Column

```typescript
// In migration:
await queryRunner.query(`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      unaccent(coalesce(name_vi, '')) || ' ' ||
      unaccent(coalesce(name_en, '')) || ' ' ||
      coalesce(sku, '')
    )
  ) STORED;

  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_fts
  ON products USING GIN (search_vector);
`);
```

## TypeORM Query

```typescript
async search(query: string): Promise<Product[]> {
  // Normalize input: strip diacritics, split words
  return this.productsRepository
    .createQueryBuilder('product')
    .where(
      "product.search_vector @@ to_tsquery('simple', unaccent(:query) || ':*')",
      { query: query.trim().split(' ').filter(Boolean).join(' | ') }
    )
    .addOrderBy(
      "ts_rank(product.search_vector, to_tsquery('simple', unaccent(:queryRank) || ':*'))",
      'DESC'
    )
    .setParameter('queryRank', query)
    .limit(20)
    .getMany();
}
```

## Trigram Fallback (Fuzzy)

For autocomplete or very short queries:

```typescript
async fuzzySearch(query: string): Promise<Product[]> {
  return this.productsRepository
    .createQueryBuilder('product')
    .where('unaccent(product.name_vi) % unaccent(:query)', { query })
    .orderBy("similarity(unaccent(product.name_vi), unaccent(:query))", 'DESC')
    .setParameter('query', query)
    .limit(10)
    .getMany();
}
```
