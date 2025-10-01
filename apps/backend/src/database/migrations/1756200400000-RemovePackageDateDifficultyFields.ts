import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePackageDateDifficultyFields1756200400000
  implements MigrationInterface
{
  name = 'RemovePackageDateDifficultyFields1756200400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove startDate column
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "startDate"`);

    // Remove endDate column
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "endDate"`);

    // Remove difficulty column
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "difficulty"`);

    // Update payment milestones to use amount instead of percentage
    await queryRunner.query(
      `ALTER TABLE "payment_milestones" DROP COLUMN "percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_milestones" ADD "amount" decimal(10,2)`,
    );

    // Update cancellation tiers to use amount instead of percentage
    await queryRunner.query(
      `ALTER TABLE "cancellation_tiers" DROP COLUMN "percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cancellation_tiers" ADD "amount" decimal(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore payment milestones percentage column
    await queryRunner.query(
      `ALTER TABLE "payment_milestones" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_milestones" ADD "percentage" decimal(5,2)`,
    );

    // Restore cancellation tiers percentage column
    await queryRunner.query(
      `ALTER TABLE "cancellation_tiers" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cancellation_tiers" ADD "percentage" decimal(5,2)`,
    );

    // Restore difficulty column
    await queryRunner.query(
      `ALTER TABLE "packages" ADD "difficulty" character varying`,
    );

    // Restore endDate column
    await queryRunner.query(`ALTER TABLE "packages" ADD "endDate" date`);

    // Restore startDate column
    await queryRunner.query(`ALTER TABLE "packages" ADD "startDate" date`);
  }
}
