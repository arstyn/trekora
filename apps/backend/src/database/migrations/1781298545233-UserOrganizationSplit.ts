import { MigrationInterface, QueryRunner } from "typeorm";

export class UserOrganizationSplit1781298545233 implements MigrationInterface {
    name = 'UserOrganizationSplit1781298545233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "organization_id" TO "last_accessed_organization_id"`);
        await queryRunner.query(`CREATE TABLE "user_organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "relation" character varying DEFAULT 'member', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e103cdf85b7d6cb620b4db0f0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_organization" ADD CONSTRAINT "FK_3380ac618acf226e1c2d6e9a228" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_organization" ADD CONSTRAINT "FK_f2d20e8f038adda18639b2db1b8" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Data Migration: Populate user_organization from the employee table
        await queryRunner.query(`
            INSERT INTO "user_organization" ("user_id", "organization_id", "relation", "is_active")
            SELECT DISTINCT e."user_id", e."organization_id", 'member', true
            FROM "employee" e
            WHERE e."user_id" IS NOT NULL AND e."organization_id" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_organization" DROP CONSTRAINT "FK_f2d20e8f038adda18639b2db1b8"`);
        await queryRunner.query(`ALTER TABLE "user_organization" DROP CONSTRAINT "FK_3380ac618acf226e1c2d6e9a228"`);
        await queryRunner.query(`DROP TABLE "user_organization"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "last_accessed_organization_id" TO "organization_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
