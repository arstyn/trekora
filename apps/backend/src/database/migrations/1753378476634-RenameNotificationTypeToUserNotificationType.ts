import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameNotificationTypeToUserNotificationType1753384560000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification_type" RENAME TO "user_notification_type";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_notification_type" RENAME TO "notification_type";
    `);
  }
}
