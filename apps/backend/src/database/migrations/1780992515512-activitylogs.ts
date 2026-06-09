import { MigrationInterface, QueryRunner } from "typeorm";

export class Activitylogs1780992515512 implements MigrationInterface {
    name = 'Activitylogs1780992515512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "performed_by_id" uuid, "action" character varying NOT NULL, "details" text NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "is_archived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_f2a5695f730cbe9bf16eeb74342" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_f3ae221e1012294853ee4bd5879" FOREIGN KEY ("performed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_f3ae221e1012294853ee4bd5879"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_f2a5695f730cbe9bf16eeb74342"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "is_archived"`);
        await queryRunner.query(`DROP TABLE "activity_logs"`);
    }

}
