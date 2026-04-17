import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductQuantityThreshold1713830470000 implements MigrationInterface {
  name = 'AddProductQuantityThreshold1713830470000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE products ADD CONSTRAINT CHK_products_quantity CHECK (quantity >= 0)`,
    );

    await queryRunner.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS threshold INTEGER NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE products ADD CONSTRAINT CHK_products_threshold CHECK (threshold >= 0)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products DROP CONSTRAINT IF EXISTS CHK_products_threshold`,
    );
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS threshold`);

    await queryRunner.query(
      `ALTER TABLE products DROP CONSTRAINT IF EXISTS CHK_products_quantity`,
    );
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS quantity`);
  }
}
