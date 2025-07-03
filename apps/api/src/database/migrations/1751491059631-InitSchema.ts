import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1751491059631 implements MigrationInterface {
    name = 'InitSchema1751491059631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "domain" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "organization_id" uuid, "email" character varying NOT NULL, "phone" character varying, "password" character varying, "role_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "location" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employee_status_enum" AS ENUM('active', 'inactive', 'suspended', 'terminated')`);
        await queryRunner.query(`CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "branch_id" uuid, "organization_id" uuid NOT NULL, "role_id" uuid, "name" character varying NOT NULL, "address" character varying, "phone" character varying, "email" character varying, "date_of_birth" date, "gender" character varying, "nationality" character varying, "marital_status" character varying, "join_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "status" "public"."employee_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "employee_id" uuid, "department_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca8d1bbbf9bb49c79c706807fae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "message" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "reminder_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_repeat_enum" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')`);
        await queryRunner.query(`CREATE TABLE "reminder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(50) NOT NULL, "entity_type" character varying(50) NOT NULL, "entity_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "note" text, "remind_at" TIMESTAMP NOT NULL, "repeat" "public"."reminder_repeat_enum" NOT NULL DEFAULT 'none', "repeat_options" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9ec029d17cb8dece186b9221ede" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71eb306b6f361e548572b1cf32" ON "reminder" ("entity_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_1b09a69ba1d35c67f008ff69ca" ON "reminder" ("entity_id") `);
        await queryRunner.query(`CREATE TABLE "lead" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "phone" character varying, "company" character varying, "created_by_id" uuid, "organization_id" uuid NOT NULL, "notes" text, "status" character varying NOT NULL DEFAULT 'new', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca96c1888f7dcfccab72b72fffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lead_update" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "lead_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "type" character varying(50) NOT NULL DEFAULT 'note', "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_04fa22daae3c13ddc69c15ede82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "employee_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8108c55aa759aab27050cc06607" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."customer_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, "status" "public"."customer_status_enum" NOT NULL DEFAULT 'pending', "notes" character varying, CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_a27353d4f78d3765b534463de70" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_f61258e58ed35475ce1dba03797" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_380241ef3c0ea0a87b9411f37ff" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_b5b0a5f2ddc7062bbdded584a14" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_1c105b756816efbdeae09a9ab65" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_departments" ADD CONSTRAINT "FK_78098f9a7c51985e96b5326bca9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_departments" ADD CONSTRAINT "FK_31db222d574c619841ba287f38c" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_departments" ADD CONSTRAINT "FK_f10514cebc5e624f08c1b558081" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminder" ADD CONSTRAINT "FK_e14c17d6003eb7b57ba292a905b" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminder" ADD CONSTRAINT "FK_234994333887746bb8e9da50227" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead" ADD CONSTRAINT "FK_b53c58ebaa79dd4b8a611c7c42f" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead" ADD CONSTRAINT "FK_c2264888ac9339b12768d966da8" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead_update" ADD CONSTRAINT "FK_600b267449fad40e0f135205afe" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead_update" ADD CONSTRAINT "FK_9d8412bb9cbbac67083cdb121b1" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_invite" ADD CONSTRAINT "FK_139c9176bc718b9e836851652a0" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_invite" DROP CONSTRAINT "FK_139c9176bc718b9e836851652a0"`);
        await queryRunner.query(`ALTER TABLE "lead_update" DROP CONSTRAINT "FK_9d8412bb9cbbac67083cdb121b1"`);
        await queryRunner.query(`ALTER TABLE "lead_update" DROP CONSTRAINT "FK_600b267449fad40e0f135205afe"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_c2264888ac9339b12768d966da8"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP CONSTRAINT "FK_b53c58ebaa79dd4b8a611c7c42f"`);
        await queryRunner.query(`ALTER TABLE "reminder" DROP CONSTRAINT "FK_234994333887746bb8e9da50227"`);
        await queryRunner.query(`ALTER TABLE "reminder" DROP CONSTRAINT "FK_e14c17d6003eb7b57ba292a905b"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`ALTER TABLE "user_departments" DROP CONSTRAINT "FK_f10514cebc5e624f08c1b558081"`);
        await queryRunner.query(`ALTER TABLE "user_departments" DROP CONSTRAINT "FK_31db222d574c619841ba287f38c"`);
        await queryRunner.query(`ALTER TABLE "user_departments" DROP CONSTRAINT "FK_78098f9a7c51985e96b5326bca9"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_1c105b756816efbdeae09a9ab65"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_b5b0a5f2ddc7062bbdded584a14"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_380241ef3c0ea0a87b9411f37ff"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_f61258e58ed35475ce1dba03797"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_a27353d4f78d3765b534463de70"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TYPE "public"."customer_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_invite"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "lead_update"`);
        await queryRunner.query(`DROP TABLE "lead"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b09a69ba1d35c67f008ff69ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71eb306b6f361e548572b1cf32"`);
        await queryRunner.query(`DROP TABLE "reminder"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_repeat_enum"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "user_departments"`);
        await queryRunner.query(`DROP TABLE "employee"`);
        await queryRunner.query(`DROP TYPE "public"."employee_status_enum"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`DROP TABLE "department"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "organization"`);
    }

}
