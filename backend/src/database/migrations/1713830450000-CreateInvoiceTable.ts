import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInvoiceTable1713830450000 implements MigrationInterface {
  name = 'CreateInvoiceTable1713830450000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // invoice_sequences: per-store per-year counter (pessimistic lock for gap-free sequence)
    await queryRunner.createTable(
      new Table({
        name: 'invoice_sequences',
        columns: [
          {
            name: 'id',
            type: 'bigserial',
            isPrimary: true,
          },
          {
            name: 'store_id',
            type: 'uuid',
          },
          {
            name: 'year',
            type: 'smallint',
          },
          {
            name: 'last_sequence',
            type: 'integer',
            default: 0,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'invoice_sequences',
      new TableIndex({
        name: 'IDX_invoice_sequences_store_year',
        columnNames: ['store_id', 'year'],
        isUnique: true,
      }),
    );

    // invoices table
    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            // LEGAL-01: unique per store. Format: '{YYYY}/{seq:06d}'
            name: 'invoice_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            name: 'store_id',
            type: 'uuid',
          },
          {
            // draft | issued | cancelled
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'draft'",
          },
          {
            // JSONB snapshot of order items for the invoice lines (BR-INV-03)
            name: 'lines',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            // JSONB: [{ rate, taxableVnd, vatVnd }] (BR-INV-04)
            name: 'vat_subtotals',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'total_vnd',
            type: 'integer',
            default: 0,
          },
          {
            name: 'issued_at',
            type: 'timestamptz',
            isNullable: true,
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

    // LEGAL-01: invoice_number unique per store
    await queryRunner.createIndex(
      'invoices',
      new TableIndex({
        name: 'IDX_invoices_number_store',
        columnNames: ['invoice_number', 'store_id'],
        isUnique: true,
      }),
    );

    // One invoice per order
    await queryRunner.createIndex(
      'invoices',
      new TableIndex({
        name: 'IDX_invoices_order',
        columnNames: ['order_id'],
        isUnique: true,
      }),
    );

    // Date-range queries for accountant
    await queryRunner.createIndex(
      'invoices',
      new TableIndex({
        name: 'IDX_invoices_store_issued',
        columnNames: ['store_id', 'issued_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        name: 'FK_invoices_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        name: 'FK_invoices_store',
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('invoices', 'FK_invoices_store');
    await queryRunner.dropForeignKey('invoices', 'FK_invoices_order');
    await queryRunner.dropIndex('invoices', 'IDX_invoices_store_issued');
    await queryRunner.dropIndex('invoices', 'IDX_invoices_order');
    await queryRunner.dropIndex('invoices', 'IDX_invoices_number_store');
    await queryRunner.dropTable('invoices');
    await queryRunner.dropIndex('invoice_sequences', 'IDX_invoice_sequences_store_year');
    await queryRunner.dropTable('invoice_sequences');
  }
}
