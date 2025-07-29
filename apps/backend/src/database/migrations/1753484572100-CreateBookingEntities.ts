import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingEntities1753484572100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create booking status enum
    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed')
    `);

    // Create payment method enum
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM ('bank_transfer', 'credit_card', 'debit_card', 'cash', 'upi', 'other')
    `);

    // Create payment status enum
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'completed', 'failed', 'refunded')
    `);

    // Create document type enum
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM ('booking_confirmation', 'payment_receipt', 'travel_itinerary', 'passport_copy', 'visa_copy', 'insurance_document', 'other')
    `);

    // Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "booking_number" varchar UNIQUE NOT NULL,
        "customer_id" uuid NOT NULL,
        "package_id" uuid NOT NULL,
        "batch_id" uuid NOT NULL,
        "number_of_passengers" int NOT NULL,
        "total_amount" decimal(10,2) NOT NULL,
        "advance_paid" decimal(10,2) DEFAULT 0,
        "balance_amount" decimal(10,2) NOT NULL,
        "status" "booking_status_enum" DEFAULT 'pending',
        "special_requests" text,
        "additional_details" jsonb,
        "created_by_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "FK_bookings_customer" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_package" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_batch" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_bookings_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE
      )
    `);

    // Create booking_passengers table
    await queryRunner.query(`
      CREATE TABLE "booking_passengers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "full_name" varchar NOT NULL,
        "age" int NOT NULL,
        "email" varchar,
        "phone" varchar,
        "emergency_contact" varchar NOT NULL,
        "special_requirements" text,
        "additional_info" jsonb,
        "booking_id" uuid NOT NULL,
        CONSTRAINT "FK_booking_passengers_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE
      )
    `);

    // Create booking_payments table
    await queryRunner.query(`
      CREATE TABLE "booking_payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "amount" decimal(10,2) NOT NULL,
        "paymentMethod" "payment_method_enum" NOT NULL,
        "status" "payment_status_enum" DEFAULT 'pending',
        "payment_reference" varchar,
        "transaction_id" varchar,
        "payment_date" date,
        "notes" text,
        "receipt_file_path" varchar,
        "payment_details" jsonb,
        "booking_id" uuid NOT NULL,
        "recorded_by_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "FK_booking_payments_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_payments_recorded_by" FOREIGN KEY ("recorded_by_id") REFERENCES "user"("id") ON DELETE RESTRICT
      )
    `);

    // Create booking_documents table
    await queryRunner.query(`
      CREATE TABLE "booking_documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "file_name" varchar NOT NULL,
        "original_name" varchar NOT NULL,
        "file_path" varchar NOT NULL,
        "file_size" int NOT NULL,
        "mime_type" varchar NOT NULL,
        "documentType" "document_type_enum" DEFAULT 'other',
        "description" text,
        "booking_id" uuid NOT NULL,
        "uploaded_by_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "FK_booking_documents_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_documents_uploaded_by" FOREIGN KEY ("uploaded_by_id") REFERENCES "user"("id") ON DELETE RESTRICT
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_organization_id" ON "bookings" ("organization_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_customer_id" ON "bookings" ("customer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_status" ON "bookings" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_created_at" ON "bookings" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_booking_number" ON "bookings" ("booking_number")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_booking_passengers_booking_id" ON "booking_passengers" ("booking_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_booking_payments_booking_id" ON "booking_payments" ("booking_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_booking_documents_booking_id" ON "booking_documents" ("booking_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_booking_documents_booking_id"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_payments_booking_id"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_passengers_booking_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_booking_number"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_status"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_customer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_organization_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "booking_documents"`);
    await queryRunner.query(`DROP TABLE "booking_payments"`);
    await queryRunner.query(`DROP TABLE "booking_passengers"`);
    await queryRunner.query(`DROP TABLE "bookings"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "document_type_enum"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "booking_status_enum"`);
  }
} 