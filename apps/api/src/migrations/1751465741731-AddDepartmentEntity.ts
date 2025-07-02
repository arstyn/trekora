import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartmentEntity1751465741731 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "department" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "description" varchar NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_department_id" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "department"`);
  }
}
