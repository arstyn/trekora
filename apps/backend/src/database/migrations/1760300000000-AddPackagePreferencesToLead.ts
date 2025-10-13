import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddPackagePreferencesToLead1760300000000
  implements MigrationInterface
{
  name = 'AddPackagePreferencesToLead1760300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add preferred_package_id column
    await queryRunner.addColumn(
      'lead',
      new TableColumn({
        name: 'preferred_package_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add considered_package_ids column
    await queryRunner.addColumn(
      'lead',
      new TableColumn({
        name: 'considered_package_ids',
        type: 'json',
        isNullable: true,
      }),
    );

    // Add number_of_passengers column
    await queryRunner.addColumn(
      'lead',
      new TableColumn({
        name: 'number_of_passengers',
        type: 'int',
        default: 1,
      }),
    );

    // Add foreign key for preferred_package_id
    await queryRunner.createForeignKey(
      'lead',
      new TableForeignKey({
        columnNames: ['preferred_package_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'packages',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('lead');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('preferred_package_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('lead', foreignKey);
      }
    }

    // Drop columns
    await queryRunner.dropColumn('lead', 'number_of_passengers');
    await queryRunner.dropColumn('lead', 'considered_package_ids');
    await queryRunner.dropColumn('lead', 'preferred_package_id');
  }
}
