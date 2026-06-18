import { MigrationInterface, QueryRunner } from "typeorm";

export class BatchEditSeatReasonAdded1781816853088 implements MigrationInterface {
    name = 'BatchEditSeatReasonAdded1781816853088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch" ADD "seat_change_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "seat_change_reason"`);
    }

}
