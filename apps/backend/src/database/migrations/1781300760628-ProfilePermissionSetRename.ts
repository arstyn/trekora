import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfilePermissionSetRename1781300760628 implements MigrationInterface {
    name = 'ProfilePermissionSetRename1781300760628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile_permission_set" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission_set_id" uuid NOT NULL, "employee_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bfd31c2422a336c86ec44b37342" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "profile_permission_set" ADD CONSTRAINT "FK_03a8f32d1c2896ea1a41cbb7861" FOREIGN KEY ("permission_set_id") REFERENCES "permission_set"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile_permission_set" ADD CONSTRAINT "FK_5ec176d35e95a59bfc1092a0e13" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Migrate data intelligently from user_permission_set to profile_permission_set
        await queryRunner.query(`
            INSERT INTO "profile_permission_set" ("permission_set_id", "employee_id")
            SELECT DISTINCT ups."permission_set_id", COALESCE(ups."employee_id", e."id")
            FROM "user_permission_set" ups
            LEFT JOIN "permission_set" ps ON ps."id" = ups."permission_set_id"
            LEFT JOIN "employee" e ON e."user_id" = ups."user_id" AND e."organization_id" = ps."organization_id"
            WHERE ups."employee_id" IS NOT NULL OR e."id" IS NOT NULL
        `);

        // Drop old table
        await queryRunner.query(`DROP TABLE IF EXISTS "user_permission_set"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile_permission_set" DROP CONSTRAINT "FK_5ec176d35e95a59bfc1092a0e13"`);
        await queryRunner.query(`ALTER TABLE "profile_permission_set" DROP CONSTRAINT "FK_03a8f32d1c2896ea1a41cbb7861"`);
        await queryRunner.query(`DROP TABLE "profile_permission_set"`);
    }

}
