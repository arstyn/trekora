import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMealsTable1781700000000 implements MigrationInterface {
    name = 'CreateMealsTable1781700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "meals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "created_by_id" uuid NOT NULL,
                "organization_id" uuid NOT NULL,
                "breakfast" jsonb,
                "lunch" jsonb,
                "dinner" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_meals" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "meals" 
            ADD CONSTRAINT "FK_meals_created_by" 
            FOREIGN KEY ("created_by_id") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "meals" 
            ADD CONSTRAINT "FK_meals_organization" 
            FOREIGN KEY ("organization_id") 
            REFERENCES "organization"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_meals_organization"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_meals_created_by"`);
        await queryRunner.query(`DROP TABLE "meals"`);
    }
}
