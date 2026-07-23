import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerAddressAndCountry1784798380853 implements MigrationInterface {
    name = 'AddCustomerAddressAndCountry1784798380853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "district" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "state" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "pin_code" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "country" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "address_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "country"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "pin_code"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "state"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "district"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "address_type" character varying NOT NULL DEFAULT 'domestic'`);
    }
}
