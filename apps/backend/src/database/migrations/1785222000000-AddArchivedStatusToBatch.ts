import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArchivedStatusToBatch1785222000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "batch_status_enum" ADD VALUE IF NOT EXISTS 'archived'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot easily remove enum values in postgres without recreating the enum
  }
}
