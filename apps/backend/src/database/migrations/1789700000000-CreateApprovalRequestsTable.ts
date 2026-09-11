import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApprovalRequestsTable1789700000000 implements MigrationInterface {
    name = 'CreateApprovalRequestsTable1789700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_action_enum') THEN
                    CREATE TYPE "public"."approval_action_enum" AS ENUM(
                        'booking_cancel',
                        'booking_discount',
                        'payment_refund',
                        'payment_delete',
                        'agent_payout',
                        'customer_delete',
                        'batch_cancel'
                    );
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status_enum') THEN
                    CREATE TYPE "public"."approval_status_enum" AS ENUM(
                        'pending',
                        'approved',
                        'rejected',
                        'cancelled'
                    );
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "approval_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "organization_id" uuid NOT NULL,
                "action" "public"."approval_action_enum" NOT NULL,
                "resource" character varying(50) NOT NULL,
                "entity_id" uuid NOT NULL,
                "entity_reference" character varying(100),
                "title" character varying(255) NOT NULL,
                "reason" text,
                "payload" jsonb NOT NULL DEFAULT '{}',
                "snapshot" jsonb,
                "status" "public"."approval_status_enum" NOT NULL DEFAULT 'pending',
                "requested_by_id" uuid NOT NULL,
                "reviewed_by_id" uuid,
                "reviewed_at" TIMESTAMP,
                "review_notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_approval_requests_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_approval_requests_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_approval_requests_requested_by" FOREIGN KEY ("requested_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_approval_requests_reviewed_by" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_approval_requests_org_status" ON "approval_requests" ("organization_id", "status");
            CREATE INDEX IF NOT EXISTS "IDX_approval_requests_resource_entity" ON "approval_requests" ("resource", "entity_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "approval_requests"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."approval_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."approval_action_enum"`);
    }
}
