import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImportTemplate1753548708240 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "import_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "entityType" character varying NOT NULL, "columns" json NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "organizationId" uuid NOT NULL, "createdBy" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_import_templates_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_templates" ADD CONSTRAINT "FK_import_templates_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_templates" ADD CONSTRAINT "FK_import_templates_creator" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "import_templates" DROP CONSTRAINT "FK_import_templates_creator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "import_templates" DROP CONSTRAINT "FK_import_templates_organization"`,
    );
    await queryRunner.query(`DROP TABLE "import_templates"`);
  }
}

