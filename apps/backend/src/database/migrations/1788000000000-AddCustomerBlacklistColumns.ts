import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerBlacklistColumns1788000000000 implements MigrationInterface {
    name = 'AddCustomerBlacklistColumns1788000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "is_blacklisted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "blacklisted_reason" text`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "blacklisted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "blacklisted_by_id" uuid`);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_customer_blacklisted_by') THEN
                    ALTER TABLE "customer" ADD CONSTRAINT "FK_customer_blacklisted_by" FOREIGN KEY ("blacklisted_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "FK_customer_blacklisted_by"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "blacklisted_by_id"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "blacklisted_at"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "blacklisted_reason"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN IF EXISTS "is_blacklisted"`);
    }
}
