import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPackageTierToBooking1783624751946 implements MigrationInterface {
    name = 'AddPackageTierToBooking1783624751946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_meals_created_by"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_meals_organization"`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_659c97bca215479d341e44096ec"`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" DROP CONSTRAINT "FK_02902f259dcee9e5c8f44aeb162"`);
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" DROP COLUMN "meal_id"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "package_tier_id" uuid`);
        await queryRunner.query(`ALTER TABLE "permission" DROP CONSTRAINT "UQ_240853a0c3353c25fb12434ad33"`);
        await queryRunner.query(`ALTER TABLE "permission" ADD CONSTRAINT "UQ_2b787b6d508de6a6a5d577c584c" UNIQUE ("name", "organization_id")`);
        await queryRunner.query(`ALTER TABLE "permission_set" ADD CONSTRAINT "UQ_ee45ba691f341c7557e2a64ada8" UNIQUE ("name", "organization_id")`);
        await queryRunner.query(`ALTER TABLE "permission" ADD CONSTRAINT "FK_f077ce62a1c57b6a0ef67ab101a" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_e7134b736361dae658037b27d4a" FOREIGN KEY ("package_tier_id") REFERENCES "package_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_ad11b891a6866f0b04543a8dcc5" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_fb70bb9db872adcc5efa5539aea" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_fb70bb9db872adcc5efa5539aea"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_ad11b891a6866f0b04543a8dcc5"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_e7134b736361dae658037b27d4a"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP CONSTRAINT "FK_f077ce62a1c57b6a0ef67ab101a"`);
        await queryRunner.query(`ALTER TABLE "permission_set" DROP CONSTRAINT "UQ_ee45ba691f341c7557e2a64ada8"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP CONSTRAINT "UQ_2b787b6d508de6a6a5d577c584c"`);
        await queryRunner.query(`ALTER TABLE "permission" ADD CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "package_tier_id"`);
        await queryRunner.query(`ALTER TABLE "meals" ADD "type" character varying NOT NULL DEFAULT 'veg'`);
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" ADD "meal_id" uuid`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_02902f259dcee9e5c8f44aeb162" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_checklists" ADD CONSTRAINT "FK_659c97bca215479d341e44096ec" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_meals_organization" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_meals_created_by" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
