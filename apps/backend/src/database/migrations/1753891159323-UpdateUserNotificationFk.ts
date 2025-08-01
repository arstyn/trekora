import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserNotificationFk1753891159323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_notification" DROP CONSTRAINT IF EXISTS "fk_notification_type";
    `);

    await queryRunner.query(`
      ALTER TABLE "user_notification"
      ADD CONSTRAINT "fk_user_notification_type"
      FOREIGN KEY ("user_notification_type_id")
      REFERENCES "user_notification_type"("id")
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_notification" DROP CONSTRAINT IF EXISTS "fk_user_notification_type";
    `);
  }
}
