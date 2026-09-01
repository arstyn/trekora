import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscountModeAndRangeToBatchOffers1789200000000 implements MigrationInterface {
    name = 'AddDiscountModeAndRangeToBatchOffers1789200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."batch_offers_discount_mode_enum" AS ENUM('fixed', 'range');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "batch_offers"
            ADD COLUMN IF NOT EXISTS "discount_mode" "public"."batch_offers_discount_mode_enum" NOT NULL DEFAULT 'fixed',
            ADD COLUMN IF NOT EXISTS "min_discount_value" numeric(10,2),
            ADD COLUMN IF NOT EXISTS "max_discount_value" numeric(10,2)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP COLUMN IF EXISTS "max_discount_value"`);
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP COLUMN IF EXISTS "min_discount_value"`);
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP COLUMN IF EXISTS "discount_mode"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."batch_offers_discount_mode_enum"`);
    }
}
