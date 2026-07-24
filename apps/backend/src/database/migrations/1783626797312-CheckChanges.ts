import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckChanges1783626797312 implements MigrationInterface {
    name = 'CheckChanges1783626797312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "package_tiers" ADD "totalAdultCost" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "package_tiers" DROP COLUMN "totalAdultCost"`);
    }

}
