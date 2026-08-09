import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaxDiscountColumnsToPackages1786000000000 implements MigrationInterface {
    name = 'AddMaxDiscountColumnsToPackages1786000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_type" character varying DEFAULT 'amount'`);
        await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_value" numeric(10,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_percentage" numeric(5,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "discount_amount"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_percentage"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_value"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_type"`);
    }
}
