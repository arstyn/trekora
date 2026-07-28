import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDefaultTemplatesForExistingOrgs1785247805531 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find all organizations
        const orgs = await queryRunner.query(`SELECT id FROM "organization"`);
        
        for (const org of orgs) {
            const orgId = org.id;
            
            // Find a user belonging to this organization to set as creator
            const users = await queryRunner.query(
                `SELECT "user_id" FROM "user_organization" WHERE "organization_id" = $1 LIMIT 1`,
                [orgId]
            );
            
            // Fallback to any user in the system if no user is specifically in this org
            let creatorId: string | null = null;
            if (users && users.length > 0) {
                creatorId = users[0].user_id;
            } else {
                const anyUsers = await queryRunner.query(`SELECT id FROM "user" LIMIT 1`);
                if (anyUsers && anyUsers.length > 0) {
                    creatorId = anyUsers[0].id;
                }
            }
            
            if (!creatorId) {
                // If there are absolutely no users in the database, we cannot seed
                continue;
            }
            
            // Check if payment template already exists
            const existingPayments = await queryRunner.query(
                `SELECT id FROM "payment_structure_templates" WHERE "organization_id" = $1 LIMIT 1`,
                [orgId]
            );
            if (!existingPayments || existingPayments.length === 0) {
                const milestonesJson = JSON.stringify([
                    {
                        name: 'Advance Payment',
                        amount: 50,
                        description: 'Initial advance payment',
                        dueDate: 'booking',
                        order: 1,
                    },
                    {
                        name: 'Final Payment',
                        amount: 50,
                        description: 'Balance payment',
                        dueDate: '2_weeks_before',
                        order: 2,
                    },
                ]);
                await queryRunner.query(
                    `INSERT INTO "payment_structure_templates" ("name", "created_by_id", "organization_id", "milestones") VALUES ($1, $2, $3, $4::jsonb)`,
                    ['Standard Payment Plan', creatorId, orgId, milestonesJson]
                );
            }
            
            // Check if cancellation template already exists
            const existingCancellations = await queryRunner.query(
                `SELECT id FROM "cancellation_tier_templates" WHERE "organization_id" = $1 LIMIT 1`,
                [orgId]
            );
            if (!existingCancellations || existingCancellations.length === 0) {
                const tiersJson = JSON.stringify([
                    {
                        timeframe: '30_days_before',
                        amount: 20,
                        description: '20% - 30 days before',
                    },
                    {
                        timeframe: '2_weeks_before',
                        amount: 40,
                        description: '40% - 15-30 days',
                    },
                    {
                        timeframe: '1_week_before',
                        amount: 80,
                        description: '80% - 7-14 days',
                    },
                    {
                        timeframe: 'departure',
                        amount: 100,
                        description: '100% - 0-7 days',
                    },
                ]);
                await queryRunner.query(
                    `INSERT INTO "cancellation_tier_templates" ("name", "created_by_id", "organization_id", "tiers") VALUES ($1, $2, $3, $4::jsonb)`,
                    ['Standard Cancellation Policy', creatorId, orgId, tiersJson]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "payment_structure_templates" WHERE "name" = $1`,
            ['Standard Payment Plan']
        );
        await queryRunner.query(
            `DELETE FROM "cancellation_tier_templates" WHERE "name" = $1`,
            ['Standard Cancellation Policy']
        );
    }

}
