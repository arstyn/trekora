import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentMilestoneAddedOrder1783810936863 implements MigrationInterface {
    name = 'PaymentMilestoneAddedOrder1783810936863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_milestones" ADD "order" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_milestones" DROP COLUMN "order"`);
    }

}
