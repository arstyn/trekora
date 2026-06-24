import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeAndMealIdToMeals1781890000000 implements MigrationInterface {
    name = 'AddTypeAndMealIdToMeals1781890000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meals" ADD "type" character varying NOT NULL DEFAULT 'veg'`);
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" ADD "meal_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" DROP COLUMN "meal_id"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "type"`);
    }
}
