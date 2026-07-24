import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadCompanyDetailsUpdates1783922203293 implements MigrationInterface {
    name = 'LeadCompanyDetailsUpdates1783922203293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" ADD "budget" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "budget"`);
    }

}
