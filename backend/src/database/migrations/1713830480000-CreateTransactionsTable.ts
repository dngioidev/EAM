import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1713830480000 implements MigrationInterface {
  name = 'CreateTransactionsTable1713830480000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE transaction_type AS ENUM ('IMPORT', 'EXPORT')
    `);

    await queryRunner.query(`
      CREATE TABLE transactions (
        id         UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id   UUID                     NOT NULL,
        product_id UUID                     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        type       transaction_type         NOT NULL,
        quantity   INTEGER                  NOT NULL CHECK (quantity > 0),
        note       TEXT,
        created_at TIMESTAMPTZ              NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_product_id ON transactions (product_id, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_store_id ON transactions (store_id, created_at DESC)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_store_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_product_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type`);
  }
}
