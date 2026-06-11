import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePasswordFromUser1780993414200 implements MigrationInterface {
  name = 'RemovePasswordFromUser1780993414200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "password"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "password" character varying`);
  }
}
