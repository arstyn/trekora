import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplementWorkflowSystem1771701000000
  implements MigrationInterface
{
  name = 'ImplementWorkflowSystem1771701000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(
      `CREATE TYPE "workflows_type_enum" AS ENUM('package', 'booking', 'customer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "workflow_steps_status_enum" AS ENUM('pending', 'completed', 'skipped')`,
    );

    // 2. Create workflows table
    await queryRunner.query(`
      CREATE TABLE "workflows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "name" character varying NOT NULL, 
        "type" "workflows_type_enum" NOT NULL, 
        "reference_id" uuid, 
        "organization_id" uuid NOT NULL, 
        "created_by_id" uuid NOT NULL, 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_workflows" PRIMARY KEY ("id")
      )
    `);

    // 3. Create workflow_steps table
    await queryRunner.query(`
      CREATE TABLE "workflow_steps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "workflow_id" uuid NOT NULL, 
        "label" character varying NOT NULL, 
        "description" text, 
        "is_mandatory" boolean NOT NULL DEFAULT false, 
        "status" "workflow_steps_status_enum" NOT NULL DEFAULT 'pending', 
        "sort_order" integer NOT NULL DEFAULT 0, 
        "assigned_to_id" uuid, 
        "completed_by_id" uuid, 
        "completed_at" TIMESTAMP, 
        "config" jsonb, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_workflow_steps" PRIMARY KEY ("id")
      )
    `);

    // 4. Create workflow_logs table
    await queryRunner.query(`
      CREATE TABLE "workflow_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "workflow_id" uuid NOT NULL, 
        "step_id" uuid, 
        "changed_by_id" uuid NOT NULL, 
        "action" character varying NOT NULL, 
        "previous_data" jsonb, 
        "new_data" jsonb, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_workflow_logs" PRIMARY KEY ("id")
      )
    `);

    // 5. Add current_workflow_id to bookings
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "current_workflow_id" uuid`,
    );

    // 6. Add Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "workflows" ADD CONSTRAINT "FK_workflows_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflows" ADD CONSTRAINT "FK_workflows_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_completed_by" FOREIGN KEY ("completed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_step" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_changed_by" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_workflow" FOREIGN KEY ("current_workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 7. Cleanup unwanted columns if they exist (from previous failed attempt)
    // Using DO block for idempotent column dropping
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='docs_verified') THEN
          ALTER TABLE "bookings" DROP COLUMN "docs_verified";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='docs_verified_by_id') THEN
          ALTER TABLE "bookings" DROP COLUMN "docs_verified_by_id";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='docs_verified_at') THEN
          ALTER TABLE "bookings" DROP COLUMN "docs_verified_at";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_verified') THEN
          ALTER TABLE "bookings" DROP COLUMN "payment_verified";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_verified_by_id') THEN
          ALTER TABLE "bookings" DROP COLUMN "payment_verified_by_id";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_verified_at') THEN
          ALTER TABLE "bookings" DROP COLUMN "payment_verified_at";
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_workflow"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "current_workflow_id"`,
    );
    await queryRunner.query(`DROP TABLE "workflow_logs"`);
    await queryRunner.query(`DROP TABLE "workflow_steps"`);
    await queryRunner.query(`DROP TABLE "workflows"`);
    await queryRunner.query(`DROP TYPE "workflow_steps_status_enum"`);
    await queryRunner.query(`DROP TYPE "workflows_type_enum"`);
  }
}
