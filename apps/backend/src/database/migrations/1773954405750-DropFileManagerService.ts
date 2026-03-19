import { MigrationInterface, QueryRunner } from "typeorm";

export class DropFileManagerService1773954405750 implements MigrationInterface {
    name = 'DropFileManagerService1773954405750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profile_photo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_photo"`);
    }

}
