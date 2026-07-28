import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBatchBlockingAndDefaults1785221919043 implements MigrationInterface {
    name = 'AddBatchBlockingAndDefaults1785221919043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."batch_blocks_status_enum" AS ENUM('active', 'released', 'expired', 'converted')`);
        await queryRunner.query(`CREATE TABLE "batch_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batch_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "slots" integer NOT NULL, "reason" text, "status" "public"."batch_blocks_status_enum" NOT NULL DEFAULT 'active', "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_62da4020f6df88a9fca1fd278b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "default_block_days" integer NOT NULL DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE "batch" ADD "blocked_seats" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "batch_blocks" ADD CONSTRAINT "FK_df458a09d0eb5fcac9ac230ba1f" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch_blocks" ADD CONSTRAINT "FK_198064eb3060d9b5d1c9d7cb602" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch_blocks" ADD CONSTRAINT "FK_4de8224b376e53f3218737ebb54" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_blocks" DROP CONSTRAINT "FK_4de8224b376e53f3218737ebb54"`);
        await queryRunner.query(`ALTER TABLE "batch_blocks" DROP CONSTRAINT "FK_198064eb3060d9b5d1c9d7cb602"`);
        await queryRunner.query(`ALTER TABLE "batch_blocks" DROP CONSTRAINT "FK_df458a09d0eb5fcac9ac230ba1f"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "blocked_seats"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "default_block_days"`);
        await queryRunner.query(`DROP TABLE "batch_blocks"`);
        await queryRunner.query(`DROP TYPE "public"."batch_blocks_status_enum"`);
    }

}
