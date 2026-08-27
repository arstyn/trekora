import { MigrationInterface, QueryRunner } from "typeorm";

export class BatchTiersAdded1787650295093 implements MigrationInterface {
    name = 'BatchTiersAdded1787650295093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "batch_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batchId" uuid NOT NULL, "packageTierId" uuid NOT NULL, "adultCost" numeric(10,2), "childCostType" character varying, "childCostValue" numeric(10,2), "infantCostType" character varying, "infantCostValue" numeric(10,2), CONSTRAINT "PK_a2af35d8bb36acc9121507b70d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "batch_tiers" ADD CONSTRAINT "FK_ee77fae3cb65475f65e6bdbfee7" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch_tiers" ADD CONSTRAINT "FK_138353ae2f1b1f6428db450827d" FOREIGN KEY ("packageTierId") REFERENCES "package_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_tiers" DROP CONSTRAINT "FK_138353ae2f1b1f6428db450827d"`);
        await queryRunner.query(`ALTER TABLE "batch_tiers" DROP CONSTRAINT "FK_ee77fae3cb65475f65e6bdbfee7"`);
        await queryRunner.query(`DROP TABLE "batch_tiers"`);
    }

}
