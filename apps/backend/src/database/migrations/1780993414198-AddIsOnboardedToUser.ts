import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsOnboardedToUser1780993414198 implements MigrationInterface {
    name = 'AddIsOnboardedToUser1780993414198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_onboarded" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "is_onboarded"`);
    }
}
