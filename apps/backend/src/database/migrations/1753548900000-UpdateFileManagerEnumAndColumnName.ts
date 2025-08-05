import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFileManagerEnumAndColumnName1753548900000 implements MigrationInterface {
  name = 'UpdateFileManagerEnumAndColumnName1753548900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'payment' to the existing enum
    await queryRunner.query(
      `ALTER TYPE "file_manager_relatedtype_enum" ADD VALUE 'payment'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values directly
    // You would need to recreate the enum type to remove 'payment'
    // For production, consider keeping the value and handling it in application logic
    
    // Create new enum without 'payment'
    await queryRunner.query(
      `CREATE TYPE "file_manager_relatedtype_enum_old" AS ENUM ('na', 'package', 'customer', 'employee', 'department', 'organization', 'user', 'itinerary', 'lead', 'lead-updates')`
    );

    // Update column to use new enum (this will fail if 'payment' values exist)
    await queryRunner.query(
      `ALTER TABLE "file_manager" ALTER COLUMN "related_type" TYPE "file_manager_relatedtype_enum_old" USING "related_type"::text::"file_manager_relatedtype_enum_old"`
    );

    // Drop old enum and rename new one
    await queryRunner.query(`DROP TYPE "file_manager_relatedtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "file_manager_relatedtype_enum_old" RENAME TO "file_manager_relatedtype_enum"`
    );
  }
} 