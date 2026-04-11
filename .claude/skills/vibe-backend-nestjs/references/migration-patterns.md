# Migration Patterns

## Generate Migration

After changing a TypeORM entity:

```bash
cd backend
npm run migration:generate -- -n CreateOrdersTable
```

This creates: `src/database/migrations/{timestamp}-CreateOrdersTable.ts`

---

## Migration File Structure

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOrdersTable{timestamp} implements MigrationInterface {
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid extension (idempotent)
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'order_number', type: 'varchar', isUnique: true },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'total_amount', type: 'decimal', precision: 15, scale: 0 },
          { name: 'customer_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true, // ifNotExists
    );

    await queryRunner.createIndex('orders', new TableIndex({
      name: 'idx_order_customer_id',
      columnNames: ['customer_id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders', true);
  }
}
```

---

## Run / Revert

```bash
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status
```

---

## Migration Rules

1. Never modify a committed migration file — create a new one
2. Never use `synchronize: true` in non-test env (production schema drift risk)
3. Test both `up()` and `down()` before committing
4. `down()` must restore the exact state before `up()`
5. Migrations are ordered by timestamp — name them clearly
