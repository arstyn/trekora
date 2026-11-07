import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalaryAndLeaveManagement1790000000000 implements MigrationInterface {
  name = 'AddSalaryAndLeaveManagement1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add salary slip design columns to organization table
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "salary_slip_color" character varying DEFAULT '#2563eb'`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "salary_slip_logo" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "salary_slip_seal" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "salary_slip_fields" jsonb`,
    );

    // 2. Create enums for salary and leave if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_salary_status_enum') THEN
          CREATE TYPE "employee_salary_status_enum" AS ENUM ('draft', 'processed', 'paid');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_leave_leave_type_enum') THEN
          CREATE TYPE "employee_leave_leave_type_enum" AS ENUM ('casual', 'sick', 'paid', 'unpaid');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_leave_status_enum') THEN
          CREATE TYPE "employee_leave_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
        END IF;
      END $$;
    `);

    // 3. Create employee_salary_structure table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_salary_structure" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "employee_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "basic_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "hra" numeric(12,2) NOT NULL DEFAULT 0,
        "da" numeric(12,2) NOT NULL DEFAULT 0,
        "conveyance_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "medical_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "special_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "pf_employee" numeric(12,2) NOT NULL DEFAULT 0,
        "pf_employer" numeric(12,2) NOT NULL DEFAULT 0,
        "esi" numeric(12,2) NOT NULL DEFAULT 0,
        "professional_tax" numeric(12,2) NOT NULL DEFAULT 0,
        "tds" numeric(12,2) NOT NULL DEFAULT 0,
        "pan_number" character varying,
        "uan_number" character varying,
        "pf_number" character varying,
        "esi_number" character varying,
        "bank_name" character varying,
        "account_number" character varying,
        "ifsc_code" character varying,
        "casual_leave_quota" integer,
        "sick_leave_quota" integer,
        "paid_leave_quota" integer,
        "updated_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_salary_structure" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employee_salary_structure_employee" UNIQUE ("employee_id"),
        CONSTRAINT "FK_ess_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ess_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ess_updated_by" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);

    // 4. Create employee_salary table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_salary" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slip_number" character varying NOT NULL,
        "employee_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "total_working_days" numeric(5,1) NOT NULL DEFAULT 30,
        "days_worked" numeric(5,1) NOT NULL DEFAULT 30,
        "paid_leaves" numeric(5,1) NOT NULL DEFAULT 0,
        "unpaid_leaves" numeric(5,1) NOT NULL DEFAULT 0,
        "payable_days" numeric(5,1) NOT NULL DEFAULT 30,
        "basic_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "hra" numeric(12,2) NOT NULL DEFAULT 0,
        "da" numeric(12,2) NOT NULL DEFAULT 0,
        "conveyance_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "medical_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "special_allowance" numeric(12,2) NOT NULL DEFAULT 0,
        "additional_incentive" numeric(12,2) NOT NULL DEFAULT 0,
        "incentive_note" character varying,
        "other_earnings" numeric(12,2) NOT NULL DEFAULT 0,
        "gross_earnings" numeric(12,2) NOT NULL DEFAULT 0,
        "pf_deduction" numeric(12,2) NOT NULL DEFAULT 0,
        "esi_deduction" numeric(12,2) NOT NULL DEFAULT 0,
        "professional_tax" numeric(12,2) NOT NULL DEFAULT 0,
        "tds_deduction" numeric(12,2) NOT NULL DEFAULT 0,
        "lop_deduction" numeric(12,2) NOT NULL DEFAULT 0,
        "other_deductions" numeric(12,2) NOT NULL DEFAULT 0,
        "total_deductions" numeric(12,2) NOT NULL DEFAULT 0,
        "net_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "status" "employee_salary_status_enum" NOT NULL DEFAULT 'draft',
        "payment_date" date,
        "payment_method" character varying,
        "payment_reference" character varying,
        "email_sent_at" TIMESTAMP,
        "email_sent_count" integer NOT NULL DEFAULT 0,
        "remarks" text,
        "created_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_salary" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employee_salary_slip_number" UNIQUE ("slip_number"),
        CONSTRAINT "FK_es_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_es_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_es_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);

    // 5. Create employee_leave table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_leave" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leave_number" character varying NOT NULL,
        "employee_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "leave_type" "employee_leave_leave_type_enum" NOT NULL DEFAULT 'casual',
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_half_day" boolean NOT NULL DEFAULT false,
        "total_days" numeric(4,1) NOT NULL DEFAULT 1,
        "reason" text NOT NULL,
        "status" "employee_leave_status_enum" NOT NULL DEFAULT 'pending',
        "reviewed_by_id" uuid,
        "reviewed_at" TIMESTAMP,
        "review_note" text,
        "created_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_leave" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employee_leave_leave_number" UNIQUE ("leave_number"),
        CONSTRAINT "FK_el_employee" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_el_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_el_reviewed_by" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_el_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_leave"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_salary"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_salary_structure"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_leave_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_leave_leave_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_salary_status_enum"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "salary_slip_fields"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "salary_slip_seal"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "salary_slip_logo"`);
    await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN IF EXISTS "salary_slip_color"`);
  }
}

