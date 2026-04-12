import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateProductTable1713830420000 implements MigrationInterface {
  name = 'CreateProductTable1713830420000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Enable unaccent + pg_trgm for diacritic-insensitive search (BR-PROD-11)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'price_vnd',
            type: 'integer',
          },
          {
            name: 'tax_rate_percent',
            type: 'smallint',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'store_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Composite unique: SKU per store (BR-PROD-03)
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_sku_store',
        columnNames: ['sku', 'store_id'],
        isUnique: true,
      }),
    );

    // GIN index on unaccent(name) for fast diacritic-insensitive search (BR-PROD-11)
    await queryRunner.query(
      `CREATE INDEX IDX_products_name_unaccent ON products USING gin (unaccent(name) gin_trgm_ops)`,
    );

    // taxRatePercent check constraint (BR-PROD-02)
    await queryRunner.query(
      `ALTER TABLE products ADD CONSTRAINT CHK_products_tax_rate CHECK (tax_rate_percent IN (0, 5, 8, 10))`,
    );

    // priceVnd >= 0 (BR-PROD-01)
    await queryRunner.query(
      `ALTER TABLE products ADD CONSTRAINT CHK_products_price_vnd CHECK (price_vnd >= 0)`,
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        name: 'FK_products_store',
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('products', 'FK_products_store');
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_products_name_unaccent`);
    await queryRunner.dropIndex('products', 'IDX_products_sku_store');
    await queryRunner.dropTable('products');
  }
}
