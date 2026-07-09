import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingCustomerEntity1783627946253 implements MigrationInterface {
    name = 'AddBookingCustomerEntity1783627946253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "FK_3dd2ad68df60cc1668746abc624"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "FK_19d99245b1692b29e2b33b1c18d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3dd2ad68df60cc1668746abc62"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19d99245b1692b29e2b33b1c18"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "PK_c68fb1f1f28d50996addf4dae26"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "PK_19d99245b1692b29e2b33b1c18d" PRIMARY KEY ("customerId")`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "bookingId"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "PK_19d99245b1692b29e2b33b1c18d"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "PK_8636c5570eab54dd71e73d4edd9" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "booking_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "customer_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "package_tier_id" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."booking_customers_age_category_enum" AS ENUM('adult', 'child', 'infant')`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "age_category" "public"."booking_customers_age_category_enum" NOT NULL DEFAULT 'adult'`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "FK_5659f500b267f6be9ce5a372f03" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "FK_25ed37293d7be8f9b247264fd77" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "FK_3b629012caf223abdb87ae909ba" FOREIGN KEY ("package_tier_id") REFERENCES "package_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "FK_3b629012caf223abdb87ae909ba"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "FK_25ed37293d7be8f9b247264fd77"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "FK_5659f500b267f6be9ce5a372f03"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "age_category"`);
        await queryRunner.query(`DROP TYPE "public"."booking_customers_age_category_enum"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "package_tier_id"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "customer_id"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "booking_id"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "PK_8636c5570eab54dd71e73d4edd9"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "customerId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "PK_19d99245b1692b29e2b33b1c18d" PRIMARY KEY ("customerId")`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD "bookingId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_customers" DROP CONSTRAINT "PK_19d99245b1692b29e2b33b1c18d"`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "PK_c68fb1f1f28d50996addf4dae26" PRIMARY KEY ("bookingId", "customerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_19d99245b1692b29e2b33b1c18" ON "booking_customers" ("customerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3dd2ad68df60cc1668746abc62" ON "booking_customers" ("bookingId") `);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "FK_19d99245b1692b29e2b33b1c18d" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "booking_customers" ADD CONSTRAINT "FK_3dd2ad68df60cc1668746abc624" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
