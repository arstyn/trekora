import { MigrationInterface, QueryRunner } from 'typeorm';

export class batchCreate1753471947277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create batch table
    await queryRunner.query(`
      CREATE TABLE "batch" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "total_seats" integer NOT NULL,
        "booked_seats" integer NOT NULL,
        "status" VARCHAR NOT NULL,
        "package_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        PRIMARY KEY ("id")
      );

      CREATE TABLE "batch_coordinators" (
        "batchId" uuid NOT NULL,
        "employeeId" uuid NOT NULL,
        PRIMARY KEY ("batchId", "employeeId")
      );

      CREATE TABLE "batch_passengers" (
        "batchId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        PRIMARY KEY ("batchId", "customerId")
      );

      ALTER TABLE "batch"
      ADD CONSTRAINT "FK_batch_package" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

      ALTER TABLE "batch"
      ADD CONSTRAINT "FK_batch_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

      ALTER TABLE "batch_coordinators"
      ADD CONSTRAINT "FK_batch_employee" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE;

      ALTER TABLE "batch_passengers"
      ADD CONSTRAINT "FK_batch_customer" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "batch_passengers"`);
    await queryRunner.query(`DROP TABLE "batch_coordinators"`);
    await queryRunner.query(`DROP TABLE "batch"`);
  }
}

