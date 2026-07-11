import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingEntityAddedPaymentStructure1783809108804 implements MigrationInterface {
    name = 'BookingEntityAddedPaymentStructure1783809108804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD "payment_structure_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "is_payment_overridden" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "payment_override_reason" text`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_e171d4f1888f20853fd76edc771" FOREIGN KEY ("payment_structure_id") REFERENCES "payment_milestones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_e171d4f1888f20853fd76edc771"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "payment_override_reason"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "is_payment_overridden"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "payment_structure_id"`);
    }

}
