import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationEntity1751467995084 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "notification" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "userId" uuid NOT NULL,
                    "message" varchar NOT NULL,
                    "isRead" boolean NOT NULL DEFAULT false,
                    "reminderId" varchar NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_notification_id" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "notification"
                ADD CONSTRAINT "FK_notification_user"
                FOREIGN KEY ("userId")
                REFERENCES "user"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_user"`,
        );
        await queryRunner.query(`DROP TABLE "notification"`);
      }
}
