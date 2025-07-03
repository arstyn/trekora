import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1751562592255 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS "newsletter_subscribed" boolean DEFAULT false;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "notifications_enabled",
            DROP COLUMN IF EXISTS "newsletter_subscribed";
        `);
    }

}
