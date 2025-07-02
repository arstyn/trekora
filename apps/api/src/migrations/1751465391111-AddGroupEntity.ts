import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupEntity1751465391111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "group" (
                "id" SERIAL NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar NULL,
                CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "group"`);
  }
}
