import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrganizationEntity1751563400962
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "organization"
          ADD COLUMN IF NOT EXISTS "size" varchar,
          ADD COLUMN IF NOT EXISTS "industry" varchar,
          ADD COLUMN IF NOT EXISTS "description" varchar;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "organization"
          DROP COLUMN IF EXISTS "size",
          DROP COLUMN IF EXISTS "industry",
          DROP COLUMN IF EXISTS "description";
        `);
  }
}
