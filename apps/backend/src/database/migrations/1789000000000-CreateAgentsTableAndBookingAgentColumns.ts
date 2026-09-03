import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentsTableAndBookingAgentColumns1789000000000 implements MigrationInterface {
    name = 'CreateAgentsTableAndBookingAgentColumns1789000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agents_commission_type_enum') THEN
                    CREATE TYPE "public"."agents_commission_type_enum" AS ENUM('percentage', 'fixed');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agents_status_enum') THEN
                    CREATE TYPE "public"."agents_status_enum" AS ENUM('active', 'inactive');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookings_agent_commission_type_enum') THEN
                    CREATE TYPE "public"."bookings_agent_commission_type_enum" AS ENUM('percentage', 'fixed');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookings_agent_payout_status_enum') THEN
                    CREATE TYPE "public"."bookings_agent_payout_status_enum" AS ENUM('pending', 'paid', 'cancelled');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "agents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "agency_name" character varying,
                "email" character varying,
                "phone" character varying,
                "commission_type" "public"."agents_commission_type_enum" NOT NULL DEFAULT 'percentage',
                "commission_value" numeric(10,2) NOT NULL DEFAULT '0',
                "status" "public"."agents_status_enum" NOT NULL DEFAULT 'active',
                "notes" text,
                "organization_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_agents_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_agents_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "agent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "agent_commission_type" "public"."bookings_agent_commission_type_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "agent_commission_value" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "agent_commission_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "agent_payout_status" "public"."bookings_agent_payout_status_enum" NOT NULL DEFAULT 'pending'`);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_agent_id') THEN
                    ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_agent_id" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_agent_id"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "agent_payout_status"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "agent_commission_amount"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "agent_commission_value"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "agent_commission_type"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "agent_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agents"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."bookings_agent_payout_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."bookings_agent_commission_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."agents_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."agents_commission_type_enum"`);
    }
}
