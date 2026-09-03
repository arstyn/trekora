import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentVerificationAndLogs1789400000000 implements MigrationInterface {
  name = 'AddPaymentVerificationAndLogs1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add verification columns to booking_payments
    await queryRunner.query(`
      ALTER TABLE "booking_payments"
      ADD COLUMN IF NOT EXISTS "verified_by_id" uuid,
      ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_booking_payments_verified_by'
        ) THEN
          ALTER TABLE "booking_payments"
          ADD CONSTRAINT "FK_booking_payments_verified_by"
          FOREIGN KEY ("verified_by_id")
          REFERENCES "user"("id")
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Create booking_payment_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_payment_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "payment_id" uuid NOT NULL,
        "changed_by_id" uuid NOT NULL,
        "action" character varying NOT NULL,
        "previous_data" jsonb,
        "new_data" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_payment_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_payment_logs_payment" FOREIGN KEY ("payment_id") REFERENCES "booking_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_payment_logs_changed_by" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_booking_payment_logs_payment_id" ON "booking_payment_logs" ("payment_id");
      CREATE INDEX IF NOT EXISTS "IDX_booking_payment_logs_changed_by_id" ON "booking_payment_logs" ("changed_by_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_payment_logs"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP CONSTRAINT IF EXISTS "FK_booking_payments_verified_by"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP COLUMN IF EXISTS "verified_at"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP COLUMN IF EXISTS "verified_by_id"`);
  }
}
