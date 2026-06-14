import { MigrationInterface, QueryRunner } from "typeorm";

export class PackageUpdates1781394933244 implements MigrationInterface {
    name = 'PackageUpdates1781394933244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "additional_costs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "cost" numeric(10,2), "packageId" uuid, CONSTRAINT "PK_e7bc9a84c07310c318351a1d0fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "package_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "adultCost" numeric(10,2), "childCostType" character varying, "childCostValue" numeric(10,2), "infantCostType" character varying, "infantCostValue" numeric(10,2), "packageId" uuid, CONSTRAINT "PK_0516b52746492d947bd9e283aee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transportation_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying, "details" character varying, "cost" numeric(10,2), "packageId" uuid, CONSTRAINT "PK_595074907f29bd1989ec38b57f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "package_locations" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "package_locations" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD "activitiesCostType" character varying`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD "activitiesTotalCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD "accommodationCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" ADD "mealsCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "package_locations" ADD "countries" text`);
        await queryRunner.query(`ALTER TABLE "package_locations" ADD "states" text`);
        await queryRunner.query(`ALTER TABLE "package_locations" ADD "cities" text`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "days" integer`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "nights" integer`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "basePrice" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP COLUMN "activities"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD "activities" jsonb`);
        await queryRunner.query(`ALTER TABLE "additional_costs" ADD CONSTRAINT "FK_59e840fb2838a6a6538897d2987" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "package_tiers" ADD CONSTRAINT "FK_ebe8cdf8d2ad95083602e17fab7" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transportation_options" ADD CONSTRAINT "FK_f56cd77f57b54eeeb764ef0c4b4" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transportation_options" DROP CONSTRAINT "FK_f56cd77f57b54eeeb764ef0c4b4"`);
        await queryRunner.query(`ALTER TABLE "package_tiers" DROP CONSTRAINT "FK_ebe8cdf8d2ad95083602e17fab7"`);
        await queryRunner.query(`ALTER TABLE "additional_costs" DROP CONSTRAINT "FK_59e840fb2838a6a6538897d2987"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP COLUMN "activities"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD "activities" text`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "basePrice"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "nights"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "days"`);
        await queryRunner.query(`ALTER TABLE "package_locations" DROP COLUMN "cities"`);
        await queryRunner.query(`ALTER TABLE "package_locations" DROP COLUMN "states"`);
        await queryRunner.query(`ALTER TABLE "package_locations" DROP COLUMN "countries"`);
        await queryRunner.query(`ALTER TABLE "meals_breakdowns" DROP COLUMN "mealsCost"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP COLUMN "accommodationCost"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP COLUMN "activitiesTotalCost"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP COLUMN "activitiesCostType"`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "duration" character varying`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "price" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "package_locations" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "package_locations" ADD "country" character varying`);
        await queryRunner.query(`DROP TABLE "transportation_options"`);
        await queryRunner.query(`DROP TABLE "package_tiers"`);
        await queryRunner.query(`DROP TABLE "additional_costs"`);
    }

}
