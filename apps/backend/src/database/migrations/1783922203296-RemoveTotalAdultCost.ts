import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTotalAdultCost1783922203296 implements MigrationInterface {
    name = 'RemoveTotalAdultCost1783922203296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "package_tiers" DROP COLUMN "totalAdultCost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "package_tiers" ADD "totalAdultCost" numeric(10,2)`);
    }
}
