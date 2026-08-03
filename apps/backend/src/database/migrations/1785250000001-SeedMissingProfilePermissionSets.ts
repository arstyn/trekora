import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedMissingProfilePermissionSets1785250000001 implements MigrationInterface {
    name = 'SeedMissingProfilePermissionSets1785250000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find all organizations
        const organizations = await queryRunner.query(`SELECT "id" FROM "organization"`);

        for (const org of organizations) {
            const organizationId = org.id;

            // Find Admin or Admin - Full Access permission set for this organization
            const adminSets = await queryRunner.query(
                `SELECT "id" FROM "permission_set" WHERE "organization_id" = $1 AND ("name" = 'Admin - Full Access' OR "name" = 'Admin') LIMIT 1`,
                [organizationId]
            );

            if (adminSets.length === 0) {
                continue;
            }

            const adminSetId = adminSets[0].id;

            // Find all employees in this org that do not have any entries in profile_permission_set
            const unassignedEmployees = await queryRunner.query(
                `SELECT e."id" FROM "employee" e 
                 LEFT JOIN "profile_permission_set" pps ON pps."employee_id" = e."id" 
                 WHERE e."organization_id" = $1 AND pps."id" IS NULL`,
                [organizationId]
            );

            for (const emp of unassignedEmployees) {
                await queryRunner.query(
                    `INSERT INTO "profile_permission_set" ("permission_set_id", "employee_id") VALUES ($1, $2)`,
                    [adminSetId, emp.id]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Migration rollback not needed
    }
}
