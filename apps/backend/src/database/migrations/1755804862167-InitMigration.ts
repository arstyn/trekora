import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1755804862167 implements MigrationInterface {
    name = 'InitMigration1755804862167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_items" DROP COLUMN "completed"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_items" ADD "completed" boolean NOT NULL DEFAULT false`);
    }

}
