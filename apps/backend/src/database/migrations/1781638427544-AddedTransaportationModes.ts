import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTransaportationModes1781638427544 implements MigrationInterface {
    name = 'AddedTransaportationModes1781638427544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transportation_options" RENAME COLUMN "details" TO "segments"`);
        await queryRunner.query(`ALTER TABLE "package_tiers" ADD "transportationId" character varying`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "groundTransportationCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "transportation_options" DROP COLUMN "segments"`);
        await queryRunner.query(`ALTER TABLE "transportation_options" ADD "segments" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transportation_options" DROP COLUMN "segments"`);
        await queryRunner.query(`ALTER TABLE "transportation_options" ADD "segments" character varying`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "groundTransportationCost"`);
        await queryRunner.query(`ALTER TABLE "package_tiers" DROP COLUMN "transportationId"`);
        await queryRunner.query(`ALTER TABLE "transportation_options" RENAME COLUMN "segments" TO "details"`);
    }

}
