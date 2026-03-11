import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingLogs1773222976690 implements MigrationInterface {
    name = 'BookingLogs1773222976690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booking_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "changed_by_id" uuid NOT NULL, "action" character varying NOT NULL, "previous_data" jsonb, "new_data" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_63131ad20a9f304596d16926349" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."bookings_status_enum" RENAME TO "bookings_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'on_hold')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "public"."bookings_status_enum" USING "status"::"text"::"public"."bookings_status_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "booking_logs" ADD CONSTRAINT "FK_6e3a4909bc427bce3d23f4b85a1" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_logs" ADD CONSTRAINT "FK_afd3899ac84f81963ef7a5e2fc0" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_logs" DROP CONSTRAINT "FK_afd3899ac84f81963ef7a5e2fc0"`);
        await queryRunner.query(`ALTER TABLE "booking_logs" DROP CONSTRAINT "FK_6e3a4909bc427bce3d23f4b85a1"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum_old" AS ENUM('pending', 'confirmed', 'cancelled', 'completed')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "public"."bookings_status_enum_old" USING "status"::"text"::"public"."bookings_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bookings_status_enum_old" RENAME TO "bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "booking_logs"`);
    }

}
