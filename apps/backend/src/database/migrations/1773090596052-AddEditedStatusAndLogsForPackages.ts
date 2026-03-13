import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEditedStatusAndLogsForPackages1773090596052 implements MigrationInterface {
    name = 'AddEditedStatusAndLogsForPackages1773090596052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "package_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "package_id" uuid NOT NULL, "user_id" uuid NOT NULL, "action" character varying NOT NULL, "details" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d672f8549b78a4caebe4e9ce4e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "draftContent" jsonb`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."packages_status_enum"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "status" character varying DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "package_activities" ADD CONSTRAINT "FK_d5e4e1f7c65dbd860c811c8ef50" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "package_activities" ADD CONSTRAINT "FK_3c33902efcdff53a8f049c853dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "package_activities" DROP CONSTRAINT "FK_3c33902efcdff53a8f049c853dd"`);
        await queryRunner.query(`ALTER TABLE "package_activities" DROP CONSTRAINT "FK_d5e4e1f7c65dbd860c811c8ef50"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."packages_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "status" "public"."packages_status_enum" DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "draftContent"`);
        await queryRunner.query(`DROP TABLE "package_activities"`);
    }

}
