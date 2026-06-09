import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPendingActivationStatus1780993414197 implements MigrationInterface {
    name = 'AddPendingActivationStatus1780993414197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."employee_status_enum" RENAME TO "employee_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."employee_status_enum" AS ENUM('active', 'inactive', 'suspended', 'terminated', 'pending_activation')`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" TYPE "public"."employee_status_enum" USING "status"::"text"::"public"."employee_status_enum"`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."employee_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_status_enum_old" AS ENUM('active', 'inactive', 'suspended', 'terminated')`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" TYPE "public"."employee_status_enum_old" USING "status"::"text"::"public"."employee_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."employee_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."employee_status_enum_old" RENAME TO "employee_status_enum"`);
    }

}
