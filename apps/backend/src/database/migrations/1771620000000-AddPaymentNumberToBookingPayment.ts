import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentNumberToBookingPayment1771620000000
  implements MigrationInterface
{
  name = 'AddPaymentNumberToBookingPayment1771620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add column as nullable first to allow existing data
    await queryRunner.query(
      `ALTER TABLE "booking_payments" ADD "payment_number" character varying`,
    );

    // 2. Backfill existing rows with a unique value based on the application's format (PAYYYMMXXXX)
    // We use a window function to get the sequence number per organization, ordered by creation date
    await queryRunner.query(`
            WITH numbered_payments AS (
                SELECT 
                    p.id,
                    TO_CHAR(p.created_at, 'YYMM') as date_part,
                    ROW_NUMBER() OVER (PARTITION BY b.organization_id ORDER BY p.created_at ASC) as seq
                FROM booking_payments p
                JOIN bookings b ON p.booking_id = b.id
            )
            UPDATE booking_payments
            SET payment_number = 'PAY' || np.date_part || LPAD(np.seq::text, 4, '0')
            FROM numbered_payments np
            WHERE booking_payments.id = np.id
        `);

    // 3. Make it non-nullable
    await queryRunner.query(
      `ALTER TABLE "booking_payments" ALTER COLUMN "payment_number" SET NOT NULL`,
    );

    // 4. Add unique constraint
    await queryRunner.query(
      `ALTER TABLE "booking_payments" ADD CONSTRAINT "UQ_payment_number" UNIQUE ("payment_number")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking_payments" DROP CONSTRAINT "UQ_payment_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_payments" DROP COLUMN "payment_number"`,
    );
  }
}
