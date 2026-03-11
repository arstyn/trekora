import { MigrationInterface, QueryRunner } from "typeorm";

export class BatchLogsAdded1773229811748 implements MigrationInterface {
    name = 'BatchLogsAdded1773229811748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "batch_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batch_id" uuid NOT NULL, "changed_by_id" uuid NOT NULL, "action" character varying NOT NULL, "previous_data" jsonb, "new_data" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03bde82516a7ae3896f16baae19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "batch_logs" ADD CONSTRAINT "FK_4fc9f5038a5303bc2c7b20811a2" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch_logs" ADD CONSTRAINT "FK_d2558cb9b51ef85b67dbd46493d" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_logs" DROP CONSTRAINT "FK_d2558cb9b51ef85b67dbd46493d"`);
        await queryRunner.query(`ALTER TABLE "batch_logs" DROP CONSTRAINT "FK_4fc9f5038a5303bc2c7b20811a2"`);
        await queryRunner.query(`DROP TABLE "batch_logs"`);
    }

}
