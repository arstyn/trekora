import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDesignationToEmployee1781207521984 implements MigrationInterface {
    name = 'AddDesignationToEmployee1781207521984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "designation" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "designation"`);
    }

}
