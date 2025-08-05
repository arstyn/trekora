import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTypeAndArchiveStatus1734567890123 implements MigrationInterface {
  name = 'AddPaymentTypeAndArchiveStatus1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create PaymentType enum
    await queryRunner.query(`
      CREATE TYPE "public"."payment_type_enum" AS ENUM('advance', 'balance', 'partial', 'refund')
    `);

    // Add ARCHIVED to existing PaymentStatus enum
    await queryRunner.query(`
      ALTER TYPE "public"."payment_status_enum" ADD VALUE 'archived'
    `);

    // Add payment_type column to booking_payments table
    await queryRunner.query(`
      ALTER TABLE "booking_payments" 
      ADD COLUMN "payment_type" "public"."payment_type_enum" NOT NULL DEFAULT 'advance'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove payment_type column
    await queryRunner.query(`
      ALTER TABLE "booking_payments" DROP COLUMN "payment_type"
    `);

    // Drop PaymentType enum
    await queryRunner.query(`
      DROP TYPE "public"."payment_type_enum"
    `);

    // Note: Cannot remove enum value from existing enum in PostgreSQL without recreating it
    // This would require more complex migration with data preservation
    await queryRunner.query(`
      -- Cannot easily remove 'archived' from payment_status_enum without recreating
      -- This would require backing up data, dropping enum, recreating, and restoring data
    `);
  }
} 