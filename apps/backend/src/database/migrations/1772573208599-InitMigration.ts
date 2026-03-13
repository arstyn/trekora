import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1772573208599 implements MigrationInterface {
    name = 'InitMigration1772573208599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_assigned_to"`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_updated_by"`);
        await queryRunner.query(`ALTER TABLE "workflows" DROP CONSTRAINT "FK_workflows_organization"`);
        await queryRunner.query(`ALTER TABLE "workflows" DROP CONSTRAINT "FK_workflows_created_by"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_workflow"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_workflow_steps_workflow"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_workflow_steps_assigned_to"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_workflow_steps_completed_by"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_workflow_logs_workflow"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_workflow_logs_step"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_workflow_logs_changed_by"`);
        await queryRunner.query(`CREATE TYPE "public"."checklist_items_type_enum" AS ENUM('individual', 'common')`);
        await queryRunner.query(`ALTER TABLE "checklist_items" ADD "type" "public"."checklist_items_type_enum" NOT NULL DEFAULT 'common'`);
        await queryRunner.query(`CREATE TYPE "public"."workflow_steps_type_enum" AS ENUM('individual', 'common')`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD "type" "public"."workflow_steps_type_enum" NOT NULL DEFAULT 'common'`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."batch_status_enum" AS ENUM('upcoming', 'active', 'completed')`);
        await queryRunner.query(`ALTER TABLE "batch" ADD "status" "public"."batch_status_enum" NOT NULL DEFAULT 'upcoming'`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_be39d03c3758aa0a96f944dc12c" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_5e7df9d1194f7018a5bc35b0afc" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflows" ADD CONSTRAINT "FK_d0327b3752cf21c97fb7ae9f0b2" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflows" ADD CONSTRAINT "FK_2efdcd3dd18adce22519bb09e66" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_ed38e9c7761f95df8c6d2449681" FOREIGN KEY ("current_workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_02f0092e12343bfed27bb65fa89" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_dce59ff90f096582bda6c3108e2" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_bd7ee07855a7d4a781b72654715" FOREIGN KEY ("completed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_afd0529a160fe7d72d323581c52" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_2db63ad5c61cff8bf9bb8139269" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_5bc67a6664ae0dc6da2f4cf6e25" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_5bc67a6664ae0dc6da2f4cf6e25"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_2db63ad5c61cff8bf9bb8139269"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" DROP CONSTRAINT "FK_afd0529a160fe7d72d323581c52"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_bd7ee07855a7d4a781b72654715"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_dce59ff90f096582bda6c3108e2"`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP CONSTRAINT "FK_02f0092e12343bfed27bb65fa89"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_ed38e9c7761f95df8c6d2449681"`);
        await queryRunner.query(`ALTER TABLE "workflows" DROP CONSTRAINT "FK_2efdcd3dd18adce22519bb09e66"`);
        await queryRunner.query(`ALTER TABLE "workflows" DROP CONSTRAINT "FK_d0327b3752cf21c97fb7ae9f0b2"`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_5e7df9d1194f7018a5bc35b0afc"`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_be39d03c3758aa0a96f944dc12c"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."batch_status_enum"`);
        await queryRunner.query(`ALTER TABLE "batch" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."workflow_steps_type_enum"`);
        await queryRunner.query(`ALTER TABLE "checklist_items" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."checklist_items_type_enum"`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_changed_by" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_step" FOREIGN KEY ("step_id") REFERENCES "workflow_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_logs" ADD CONSTRAINT "FK_workflow_logs_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_completed_by" FOREIGN KEY ("completed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflow_steps" ADD CONSTRAINT "FK_workflow_steps_workflow" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_workflow" FOREIGN KEY ("current_workflow_id") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflows" ADD CONSTRAINT "FK_workflows_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workflows" ADD CONSTRAINT "FK_workflows_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_updated_by" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
