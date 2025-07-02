import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDepartmentEntity1751467861634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "user_departments" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "user_id" uuid NULL,
                    "employee_id" uuid NULL,
                    "department_id" uuid NOT NULL,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_user_departments_id" PRIMARY KEY ("id")
                )
            `);
    
        await queryRunner.query(`
                ALTER TABLE "user_departments"
                ADD CONSTRAINT "FK_user_departments_user"
                FOREIGN KEY ("user_id")
                REFERENCES "user"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "user_departments"
                ADD CONSTRAINT "FK_user_departments_employee"
                FOREIGN KEY ("employee_id")
                REFERENCES "employee"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
    
        await queryRunner.query(`
                ALTER TABLE "user_departments"
                ADD CONSTRAINT "FK_user_departments_department"
                FOREIGN KEY ("department_id")
                REFERENCES "department"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "user_departments" DROP CONSTRAINT "FK_user_departments_department"`,
        );
        await queryRunner.query(
          `ALTER TABLE "user_departments" DROP CONSTRAINT "FK_user_departments_employee"`,
        );
        await queryRunner.query(
          `ALTER TABLE "user_departments" DROP CONSTRAINT "FK_user_departments_user"`,
        );
        await queryRunner.query(`DROP TABLE "user_departments"`);
      }
}
