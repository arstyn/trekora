import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1760134856843 implements MigrationInterface {
    name = 'InitMigration1760134856843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ADD "profile_photo" character varying`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "verification_document" character varying`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "verification_document_type" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."booking_checklists_type_enum" RENAME TO "booking_checklists_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."booking_checklists_type_enum" AS ENUM('individual', 'package', 'user')`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ALTER COLUMN "type" TYPE "public"."booking_checklists_type_enum" USING "type"::"text"::"public"."booking_checklists_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."booking_checklists_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."booking_checklists_type_enum_old" AS ENUM('group', 'individual', 'package', 'user')`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ALTER COLUMN "type" TYPE "public"."booking_checklists_type_enum_old" USING "type"::"text"::"public"."booking_checklists_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."booking_checklists_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."booking_checklists_type_enum_old" RENAME TO "booking_checklists_type_enum"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "verification_document_type"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "verification_document"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "profile_photo"`);
    }

}
