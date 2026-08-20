import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingEntityAddedAdjustmentAmount1786549877497 implements MigrationInterface {
    name = 'BookingEntityAddedAdjustmentAmount1786549877497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "FK_customer_blacklisted_by"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_ed38e9c7761f95df8c6d2449681"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT IF EXISTS "FK_afd0529a160fe7d72d323581c52"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT IF EXISTS "FK_2db63ad5c61cff8bf9bb8139269"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "adjustment_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_type"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_type" text DEFAULT 'amount'`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "max_discount_scope"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_discount_scope" text DEFAULT 'group'`);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_6f46104d4874e7ef684ef87b3b5') THEN
                    ALTER TABLE "customer" ADD CONSTRAINT "FK_6f46104d4874e7ef684ef87b3b5" FOREIGN KEY ("blacklisted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END;
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ed38e9c7761f95df8c6d2449681') THEN
                    ALTER TABLE "bookings" ADD CONSTRAINT "FK_ed38e9c7761f95df8c6d2449681" FOREIGN KEY ("current_workflow_id") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END;
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_afd0529a160fe7d72d323581c52') THEN
                    ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_afd0529a160fe7d72d323581c52" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END;
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_2db63ad5c61cff8bf9bb8139269') THEN
                    ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_2db63ad5c61cff8bf9bb8139269" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END;
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_2db63ad5c61cff8bf9bb8139269"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_afd0529a160fe7d72d323581c52"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_ed38e9c7761f95df8c6d2449681"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_6f46104d4874e7ef684ef87b3b5"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "max_discount_scope"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "max_discount_scope" character varying DEFAULT 'group'`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "max_discount_type"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "max_discount_type" character varying DEFAULT 'amount'`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "adjustment_amount"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_2db63ad5c61cff8bf9bb8139269" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_afd0529a160fe7d72d323581c52" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_ed38e9c7761f95df8c6d2449681" FOREIGN KEY ("current_workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_customer_blacklisted_by" FOREIGN KEY ("blacklisted_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
