import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOrderTable1713830430000 implements MigrationInterface {
  name = 'CreateOrderTable1713830430000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '50',
          },
          {
            // pending | processing | completed | cancelled | refunded
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'total_vnd',
            type: 'integer',
            default: 0,
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'store_id',
            type: 'uuid',
          },
          {
            name: 'cashier_id',
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

    // Unique order_number per store
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_order_number_store',
        columnNames: ['order_number', 'store_id'],
        isUnique: true,
      }),
    );

    // Fast list queries by store + date
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_store_created',
        columnNames: ['store_id', 'created_at'],
      }),
    );

    // Filter by cashier
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_cashier',
        columnNames: ['cashier_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_orders_store',
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_orders_cashier',
        columnNames: ['cashier_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'FK_orders_cashier');
    await queryRunner.dropForeignKey('orders', 'FK_orders_store');
    await queryRunner.dropIndex('orders', 'IDX_orders_cashier');
    await queryRunner.dropIndex('orders', 'IDX_orders_store_created');
    await queryRunner.dropIndex('orders', 'IDX_orders_order_number_store');
    await queryRunner.dropTable('orders');
  }
}
