import { MigrationInterface, QueryRunner } from "typeorm";
import { permissions } from "../seeds/permission.seed";
import { defaultPermissionSets } from "../../modules/permission/default-permission-sets";

export class SeedDataClearPermission1785250000000 implements MigrationInterface {
    name = 'SeedDataClearPermission1785250000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find all organizations
        const organizations = await queryRunner.query(`SELECT "id" FROM "organization"`);

        for (const org of organizations) {
            const organizationId = org.id;

            // 1. Create missing permissions (including settings.clear-data)
            for (const p of permissions) {
                const existingPermission = await queryRunner.query(
                    `SELECT "id" FROM "permission" WHERE "name" = $1 AND "organization_id" = $2`,
                    [p.name, organizationId]
                );

                if (existingPermission.length === 0) {
                    await queryRunner.query(
                        `INSERT INTO "permission" ("name", "resource", "action", "description", "organization_id") 
                         VALUES ($1, $2, $3, $4, $5)`,
                        [p.name, p.resource, p.action, p.description, organizationId]
                    );
                }
            }

            // Get all permissions for this org to map them to sets
            const allOrgPermissions = await queryRunner.query(
                `SELECT "id", "name" FROM "permission" WHERE "organization_id" = $1`,
                [organizationId]
            );
            const permissionMap = new Map(allOrgPermissions.map((p: any) => [p.name, p.id]));

            // 2. Ensure Admin permission set includes settings.clear-data
            const adminConfig = defaultPermissionSets.admin;
            const existingSet = await queryRunner.query(
                `SELECT "id" FROM "permission_set" WHERE "name" = $1 AND "organization_id" = $2`,
                [adminConfig.name, organizationId]
            );

            if (existingSet.length > 0) {
                const setId = existingSet[0].id;
                // Sync permissions for Admin permission set
                await queryRunner.query(`DELETE FROM "permission_set_permission" WHERE "permission_set_id" = $1`, [setId]);

                for (const permissionName of adminConfig.permissionNames) {
                    const permissionId = permissionMap.get(permissionName);
                    if (permissionId) {
                        await queryRunner.query(
                            `INSERT INTO "permission_set_permission" ("permission_set_id", "permission_id") VALUES ($1, $2)`,
                            [setId, permissionId]
                        );
                    }
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Down migration can be left empty
    }
}
