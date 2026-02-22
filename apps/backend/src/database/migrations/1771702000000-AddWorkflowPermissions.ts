import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkflowPermissions1771702000000 implements MigrationInterface {
  name = 'AddWorkflowPermissions1771702000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Get all organizations
    const organizations = await queryRunner.query(
      'SELECT id FROM "organization"',
    );

    const workflowPermissions = [
      {
        name: 'workflow.create',
        resource: 'workflow',
        action: 'create',
        description: 'Create new workflows',
      },
      {
        name: 'workflow.read',
        resource: 'workflow',
        action: 'read',
        description: 'View workflows',
      },
      {
        name: 'workflow.update',
        resource: 'workflow',
        action: 'update',
        description: 'Update existing workflows',
      },
      {
        name: 'workflow.delete',
        resource: 'workflow',
        action: 'delete',
        description: 'Delete workflows',
      },
      {
        name: 'workflow.view',
        resource: 'workflow',
        action: 'view',
        description: 'View workflow details',
      },
    ];

    for (const org of organizations) {
      const orgId = org.id;

      // 2. Insert permissions for this organization
      for (const perm of workflowPermissions) {
        // Double check if already exists to avoid duplicates
        const existingPerm = await queryRunner.query(
          'SELECT id FROM "permission" WHERE name = $1 AND organization_id = $2',
          [perm.name, orgId],
        );

        let permId: string;
        if (existingPerm.length === 0) {
          const insertResult = await queryRunner.query(
            `INSERT INTO "permission" (name, resource, action, description, organization_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [perm.name, perm.resource, perm.action, perm.description, orgId],
          );
          permId = insertResult[0].id;
        } else {
          permId = existingPerm[0].id;
        }

        // 3. Assign all workflow permissions to "Admin - Full Access" permission set
        const adminSets = await queryRunner.query(
          'SELECT id FROM "permission_set" WHERE name = $1 AND organization_id = $2',
          ['Admin - Full Access', orgId],
        );

        for (const set of adminSets) {
          const existingMapping = await queryRunner.query(
            'SELECT id FROM "permission_set_permission" WHERE permission_set_id = $1 AND permission_id = $2',
            [set.id, permId],
          );

          if (existingMapping.length === 0) {
            await queryRunner.query(
              'INSERT INTO "permission_set_permission" (permission_set_id, permission_id) VALUES ($1, $2)',
              [set.id, permId],
            );
          }
        }

        // 4. Assign read/update/view permissions to "General Manager" and "Booking Manager"
        if (
          ['workflow.read', 'workflow.update', 'workflow.view'].includes(
            perm.name,
          )
        ) {
          const otherSets = await queryRunner.query(
            'SELECT id FROM "permission_set" WHERE name IN ($1, $2, $3, $4) AND organization_id = $5',
            [
              'General Manager',
              'Booking Manager',
              'Operations Manager',
              'Employee - Basic Access',
              orgId,
            ],
          );

          for (const set of otherSets) {
            const existingMapping = await queryRunner.query(
              'SELECT id FROM "permission_set_permission" WHERE permission_set_id = $1 AND permission_id = $2',
              [set.id, permId],
            );

            if (existingMapping.length === 0) {
              await queryRunner.query(
                'INSERT INTO "permission_set_permission" (permission_set_id, permission_id) VALUES ($1, $2)',
                [set.id, permId],
              );
            }
          }
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // We don't usually delete permissions in down migration if they might be used,
    // but for completeness we could remove the mappings and permissions
    const permNames = [
      'workflow.create',
      'workflow.read',
      'workflow.update',
      'workflow.delete',
      'workflow.view',
    ];

    // 1. Delete mappings
    await queryRunner.query(
      `DELETE FROM "permission_set_permission" 
       WHERE permission_id IN (SELECT id FROM "permission" WHERE name = ANY($1))`,
      [permNames],
    );

    // 2. Delete permissions
    await queryRunner.query('DELETE FROM "permission" WHERE name = ANY($1)', [
      permNames,
    ]);
  }
}
