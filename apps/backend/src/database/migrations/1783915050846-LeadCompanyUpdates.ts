import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadCompanyUpdates1783915050846 implements MigrationInterface {
    name = 'LeadCompanyUpdates1783915050846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" ADD "lead_type" character varying NOT NULL DEFAULT 'individual'`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "company_website" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "company_industry" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "contact_designation" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "company_size" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "company_size"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "contact_designation"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "company_industry"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "company_website"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "lead_type"`);
    }

}
