import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPackageSetupType1783922203294 implements MigrationInterface {
    name = 'AddPackageSetupType1783922203294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."packages_packagesetup_enum" AS ENUM('normal', 'advanced')`);
        await queryRunner.query(`ALTER TABLE "packages" ADD "packageSetup" "public"."packages_packagesetup_enum" DEFAULT 'advanced'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "packageSetup"`);
        await queryRunner.query(`DROP TYPE "public"."packages_packagesetup_enum"`);
    }
}
