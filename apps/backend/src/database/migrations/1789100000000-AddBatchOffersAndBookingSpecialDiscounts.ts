import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBatchOffersAndBookingSpecialDiscounts1789100000000 implements MigrationInterface {
    name = 'AddBatchOffersAndBookingSpecialDiscounts1789100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."batch_offers_discount_type_enum" AS ENUM('percentage', 'flat');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."batch_offers_discount_scope_enum" AS ENUM('passenger', 'booking');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "batch_offers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "batch_id" uuid NOT NULL,
                "organization_id" uuid NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" text,
                "discount_type" "public"."batch_offers_discount_type_enum" NOT NULL DEFAULT 'flat',
                "discount_value" numeric(10,2) NOT NULL DEFAULT 0,
                "discount_scope" "public"."batch_offers_discount_scope_enum" NOT NULL DEFAULT 'passenger',
                "min_travelers" integer NOT NULL DEFAULT 1,
                "max_discount_cap" numeric(10,2),
                "valid_from" TIMESTAMP WITH TIME ZONE,
                "valid_until" TIMESTAMP WITH TIME ZONE,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_batch_offers_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "batch_offers"
                ADD CONSTRAINT "FK_batch_offers_batch" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "batch_offers"
                ADD CONSTRAINT "FK_batch_offers_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "batch_offers"
                ADD CONSTRAINT "FK_batch_offers_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD COLUMN IF NOT EXISTS "batch_offer_id" uuid,
            ADD COLUMN IF NOT EXISTS "special_offer_discount" numeric(10,2) NOT NULL DEFAULT 0
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "bookings"
                ADD CONSTRAINT "FK_bookings_batch_offer" FOREIGN KEY ("batch_offer_id") REFERENCES "batch_offers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_batch_offer"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "special_offer_discount"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "batch_offer_id"`);
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP CONSTRAINT IF EXISTS "FK_batch_offers_created_by"`);
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP CONSTRAINT IF EXISTS "FK_batch_offers_organization"`);
        await queryRunner.query(`ALTER TABLE "batch_offers" DROP CONSTRAINT IF EXISTS "FK_batch_offers_batch"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "batch_offers"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."batch_offers_discount_scope_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."batch_offers_discount_type_enum"`);
    }
}
