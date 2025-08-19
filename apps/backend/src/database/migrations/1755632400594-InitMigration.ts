import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1755632400594 implements MigrationInterface {
    name = 'InitMigration1755632400594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "experience" character varying`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "specialization" character varying`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "additional_info" character varying`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_7b0acac061179bb6e5c53b4005f" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_7b0acac061179bb6e5c53b4005f"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "additional_info"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "specialization"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "experience"`);
    }

}
