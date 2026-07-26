import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemplates1784904094514 implements MigrationInterface {
    name = 'AddTemplates1784904094514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment_structure_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_by_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "milestones" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7c37d0883cbb681bf91709d4f2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cancellation_tier_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_by_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "tiers" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb5472eb180f8ab6d5f4d7bcf7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "payment_structure_template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "cancellation_structure_template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "meals_template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payment_structure_templates" ADD CONSTRAINT "FK_631d3e1f56b91e085add1f15ab2" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_structure_templates" ADD CONSTRAINT "FK_ec75037f125727b6b03f5323783" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancellation_tier_templates" ADD CONSTRAINT "FK_a08043042a46a15a69bf2cf6fb7" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancellation_tier_templates" ADD CONSTRAINT "FK_9687e810193a72bd44585a80e6f" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cancellation_tier_templates" DROP CONSTRAINT "FK_9687e810193a72bd44585a80e6f"`);
        await queryRunner.query(`ALTER TABLE "cancellation_tier_templates" DROP CONSTRAINT "FK_a08043042a46a15a69bf2cf6fb7"`);
        await queryRunner.query(`ALTER TABLE "payment_structure_templates" DROP CONSTRAINT "FK_ec75037f125727b6b03f5323783"`);
        await queryRunner.query(`ALTER TABLE "payment_structure_templates" DROP CONSTRAINT "FK_631d3e1f56b91e085add1f15ab2"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "meals_template_id"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "cancellation_structure_template_id"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "payment_structure_template_id"`);
        await queryRunner.query(`DROP TABLE "cancellation_tier_templates"`);
        await queryRunner.query(`DROP TABLE "payment_structure_templates"`);
    }

}
