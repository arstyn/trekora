import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

export class DynamicBatchCostSheet1789800000000 implements MigrationInterface {
  name = 'DynamicBatchCostSheet1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add cost_sheet to batch and packages
    await queryRunner.query(`
      ALTER TABLE "batch"
      ADD COLUMN IF NOT EXISTS "cost_sheet" jsonb;
    `);

    await queryRunner.query(`
      ALTER TABLE "packages"
      ADD COLUMN IF NOT EXISTS "cost_sheet" jsonb;
    `);

    // 2. Add tier_id and tier_name to bookings
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "tier_id" character varying,
      ADD COLUMN IF NOT EXISTS "tier_name" character varying;
    `);

    // 3. Alter booking_customers age_category from enum to VARCHAR(100)
    await queryRunner.query(`
      ALTER TABLE "booking_customers"
      ALTER COLUMN "age_category" DROP DEFAULT;

      ALTER TABLE "booking_customers"
      ALTER COLUMN "age_category" TYPE VARCHAR(100) USING "age_category"::VARCHAR;

      ALTER TABLE "booking_customers"
      ALTER COLUMN "age_category" SET DEFAULT 'adult';
    `);

    // 4. Backfill tier_name and tier_id for existing bookings
    await queryRunner.query(`
      UPDATE "bookings" b
      SET "tier_id" = b."package_tier_id"::text,
          "tier_name" = pt."name"
      FROM "package_tiers" pt
      WHERE b."package_tier_id" = pt."id"
        AND (b."tier_name" IS NULL OR b."tier_id" IS NULL);
    `);

    // 5. Convert existing packages' pricing breakdown into the new cost_sheet structure
    const packages = await queryRunner.query(`
      SELECT id, name, "groundTransportationCost" FROM "packages";
    `);

    for (const pkg of packages) {
      const packageId = pkg.id;

      // Get package tiers
      const tiers = await queryRunner.query(`
        SELECT * FROM "package_tiers" WHERE "packageId" = $1 ORDER BY "adultCost" ASC;
      `, [packageId]);

      // Get additional costs
      const additionalCosts = await queryRunner.query(`
        SELECT * FROM "additional_costs" WHERE "packageId" = $1;
      `, [packageId]);

      // Get meals
      const meals = await queryRunner.query(`
        SELECT * FROM "meals_breakdowns" WHERE "packageId" = $1 LIMIT 1;
      `, [packageId]);

      // Get transport options
      const transportOptions = await queryRunner.query(`
        SELECT * FROM "transportation_options" WHERE "packageId" = $1;
      `, [packageId]);

      const mealsCost = meals && meals.length > 0 ? Number(meals[0].mealsCost || 0) : 0;
      const groundCost = Number(pkg.groundTransportationCost || 0);

      const hasTiers = tiers.length > 1;
      const costSheetTiers: any[] = [];

      const tiersToProcess = tiers.length > 0 ? tiers : [
        { id: randomUUID(), name: 'Standard', adultCost: 0, childCostType: 'flat', childCostValue: 0, infantCostType: 'flat', infantCostValue: 0 }
      ];

      for (let i = 0; i < tiersToProcess.length; i++) {
        const t = tiersToProcess[i];
        const adultCost = Number(t.adultCost || 0);
        const tierTransport = transportOptions.find((opt: any) => opt.id === t.transportationId);
        const transportCost = tierTransport ? Number(tierTransport.cost || 0) : 0;

        // Build Adult Line Items
        const adultItems: any[] = [];
        if (transportCost > 0) {
          adultItems.push({
            id: randomUUID(),
            title: tierTransport?.title ? `Transportation (${tierTransport.title})` : 'Transportation',
            cost: transportCost,
          });
        }
        if (groundCost > 0) {
          adultItems.push({
            id: randomUUID(),
            title: 'Ground Transportation',
            cost: groundCost,
          });
        }
        if (mealsCost > 0) {
          adultItems.push({
            id: randomUUID(),
            title: 'Meals & Dining',
            cost: mealsCost,
          });
        }
        for (const ac of additionalCosts) {
          adultItems.push({
            id: randomUUID(),
            title: ac.name || 'Additional Fee',
            cost: Number(ac.cost || 0),
          });
        }

        const currentExpenses = adultItems.reduce((acc, it) => acc + (Number(it.cost) || 0), 0);
        let margin = Math.max(0, adultCost - currentExpenses);

        // If expenses exceed adultCost or adultCost is 0, default margin
        if (adultCost > 0 && currentExpenses > adultCost) {
          margin = Math.round(adultCost * 0.15); // 15% estimated margin
        } else if (adultCost === 0) {
          margin = 0;
        }

        adultItems.push({
          id: randomUUID(),
          title: 'Operator Margin',
          cost: margin,
          isMargin: true,
        });

        const adultTotal = adultItems.reduce((acc, it) => acc + (Number(it.cost) || 0), 0);

        const ageCategories: any[] = [
          {
            id: randomUUID(),
            name: 'Adult',
            ageDescription: '12+ yrs',
            isDefault: true,
            items: adultItems,
            totalCost: adultTotal,
          }
        ];

        // Child Category
        const childVal = Number(t.childCostValue || 0);
        if (childVal > 0) {
          const childTotal = t.childCostType === 'percentage'
            ? Math.round((adultCost * childVal) / 100)
            : childVal;
          const childMargin = Math.round(childTotal * 0.2);
          const childBase = Math.max(0, childTotal - childMargin);

          ageCategories.push({
            id: randomUUID(),
            name: 'Child',
            ageDescription: '2-11 yrs',
            items: [
              { id: randomUUID(), title: 'Child Tour Services', cost: childBase },
              { id: randomUUID(), title: 'Operator Margin', cost: childMargin, isMargin: true },
            ],
            totalCost: childTotal,
          });
        }

        // Infant Category
        const infantVal = Number(t.infantCostValue || 0);
        if (infantVal > 0) {
          const infantTotal = t.infantCostType === 'percentage'
            ? Math.round((adultCost * infantVal) / 100)
            : infantVal;
          const infantMargin = Math.round(infantTotal * 0.2);
          const infantBase = Math.max(0, infantTotal - infantMargin);

          ageCategories.push({
            id: randomUUID(),
            name: 'Infant',
            ageDescription: '0-2 yrs',
            items: [
              { id: randomUUID(), title: 'Infant Services', cost: infantBase },
              { id: randomUUID(), title: 'Operator Margin', cost: infantMargin, isMargin: true },
            ],
            totalCost: infantTotal,
          });
        }

        costSheetTiers.push({
          id: t.id || randomUUID(),
          name: t.name || (hasTiers ? `Tier ${i + 1}` : 'Standard'),
          isDefault: i === 0,
          ageCategories,
        });
      }

      const packageCostSheet = {
        hasTiers,
        tiers: costSheetTiers,
      };

      await queryRunner.query(`
        UPDATE "packages"
        SET "cost_sheet" = $1
        WHERE "id" = $2;
      `, [JSON.stringify(packageCostSheet), packageId]);

      // Update batches for this package that don't have cost_sheet yet
      await queryRunner.query(`
        UPDATE "batch"
        SET "cost_sheet" = $1
        WHERE "package_id" = $2 AND "cost_sheet" IS NULL;
      `, [JSON.stringify(packageCostSheet), packageId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "batch" DROP COLUMN IF EXISTS "cost_sheet";
      ALTER TABLE "packages" DROP COLUMN IF EXISTS "cost_sheet";
      ALTER TABLE "bookings" DROP COLUMN IF EXISTS "tier_id", DROP COLUMN IF EXISTS "tier_name";
    `);
  }
}
