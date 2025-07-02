import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerEntity1751465561665 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."customer_status_enum" AS ENUM('active', 'inactive', 'pending')
        `);

    await queryRunner.query(`
            CREATE TABLE "customer" (
                "id" SERIAL NOT NULL,
                "name" varchar NOT NULL,
                "email" varchar NOT NULL,
                "phoneNumber" varchar NOT NULL,
                "address" varchar NOT NULL,
                "status" "public"."customer_status_enum" NOT NULL DEFAULT 'pending',
                "notes" varchar NULL,
                CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"),
                CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TYPE "public"."customer_status_enum"`);
  }
}
