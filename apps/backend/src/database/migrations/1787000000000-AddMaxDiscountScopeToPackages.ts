import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxDiscountScopeToPackages1787000000000 implements MigrationInterface {
  name = 'AddMaxDiscountScopeToPackages1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_scope" varchar DEFAULT 'group'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_scope"`
    );
  }
}
