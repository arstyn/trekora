import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePreBookingTable1760200000000 implements MigrationInterface {
  name = 'CreatePreBookingTable1760200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create pre_booking_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."pre_bookings_status_enum" AS ENUM(
        'pending',
        'customer_details_pending',
        'customer_created',
        'converted_to_booking',
        'cancelled'
      )
    `);

    // Create pre_bookings table
    await queryRunner.createTable(
      new Table({
        name: 'pre_bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pre_booking_number',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'lead_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'package_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'preferred_start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'preferred_end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'number_of_travelers',
            type: 'int',
            default: 1,
          },
          {
            name: 'temporary_customer_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'booking_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pending',
              'customer_details_pending',
              'customer_created',
              'converted_to_booking',
              'cancelled',
            ],
            default: "'pending'",
          },
          {
            name: 'special_requests',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'additional_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'estimated_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
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

    // Add foreign key for lead_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['lead_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lead',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign key for package_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['package_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'packages',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign key for customer_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customer',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign key for booking_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['booking_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bookings',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign key for created_by_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for organization_id
    await queryRunner.createForeignKey(
      'pre_bookings',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('pre_bookings');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('pre_bookings', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('pre_bookings');

    // Drop enum
    await queryRunner.query(`DROP TYPE "public"."pre_bookings_status_enum"`);
  }
}
