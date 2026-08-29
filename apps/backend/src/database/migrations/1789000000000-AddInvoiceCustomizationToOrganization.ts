import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceCustomizationToOrganization1789000000000 implements MigrationInterface {
    name = 'AddInvoiceCustomizationToOrganization1789000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "invoice_color" character varying DEFAULT '#2563eb'`);
        await queryRunner.query(`ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "invoice_seal" character varying`);
        await queryRunner.query(`ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "invoice_fields" jsonb DEFAULT '{"showLogo": true, "showBillingTo": true, "showTripDetails": true, "showPaymentHistory": true, "showBalanceDue": true, "showFooter": true}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "invoice_fields"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "invoice_seal"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "invoice_color"`);
    }
}
