import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadCustomPackageUpdates1783921443898 implements MigrationInterface {
    name = 'LeadCustomPackageUpdates1783921443898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" ADD "is_custom_package" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_name" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_destination" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_days" integer`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_nights" integer`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_price" numeric`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "custom_package_description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_description"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_price"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_nights"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_days"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_destination"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "custom_package_name"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "is_custom_package"`);
    }

}
