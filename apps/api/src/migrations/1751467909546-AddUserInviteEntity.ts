import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserInviteEntity1751467909546 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE "user_invite" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "email" varchar NOT NULL,
                    "token" varchar NOT NULL,
                    "expiresAt" TIMESTAMP NOT NULL,
                    "used" boolean NOT NULL DEFAULT false,
                    "employeeId" uuid NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_user_invite_id" PRIMARY KEY ("id")
                )
            `);

    await queryRunner.query(`
                ALTER TABLE "user_invite"
                ADD CONSTRAINT "FK_user_invite_employee"
                FOREIGN KEY ("employeeId")
                REFERENCES "employee"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_invite" DROP CONSTRAINT "FK_user_invite_employee"`,
    );
    await queryRunner.query(`DROP TABLE "user_invite"`);
  }
}
