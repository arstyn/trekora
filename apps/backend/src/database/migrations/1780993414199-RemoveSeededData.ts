import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSeededData1780993414198 implements MigrationInterface {
  name = 'RemoveSeededData1780993414198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting migration to remove seeded organization/user data...');

    // Helper to check if table exists
    const tableExists = async (tableName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );`,
        [tableName],
      );
      return result && result[0] && result[0].exists;
    };

    // Helper to safely delete from table if it exists
    const safeDelete = async (tableName: string, query: string) => {
      const exists = await tableExists(tableName);
      if (exists) {
        try {
          await queryRunner.query(query);
          console.log(`Cleared data from table: ${tableName}`);
        } catch (err) {
          console.warn(`DELETE query failed for table ${tableName}:`, err);
          throw err; // Re-throw to fail migration if there's an actual constraint/schema error
        }
      } else {
        console.log(`Table ${tableName} does not exist, skipping...`);
      }
    };

    // 1. Delete booking payments
    await safeDelete('booking_payments', `
      DELETE FROM booking_payments 
      WHERE booking_id IN (
        SELECT id FROM bookings 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 2. Delete booking checklists
    await safeDelete('booking_checklists', `
      DELETE FROM booking_checklists 
      WHERE "bookingId" IN (
        SELECT id FROM bookings 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 3. Delete booking documents
    await safeDelete('booking_documents', `
      DELETE FROM booking_documents 
      WHERE booking_id IN (
        SELECT id FROM bookings 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 4. Delete booking logs
    await safeDelete('booking_logs', `
      DELETE FROM booking_logs 
      WHERE booking_id IN (
        SELECT id FROM bookings 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 4.5 Delete booking customers join table
    await safeDelete('booking_customers', `
      DELETE FROM booking_customers 
      WHERE "bookingId" IN (
        SELECT id FROM bookings 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 5. Delete bookings
    await safeDelete('bookings', `
      DELETE FROM bookings 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 6. Delete reminders
    await safeDelete('reminder', `
      DELETE FROM reminder 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 7. Delete workflow logs
    await safeDelete('workflow_logs', `
      DELETE FROM workflow_logs 
      WHERE workflow_id IN (
        SELECT id FROM workflows 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 8. Delete workflow steps
    await safeDelete('workflow_steps', `
      DELETE FROM workflow_steps 
      WHERE workflow_id IN (
        SELECT id FROM workflows 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 9. Delete workflows
    await safeDelete('workflows', `
      DELETE FROM workflows 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 10. Delete batch logs
    await safeDelete('batch_logs', `
      DELETE FROM batch_logs 
      WHERE batch_id IN (
        SELECT id FROM batch 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 10.5 Delete batch coordinators join table
    await safeDelete('batch_coordinators', `
      DELETE FROM batch_coordinators 
      WHERE "batchId" IN (
        SELECT id FROM batch 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 11. Delete batch
    await safeDelete('batch', `
      DELETE FROM batch 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 12. Delete user permission sets
    await safeDelete('user_permission_set', `
      DELETE FROM user_permission_set 
      WHERE employee_id IN (
        SELECT id FROM employee 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);
    await safeDelete('user_permission_set', `
      DELETE FROM user_permission_set 
      WHERE user_id IN (
        SELECT id FROM "user" 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 13. Delete permission set permissions
    await safeDelete('permission_set_permission', `
      DELETE FROM permission_set_permission 
      WHERE permission_set_id IN (
        SELECT id FROM permission_set 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 14. Delete permission sets
    await safeDelete('permission_set', `
      DELETE FROM permission_set 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 15. Delete permissions
    await safeDelete('permission', `
      DELETE FROM permission 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 16. Delete user invites
    await safeDelete('user_invite', `
      DELETE FROM user_invite 
      WHERE employee_id IN (
        SELECT id FROM employee 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 17. Delete user departments
    await safeDelete('user_departments', `
      DELETE FROM user_departments 
      WHERE employee_id IN (
        SELECT id FROM employee 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 18. Delete user notifications
    await safeDelete('user_notification', `
      DELETE FROM user_notification 
      WHERE user_id IN (
        SELECT id FROM "user" 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 19. Delete lead updates
    await safeDelete('lead_update', `
      DELETE FROM lead_update 
      WHERE lead_id IN (
        SELECT id FROM lead 
        WHERE organization_id IN (
          SELECT id FROM organization 
          WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
        )
      )
    `);

    // 20. Delete leads
    await safeDelete('lead', `
      DELETE FROM lead 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 21. Delete customers
    await safeDelete('customer', `
      DELETE FROM customer 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 22. Delete package relations
    const packageTables = [
      'inclusions', 'exclusions', 'payment_milestones',
      'cancellation_tiers', 'cancellation_policies', 'document_requirements',
      'checklist_items', 'meals_breakdowns', 'transportations',
      'package_locations', 'package_activities', 'itinerary_days'
    ];
    for (const tbl of packageTables) {
      const pkgCol = tbl === 'package_activities' ? 'package_id' : '"packageId"';
      await safeDelete(tbl, `
        DELETE FROM ${tbl} 
        WHERE ${pkgCol} IN (
          SELECT id FROM packages 
          WHERE "organizationId" IN (
            SELECT id FROM organization 
            WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
          )
        )
      `);
    }

    // 23. Delete packages
    await safeDelete('packages', `
      DELETE FROM packages 
      WHERE "organizationId" IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 24. Delete employees
    await safeDelete('employee', `
      DELETE FROM employee 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 25. Delete users
    await safeDelete('user', `
      DELETE FROM "user" 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 26. Delete branches
    await safeDelete('branch', `
      DELETE FROM branch 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 27. Delete import history & templates & logs
    await safeDelete('import_history', `
      DELETE FROM import_history 
      WHERE "organizationId" IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);
    await safeDelete('import_templates', `
      DELETE FROM import_templates 
      WHERE "organizationId" IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);
    await safeDelete('activity_logs', `
      DELETE FROM activity_logs 
      WHERE organization_id IN (
        SELECT id FROM organization 
        WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com')
      )
    `);

    // 28. Delete organizations
    await safeDelete('organization', `
      DELETE FROM organization 
      WHERE domain IN ('acme.com', 'globex.co', 'initech.org', 'umbrella.com');
    `);

    console.log('Migration completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Down migration for RemoveSeededData is a no-op.');
  }
}
