import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOrderItemTable1713830440000 implements MigrationInterface {
  name = 'CreateOrderItemTable1713830440000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            // nullable: product may be soft-deleted but item snapshot is retained
            name: 'product_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            // BR-ORDER-01: snapshot at add time
            name: 'product_name',
            type: 'varchar',
            length: '255',
          },
          {
            // BR-ORDER-01: snapshot at add time
            name: 'sku',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            // BR-ORDER-01: snapshot at add time
            name: 'unit_price_vnd',
            type: 'integer',
          },
          {
            // BR-ORDER-01: snapshot at add time
            name: 'tax_rate_percent',
            type: 'smallint',
          },
          {
            // quantity × unit_price_vnd
            name: 'line_total_vnd',
            type: 'integer',
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
        ],
      }),
      true,
    );

    // One item per product per order (upsert key)
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_order_items_order_product',
        columnNames: ['order_id', 'product_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'FK_order_items_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'FK_order_items_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('order_items', 'FK_order_items_product');
    await queryRunner.dropForeignKey('order_items', 'FK_order_items_order');
    await queryRunner.dropIndex('order_items', 'IDX_order_items_order_product');
    await queryRunner.dropTable('order_items');
  }
}
