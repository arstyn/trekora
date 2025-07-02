import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeEntity1751467834009 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TYPE "public"."employee_status_enum" AS ENUM(
                    'active',
                    'inactive',
                    'suspended',
                    'terminated'
                )
            `);
    
        await queryRunner.query(`
                CREATE TABLE "employee" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "userId" uuid NULL,
                    "branchId" uuid NULL,
                    "organizationId" uuid NOT NULL,
                    "roleId" uuid NULL,
                    "name" varchar NOT NULL,
                    "address" varchar NULL,
                    "phoneNumber" varchar NULL,
                    "email" varchar NULL,
                    "dateOfBirth" date NULL,
                    "gender" varchar NULL,
                    "nationality" varchar NULL,
                    "maritalStatus" varchar NULL,
                    "joinDate" date NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "isActive" boolean NOT NULL DEFAULT true,
                    "status" "public"."employee_status_enum" NOT NULL DEFAULT 'active',
                    CONSTRAINT "PK_employee_id" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "employee"
                ADD CONSTRAINT "FK_employee_user"
                FOREIGN KEY ("userId")
                REFERENCES "user"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "employee"
                ADD CONSTRAINT "FK_employee_branch"
                FOREIGN KEY ("branchId")
                REFERENCES "branch"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "employee"
                ADD CONSTRAINT "FK_employee_organization"
                FOREIGN KEY ("organizationId")
                REFERENCES "organization"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "employee"
                ADD CONSTRAINT "FK_employee_role"
                FOREIGN KEY ("roleId")
                REFERENCES "role"("id")
                ON DELETE SET NULL ON UPDATE NO ACTION
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_role"`,
        );
        await queryRunner.query(
          `ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_organization"`,
        );
        await queryRunner.query(
          `ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_branch"`,
        );
        await queryRunner.query(
          `ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_user"`,
        );
        await queryRunner.query(`DROP TABLE "employee"`);
        await queryRunner.query(`DROP TYPE "public"."employee_status_enum"`);
      }

}
