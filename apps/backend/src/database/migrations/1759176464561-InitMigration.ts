import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1759176464561 implements MigrationInterface {
    name = 'InitMigration1759176464561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."customer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "first_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "last_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "middle_name" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "date_of_birth" date NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."customer_gender_enum" AS ENUM('male', 'female', 'other', 'prefer_not_to_say')`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "gender" "public"."customer_gender_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "profile_photo" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "alternative_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "emergency_contact_name" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "emergency_contact_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "emergency_contact_relation" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "passport_number" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "passport_expiry_date" date`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "passport_issue_date" date`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "passport_country" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "passport_photos" json`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "voter_id" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "voter_id_photos" json`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "aadhaar_id" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "aadhaar_id_photos" json`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "relatives" json`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "dietary_restrictions" text`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "medical_conditions" text`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "special_requests" text`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "notes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "notes" character varying`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "special_requests"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "medical_conditions"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "dietary_restrictions"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "relatives"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "aadhaar_id_photos"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "aadhaar_id"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "voter_id_photos"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "voter_id"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "passport_photos"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "passport_country"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "passport_issue_date"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "passport_expiry_date"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "passport_number"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "emergency_contact_relation"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "emergency_contact_phone"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "emergency_contact_name"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "alternative_phone"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "profile_photo"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."customer_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "middle_name"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."customer_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "status" "public"."customer_status_enum" NOT NULL DEFAULT 'pending'`);
    }

}
