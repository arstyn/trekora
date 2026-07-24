import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePackageBasePrice1783922203295 implements MigrationInterface {
    name = 'RemovePackageBasePrice1783922203295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "basePrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "packages" ADD "basePrice" numeric(10,2)`);
    }
}
