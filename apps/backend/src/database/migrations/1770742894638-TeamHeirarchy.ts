import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamHeirarchy1770742894638 implements MigrationInterface {
    name = 'TeamHeirarchy1770742894638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_3868861951354ee06a090828fc3"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_4f7ae63a0f3bb9e369518dfcb8a"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_f34983052d01f4ad10eec904140"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_a0bc5273b3b7a9ee45608ad78ca"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_dbfcf9a2a39bbb47688d56fd5ea"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_d59256a333e02ca76fccaceac3a"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_b70ebc0f30d3bf4af5294f2e9a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_permission_set_permission_permission_set_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_permission_set_permission_permission_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_permission_set_permission_set_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_permission_set_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_permission_set_employee_id"`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "manager_id" uuid`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_4460baf94b8a9e2d60510f4f52b" FOREIGN KEY ("manager_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead" ADD CONSTRAINT "FK_3868861951354ee06a090828fc3" FOREIGN KEY ("preferred_package_id") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_4f7ae63a0f3bb9e369518dfcb8a" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_f34983052d01f4ad10eec904140" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_a0bc5273b3b7a9ee45608ad78ca" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_dbfcf9a2a39bbb47688d56fd5ea" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_d59256a333e02ca76fccaceac3a" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_b70ebc0f30d3bf4af5294f2e9a2" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_b70ebc0f30d3bf4af5294f2e9a2"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_d59256a333e02ca76fccaceac3a"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_dbfcf9a2a39bbb47688d56fd5ea"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_a0bc5273b3b7a9ee45608ad78ca"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_f34983052d01f4ad10eec904140"`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" DROP CONSTRAINT "FK_4f7ae63a0f3bb9e369518dfcb8a"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_3868861951354ee06a090828fc3"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_4460baf94b8a9e2d60510f4f52b"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "manager_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_user_permission_set_employee_id" ON "user_permission_set" ("employee_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_permission_set_user_id" ON "user_permission_set" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_permission_set_permission_set_id" ON "user_permission_set" ("permission_set_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_permission_set_permission_permission_id" ON "permission_set_permission" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_permission_set_permission_permission_set_id" ON "permission_set_permission" ("permission_set_id") `);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_b70ebc0f30d3bf4af5294f2e9a2" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_d59256a333e02ca76fccaceac3a" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_dbfcf9a2a39bbb47688d56fd5ea" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_a0bc5273b3b7a9ee45608ad78ca" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_f34983052d01f4ad10eec904140" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pre_bookings" ADD CONSTRAINT "FK_4f7ae63a0f3bb9e369518dfcb8a" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead" ADD CONSTRAINT "FK_3868861951354ee06a090828fc3" FOREIGN KEY ("preferred_package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
