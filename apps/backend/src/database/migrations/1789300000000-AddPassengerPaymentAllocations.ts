import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPassengerPaymentAllocations1789300000000 implements MigrationInterface {
  name = 'AddPassengerPaymentAllocations1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "booking_payments"
      ADD COLUMN IF NOT EXISTS "is_passenger_split" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "payer_name" character varying,
      ADD COLUMN IF NOT EXISTS "payer_customer_id" uuid;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_booking_payments_payer_customer'
        ) THEN
          ALTER TABLE "booking_payments"
          ADD CONSTRAINT "FK_booking_payments_payer_customer"
          FOREIGN KEY ("payer_customer_id")
          REFERENCES "customer"("id")
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_payment_allocations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "payment_id" uuid NOT NULL,
        "booking_customer_id" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_payment_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_payment_allocations_payment" FOREIGN KEY ("payment_id") REFERENCES "booking_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_payment_allocations_booking_customer" FOREIGN KEY ("booking_customer_id") REFERENCES "booking_customers"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_booking_payment_allocations_payment_id" ON "booking_payment_allocations" ("payment_id");
      CREATE INDEX IF NOT EXISTS "IDX_booking_payment_allocations_booking_customer_id" ON "booking_payment_allocations" ("booking_customer_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_payment_allocations"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP CONSTRAINT IF EXISTS "FK_booking_payments_payer_customer"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP COLUMN IF EXISTS "payer_customer_id"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP COLUMN IF EXISTS "payer_name"`);
    await queryRunner.query(`ALTER TABLE "booking_payments" DROP COLUMN IF EXISTS "is_passenger_split"`);
  }
}
