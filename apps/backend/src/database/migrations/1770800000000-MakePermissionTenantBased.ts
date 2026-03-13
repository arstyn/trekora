import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

export class MakePermissionTenantBased1770800000000
    implements MigrationInterface {
    name = 'MakePermissionTenantBased1770800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the unique constraint on name
        await queryRunner.query(
            `ALTER TABLE "permission" DROP CONSTRAINT IF EXISTS "UQ_permission_name"`,
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_permission_name"`,
        );

        // Get all existing organizations
        const organizations = await queryRunner.query(
            `SELECT id FROM "organization" ORDER BY created_at ASC`,
        );

        if (organizations.length === 0) {
            console.warn(
                'No organizations found. Skipping permission migration.',
            );
            // Still need to add the column for future use
            await queryRunner.addColumn(
                'permission',
                new TableColumn({
                    name: 'organization_id',
                    type: 'uuid',
                    isNullable: false,
                }),
            );
            return;
        }

        // Get all existing permissions (before adding organization_id)
        const existingPermissions = await queryRunner.query(
            `SELECT id, name, resource, action, description, created_at, updated_at FROM "permission"`,
        );

        // Get all existing permission sets (they already have organization_id)
        const existingPermissionSets = await queryRunner.query(
            `SELECT id, name, description, organization_id, created_at, updated_at FROM "permission_set"`,
        );

        // Get permission set to permission mappings (old permission IDs)
        const permissionSetMappings: Record<string, string[]> = {};
        if (existingPermissionSets.length > 0) {
            const mappings = await queryRunner.query(
                `SELECT permission_set_id, permission_id FROM "permission_set_permission"`,
            );
            for (const mapping of mappings) {
                if (!permissionSetMappings[mapping.permission_set_id]) {
                    permissionSetMappings[mapping.permission_set_id] = [];
                }
                permissionSetMappings[mapping.permission_set_id].push(
                    mapping.permission_id,
                );
            }
        }


        // Add organization_id column (nullable first to handle existing data)
        await queryRunner.addColumn(
            'permission',
            new TableColumn({
                name: 'organization_id',
                type: 'uuid',
                isNullable: true, // Temporarily nullable for data migration
            }),
        );

        // For each organization, create copies of permissions and permission sets
        for (const org of organizations) {
            const orgId = org.id;
            console.log(
                `Creating permissions and permission sets for organization ${orgId}...`,
            );

            // Create copies of all existing permissions for this organization
            const newPermissionIdMap = new Map<string, string>(); // old_id -> new_id

            for (const oldPermission of existingPermissions) {
                // Check if permission already exists for this organization
                const existing = await queryRunner.query(
                    `SELECT id FROM "permission" WHERE name = $1 AND organization_id = $2`,
                    [oldPermission.name, orgId],
                );

                if (existing.length === 0) {
                    // Create new permission for this organization
                    const newPermission = await queryRunner.query(
                        `INSERT INTO "permission" (name, resource, action, description, organization_id, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                         RETURNING id`,
                        [
                            oldPermission.name,
                            oldPermission.resource,
                            oldPermission.action,
                            oldPermission.description,
                            orgId,
                        ],
                    );
                    newPermissionIdMap.set(
                        oldPermission.id,
                        newPermission[0].id,
                    );
                } else {
                    newPermissionIdMap.set(oldPermission.id, existing[0].id);
                }
            }

            // Update existing permission sets for this organization to use new permission IDs
            // Permission sets already have organization_id, so we only need to update their permission mappings
            for (const existingPermissionSet of existingPermissionSets) {
                // Only process permission sets that belong to this organization
                if (existingPermissionSet.organization_id !== orgId) {
                    continue;
                }

                const oldPermissionIds =
                    permissionSetMappings[existingPermissionSet.id] || [];
                if (oldPermissionIds.length === 0) {
                    continue;
                }

                // Map old permission IDs to new permission IDs for this organization
                const newPermissionIds: string[] = [];
                for (const oldPermissionId of oldPermissionIds) {
                    const newPermissionId = newPermissionIdMap.get(oldPermissionId);
                    if (newPermissionId) {
                        newPermissionIds.push(newPermissionId);
                    }
                }

                // Update permission_set_permission entries
                // First, delete old mappings
                await queryRunner.query(
                    `DELETE FROM "permission_set_permission" WHERE permission_set_id = $1`,
                    [existingPermissionSet.id],
                );

                // Then, create new mappings with new permission IDs
                if (newPermissionIds.length > 0) {
                    const values = newPermissionIds
                        .map(
                            (permId, index) =>
                                `($${index * 2 + 1}::uuid, $${index * 2 + 2}::uuid)`,
                        )
                        .join(', ');

                    const params: any[] = [];
                    for (const permId of newPermissionIds) {
                        params.push(existingPermissionSet.id, permId);
                    }

                    await queryRunner.query(
                        `INSERT INTO "permission_set_permission" (permission_set_id, permission_id)
                         VALUES ${values}`,
                        params,
                    );
                }
            }

            const permissionSetsForOrg = existingPermissionSets.filter(
                (ps: any) => ps.organization_id === orgId,
            ).length;
            console.log(
                `Created ${newPermissionIdMap.size} permissions and updated ${permissionSetsForOrg} permission sets for organization ${orgId}`,
            );
        }

        // Delete old permissions that don't have organization_id (they've been copied)
        await queryRunner.query(
            `DELETE FROM "permission" WHERE organization_id IS NULL`,
        );

        // Make organization_id NOT NULL after data migration
        await queryRunner.query(
            `ALTER TABLE "permission" ALTER COLUMN "organization_id" SET NOT NULL`,
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            'permission',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'organization',
                onDelete: 'CASCADE',
            }),
        );

        // Create unique index on (name, organization_id)
        await queryRunner.createIndex(
            'permission',
            new TableIndex({
                name: 'IDX_permission_name_organization',
                columnNames: ['name', 'organization_id'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique index
        await queryRunner.dropIndex('permission', 'IDX_permission_name_organization');

        // Drop foreign key
        const table = await queryRunner.getTable('permission');
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('organization_id') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('permission', foreignKey);
        }

        // Remove organization_id column
        await queryRunner.dropColumn('permission', 'organization_id');

        // Restore unique constraint on name
        await queryRunner.query(
            `ALTER TABLE "permission" ADD CONSTRAINT "UQ_permission_name" UNIQUE ("name")`,
        );
    }
}
