import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleEntity1751465239200 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "description" text NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
