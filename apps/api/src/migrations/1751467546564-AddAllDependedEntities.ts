import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllDependedEntities1751467546564 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "organization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NULL,
                "domain" varchar NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_organization_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
                CREATE TABLE "user" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" varchar NULL,
                    "organizationId" uuid NULL,
                    "email" varchar NOT NULL,
                    "phone" varchar NULL,
                    "password" varchar NULL,
                    "roleId" uuid NULL,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "is_active" boolean NOT NULL DEFAULT true,
                    CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "user" 
                ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0f" 
                FOREIGN KEY ("organizationId") 
                REFERENCES "organization"("id") 
                ON DELETE SET NULL ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "user" 
                ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" 
                FOREIGN KEY ("roleId") 
                REFERENCES "role"("id") 
                ON DELETE SET NULL ON UPDATE NO ACTION
            `);

            await queryRunner.query(`
                CREATE TYPE "public"."lead_status_enum" AS ENUM('new', 'contacted', 'qualified', 'lost', 'converted')
            `);
    
            await queryRunner.query(`
                CREATE TABLE "lead" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" varchar NOT NULL,
                    "email" varchar NULL,
                    "phone" varchar NULL,
                    "company" varchar NULL,
                    "created_by_id" uuid NULL,
                    "organization_id" uuid NOT NULL,
                    "notes" text NULL,
                    "status" "public"."lead_status_enum" NOT NULL DEFAULT 'new',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_ca96c1888f7dcfccab72ffd23d0" PRIMARY KEY ("id")
                )
            `);
    
            await queryRunner.query(`
                ALTER TABLE "lead" 
                ADD CONSTRAINT "FK_created_by_user" 
                FOREIGN KEY ("created_by_id") 
                REFERENCES "user"("id") 
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
    
            await queryRunner.query(`
                ALTER TABLE "lead" 
                ADD CONSTRAINT "FK_organization_lead" 
                FOREIGN KEY ("organization_id") 
                REFERENCES "organization"("id") 
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);

            await queryRunner.query(`
                CREATE TABLE "branch" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "organizationId" uuid NOT NULL,
                    "name" varchar NOT NULL,
                    "location" varchar NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "isActive" boolean NOT NULL DEFAULT true,
                    "managerId" uuid,
                    CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "branch"
                ADD CONSTRAINT "FK_branch_organization"
                FOREIGN KEY ("organizationId")
                REFERENCES "organization"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
            await queryRunner.query(`
                CREATE TYPE "public"."reminder_repeat_enum" AS ENUM(
                    'none',
                    'daily',
                    'weekly',
                    'monthly',
                    'yearly',
                    'custom'
                )
            `);
    
        await queryRunner.query(`
                CREATE TABLE "reminder" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "type" varchar(50) NOT NULL,
                    "entityType" varchar(50) NOT NULL,
                    "entityId" uuid NOT NULL,
                    "created_by_id" uuid NOT NULL,
                    "organization_id" uuid NOT NULL,
                    "note" text NULL,
                    "remindAt" TIMESTAMP NOT NULL,
                    "repeat" "public"."reminder_repeat_enum" NOT NULL DEFAULT 'none',
                    "repeatOptions" jsonb NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_reminder_id" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                CREATE INDEX "IDX_reminder_entity_type" ON "reminder" ("entityType")
            `);
    
        await queryRunner.query(`
                CREATE INDEX "IDX_reminder_entity_id" ON "reminder" ("entityId")
            `);
    
        await queryRunner.query(`
                ALTER TABLE "reminder"
                ADD CONSTRAINT "FK_reminder_user"
                FOREIGN KEY ("created_by_id")
                REFERENCES "user"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "reminder"
                ADD CONSTRAINT "FK_reminder_organization"
                FOREIGN KEY ("organization_id")
                REFERENCES "organization"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "organization"`);

        await queryRunner.query(
          `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
        );
        await queryRunner.query(
          `ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0f"`,
        );
        await queryRunner.query(`DROP TABLE "user"`);

        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_organization_lead"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_created_by_user"`);
        await queryRunner.query(`DROP TABLE "lead"`);
        await queryRunner.query(`DROP TYPE "public"."lead_status_enum"`);

        await queryRunner.query(
            `ALTER TABLE "branch" DROP CONSTRAINT "FK_branch_organization"`,
          );
          await queryRunner.query(`DROP TABLE "branch"`);
          await queryRunner.query(
            `ALTER TABLE "reminder" DROP CONSTRAINT "FK_reminder_organization"`,
          );
          await queryRunner.query(
            `ALTER TABLE "reminder" DROP CONSTRAINT "FK_reminder_user"`,
          );
          await queryRunner.query(`DROP INDEX "IDX_reminder_entity_id"`);
          await queryRunner.query(`DROP INDEX "IDX_reminder_entity_type"`);
          await queryRunner.query(`DROP TABLE "reminder"`);
          await queryRunner.query(`DROP TYPE "public"."reminder_repeat_enum"`);
      }

}
