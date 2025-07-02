import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeadUpdateEntity1751467948289 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TYPE "public"."lead_update_type_enum" AS ENUM(
                    'note',
                    'status_change',
                    'email',
                    'call',
                    'meeting'
                )
            `);
    
        await queryRunner.query(`
                CREATE TABLE "lead_update" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "text" text NOT NULL,
                    "lead_id" uuid NOT NULL,
                    "created_by_id" uuid NOT NULL,
                    "type" "public"."lead_update_type_enum" NOT NULL DEFAULT 'note',
                    "metadata" jsonb NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_lead_update_id" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "lead_update"
                ADD CONSTRAINT "FK_lead_update_lead"
                FOREIGN KEY ("lead_id")
                REFERENCES "lead"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "lead_update"
                ADD CONSTRAINT "FK_lead_update_user"
                FOREIGN KEY ("created_by_id")
                REFERENCES "user"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "lead_update" DROP CONSTRAINT "FK_lead_update_user"`,
        );
        await queryRunner.query(
          `ALTER TABLE "lead_update" DROP CONSTRAINT "FK_lead_update_lead"`,
        );
        await queryRunner.query(`DROP TABLE "lead_update"`);
        await queryRunner.query(`DROP TYPE "public"."lead_update_type_enum"`);
      }

}
