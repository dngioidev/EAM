# Schema Change Protocol

## Change Types & Required Approvals

| Change Type | Approval Required | Risk |
|-------------|------------------|------|
| New table | PO (business) + vibe-backend-general | Low |
| New nullable column | vibe-backend-general review | Low |
| New non-nullable column (existing table) | PM + DBA review | Medium |
| Rename column | PM + all modules using it | High |
| Drop column | PM + sprint planning review | Critical |
| Change column type | PM + full test suite | Critical |
| Add index | No approval needed | Low |
| Add foreign key | vibe-backend-general review | Medium |
| Drop foreign key | PO + PM review | High |

---

## Standard Entity Template

Every TypeORM entity must extend `BaseEntity` with audit columns:

```typescript
import {
  PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
```

---

## Column Naming Conventions

| Case | Use |
|------|-----|
| camelCase (entity) | TypeScript property name |
| snake_case (DB) | PostgreSQL column name (use `name:` option) |

```typescript
@Column({ name: 'customer_id', type: 'uuid' })
customerId: string;
```

---

## Foreign Key Patterns

```typescript
// ManyToOne: always index the FK column
@ManyToOne(() => Customer, { nullable: false })
@JoinColumn({ name: 'customer_id' })
@Index('idx_order_customer_id')
customer: Customer;

@Column({ name: 'customer_id' })
customerId: string;
```

---

## Migration Checklist

Before committing a migration:
- [ ] Migration runs on clean DB: `npm run migration:run`
- [ ] Migration rolls back: `npm run migration:revert`
- [ ] Migration re-runs after rollback: `npm run migration:run`
- [ ] Tests pass against migrated DB: `npm run test:e2e`
- [ ] No data loss with existing seed data
- [ ] `wiki/impact-map/entity-registry.json` updated
- [ ] `wiki/history/{date}.json` entry written

---

## Breaking Schema Changes

A breaking change requires:
1. PM approval before writing the migration
2. Communication to ALL roles touching the entity
3. `wiki/decisions/{date}-schema-change.json` entry
4. Coordinated deployment: backend → migration → verify → frontend

Never deploy a breaking schema change mid-sprint without coordinated timing.

---

## Seed Data Rules

Test fixtures in `src/database/seeds/` must:
- Use UUIDs from a fixed seed list (not random)
- Not conflict across seed files
- Be designed to make tests deterministic
- Be re-runnable (idempotent — `INSERT ... ON CONFLICT DO NOTHING`)
