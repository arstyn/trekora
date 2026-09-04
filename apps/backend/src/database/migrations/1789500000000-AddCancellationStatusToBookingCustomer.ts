import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCancellationStatusToBookingCustomer1789500000000
  implements MigrationInterface
{
  name = 'AddCancellationStatusToBookingCustomer1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'booking_customers_status_enum'
        ) THEN
          CREATE TYPE "public"."booking_customers_status_enum" AS ENUM('active', 'cancelled');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "booking_customers"
      ADD COLUMN IF NOT EXISTS "status" "public"."booking_customers_status_enum" NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "booking_customers"
      DROP COLUMN IF EXISTS "cancellation_reason",
      DROP COLUMN IF EXISTS "cancelled_at",
      DROP COLUMN IF EXISTS "status";
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."booking_customers_status_enum";
    `);
  }
}
