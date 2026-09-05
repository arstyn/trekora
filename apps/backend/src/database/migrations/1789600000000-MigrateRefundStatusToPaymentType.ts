import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateRefundStatusToPaymentType1789600000000
  implements MigrationInterface
{
  name = 'MigrateRefundStatusToPaymentType1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrate any legacy payments with status 'refunded' to have payment_type 'refund' and status 'completed'
    await queryRunner.query(`
      UPDATE "booking_payments"
      SET "payment_type" = 'refund', "status" = 'completed'
      WHERE "status" = 'refunded';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "booking_payments"
      SET "status" = 'refunded'
      WHERE "payment_type" = 'refund' AND "status" = 'completed';
    `);
  }
}
