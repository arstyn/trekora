import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImportHistory1753600601000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "import_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "success" boolean NOT NULL, "totalRows" integer NOT NULL, "importedRows" integer NOT NULL, "failedRows" integer NOT NULL, "errors" json NOT NULL, "message" text NOT NULL, "entityType" character varying NOT NULL, "fileName" character varying, "organizationId" uuid NOT NULL, "createdBy" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_import_history_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_history" ADD CONSTRAINT "FK_import_history_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_history" ADD CONSTRAINT "FK_import_history_creator" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "import_history" DROP CONSTRAINT "FK_import_history_creator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_history" DROP CONSTRAINT "FK_import_history_organization"`,
    );
    await queryRunner.query(`DROP TABLE "import_history"`);
  }
} 