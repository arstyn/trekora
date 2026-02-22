import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationAndChecklistAssignment1771700000000
  implements MigrationInterface
{
  name = 'AddVerificationAndChecklistAssignment1771700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to bookings
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "docs_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "docs_verified_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "docs_verified_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "payment_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "payment_verified_by_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "payment_verified_at" TIMESTAMP`,
    );

    // Add FKs for bookings
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_docs_verified_by" FOREIGN KEY ("docs_verified_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_payment_verified_by" FOREIGN KEY ("payment_verified_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Add columns to booking_checklists
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" ADD "assigned_to_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" ADD "updated_by_id" uuid`,
    );

    // Add FKs for booking_checklists
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_updated_by" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FKs and columns from booking_checklists
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_assigned_to"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" DROP COLUMN "updated_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_checklists" DROP COLUMN "assigned_to_id"`,
    );

    // Remove FKs and columns from bookings
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_payment_verified_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_docs_verified_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "payment_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "payment_verified_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "payment_verified"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "docs_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "docs_verified_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "docs_verified"`,
    );
  }
}
