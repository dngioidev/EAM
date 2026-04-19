import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migrates V-Smart Ledger user schema to EAM Lean Inventory MVP spec:
 * - Role enum: admin→ADMIN, all others→OWNER; removes old enum values
 * - name column: made nullable (OWNER self-registration sends email only)
 */
export class MigrateToEamSchema1745136000000 implements MigrationInterface {
  name = 'MigrateToEamSchema1745136000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop column default so we can alter the type
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role DROP DEFAULT`);

    // Step 2: Temporarily change role to varchar so we can update data and swap enum
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role TYPE varchar(50) USING role::varchar`);

    // Step 3: Migrate existing role data to EAM spec values
    await queryRunner.query(`UPDATE users SET role = 'ADMIN' WHERE role = 'admin'`);
    await queryRunner.query(`UPDATE users SET role = 'OWNER' WHERE role NOT IN ('ADMIN')`);

    // Step 4: Drop old enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);

    // Step 5: Create new EAM enum type
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('OWNER', 'ADMIN')`);

    // Step 6: Change column back to the new enum type
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN role TYPE "users_role_enum" USING role::"users_role_enum"`,
    );

    // Step 7: Restore default
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'OWNER'::"users_role_enum"`);

    // Step 8: Make name nullable (OWNER self-registration doesn't supply a name)
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN name DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN name SET DEFAULT ''`);

    // ── Products table: make price_vnd and tax_rate_percent optional ──────────
    // EAM spec tracks quantity/threshold/status only; no price or tax fields.
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN price_vnd SET DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN price_vnd DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN tax_rate_percent SET DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN tax_rate_percent DROP NOT NULL`);

    // Make sku nullable (EAM spec: sku is optional)
    // Drop the unique index first, then recreate as partial (only for non-null SKUs)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_products_sku_storeId"`,
    );
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN sku DROP NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_products_sku_storeId" ON products (sku, store_id) WHERE sku IS NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Restore name to required
    await queryRunner.query(`UPDATE users SET name = '' WHERE name IS NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN name SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN name DROP DEFAULT`);

    // Revert role enum
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role TYPE varchar(50) USING role::varchar`);
    await queryRunner.query(`UPDATE users SET role = 'admin' WHERE role = 'ADMIN'`);
    await queryRunner.query(`UPDATE users SET role = 'viewer' WHERE role = 'OWNER'`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('admin', 'store-manager', 'cashier', 'accountant', 'viewer')`,
    );
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN role TYPE "users_role_enum" USING role::"users_role_enum"`,
    );
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'viewer'::"users_role_enum"`);
  }
}
