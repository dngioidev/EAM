import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTokenVersionColumn1713830460000 implements MigrationInterface {
  name = 'AddUserTokenVersionColumn1713830460000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`UPDATE "users" SET "token_version" = 0 WHERE "token_version" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "token_version"`);
  }
}
