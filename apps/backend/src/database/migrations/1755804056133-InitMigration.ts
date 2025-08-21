import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1755804056133 implements MigrationInterface {
    name = 'InitMigration1755804056133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_passengers" DROP CONSTRAINT "FK_c954195b2124334de7245b4e11f"`);
        await queryRunner.query(`ALTER TABLE "batch_passengers" DROP CONSTRAINT "FK_f0442b18cb1254c9f2bb48036c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0442b18cb1254c9f2bb48036c"`);
        await queryRunner.query(`ALTER TABLE "batch_passengers" RENAME COLUMN "customerId" TO "passengerId"`);
        await queryRunner.query(`ALTER TABLE "booking_passengers" DROP COLUMN "batch_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_38d13cdc0eb4787ff2f66aeb7a" ON "batch_passengers" ("passengerId") `);
        await queryRunner.query(`ALTER TABLE "batch_passengers" ADD CONSTRAINT "FK_38d13cdc0eb4787ff2f66aeb7ab" FOREIGN KEY ("passengerId") REFERENCES "booking_passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_passengers" DROP CONSTRAINT "FK_38d13cdc0eb4787ff2f66aeb7ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38d13cdc0eb4787ff2f66aeb7a"`);
        await queryRunner.query(`ALTER TABLE "booking_passengers" ADD "batch_id" uuid`);
        await queryRunner.query(`ALTER TABLE "batch_passengers" RENAME COLUMN "passengerId" TO "customerId"`);
        await queryRunner.query(`CREATE INDEX "IDX_f0442b18cb1254c9f2bb48036c" ON "batch_passengers" ("customerId") `);
        await queryRunner.query(`ALTER TABLE "batch_passengers" ADD CONSTRAINT "FK_f0442b18cb1254c9f2bb48036c9" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "booking_passengers" ADD CONSTRAINT "FK_c954195b2124334de7245b4e11f" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
