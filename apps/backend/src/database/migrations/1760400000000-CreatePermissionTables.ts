import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePermissionTables1760400000000 implements MigrationInterface {
  name = 'CreatePermissionTables1760400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permission table
    await queryRunner.createTable(
      new Table({
        name: 'permission',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'resource',
            type: 'varchar',
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create permission_set table
    await queryRunner.createTable(
      new Table({
        name: 'permission_set',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'organization_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key for permission_set.organization_id
    await queryRunner.createForeignKey(
      'permission_set',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'CASCADE',
      }),
    );

    // Create permission_set_permission junction table
    await queryRunner.createTable(
      new Table({
        name: 'permission_set_permission',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'permission_set_id',
            type: 'uuid',
          },
          {
            name: 'permission_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for permission_set_permission
    await queryRunner.createForeignKey(
      'permission_set_permission',
      new TableForeignKey({
        columnNames: ['permission_set_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permission_set',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'permission_set_permission',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permission',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for permission_set_permission
    await queryRunner.createIndex(
      'permission_set_permission',
      new TableIndex({
        name: 'IDX_permission_set_permission_permission_set_id',
        columnNames: ['permission_set_id'],
      }),
    );

    await queryRunner.createIndex(
      'permission_set_permission',
      new TableIndex({
        name: 'IDX_permission_set_permission_permission_id',
        columnNames: ['permission_id'],
      }),
    );

    // Create user_permission_set table
    await queryRunner.createTable(
      new Table({
        name: 'user_permission_set',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'permission_set_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'employee_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for user_permission_set
    await queryRunner.createForeignKey(
      'user_permission_set',
      new TableForeignKey({
        columnNames: ['permission_set_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permission_set',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_permission_set',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_permission_set',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employee',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for user_permission_set
    await queryRunner.createIndex(
      'user_permission_set',
      new TableIndex({
        name: 'IDX_user_permission_set_permission_set_id',
        columnNames: ['permission_set_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_permission_set',
      new TableIndex({
        name: 'IDX_user_permission_set_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_permission_set',
      new TableIndex({
        name: 'IDX_user_permission_set_employee_id',
        columnNames: ['employee_id'],
      }),
    );

    // Note: Permission seeding and default permission set creation
    // is handled in the seed.ts file and during organization creation in AuthService.
    // Migration only creates the table structure.
    // To seed permissions and create default permission sets, run the seed script
    // or let them be created automatically when new organizations are created.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop user_permission_set table (includes foreign keys and indexes)
    await queryRunner.dropTable('user_permission_set');

    // Drop permission_set_permission table (includes foreign keys and indexes)
    await queryRunner.dropTable('permission_set_permission');

    // Drop permission_set table (includes foreign key)
    await queryRunner.dropTable('permission_set');

    // Drop permission table
    await queryRunner.dropTable('permission');
  }
}
