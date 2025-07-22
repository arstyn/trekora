import { MigrationInterface, QueryRunner } from 'typeorm';

export class FileManager1752933727441 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "file_manager_relatedtype_enum" AS ENUM ('na', 'package', 'customer', 'employee', 'department', 'organization', 'user', 'itinerary', 'lead', 'lead-updates')`,
    );
    await queryRunner.query(`
            CREATE TABLE "file_manager" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "filename" character varying NOT NULL,
                "relatedId" character varying NOT NULL,
                "relatedType" "file_manager_relatedtype_enum" NOT NULL DEFAULT 'na',
                "url" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_file_manager_id" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "file_manager"`);
    await queryRunner.query(`DROP TYPE "file_manager_relatedtype_enum"`);
  }
}
