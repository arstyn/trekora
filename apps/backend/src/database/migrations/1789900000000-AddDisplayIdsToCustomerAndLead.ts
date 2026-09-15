import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisplayIdsToCustomerAndLead1789900000000 implements MigrationInterface {
  name = 'AddDisplayIdsToCustomerAndLead1789900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Customer: Add customer_number as nullable
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "customer_number" character varying`,
    );

    // 2. Customer: Backfill existing rows with CUST + YYMM + 4-digit sequence
    await queryRunner.query(`
      WITH numbered_customers AS (
        SELECT 
          c.id,
          TO_CHAR(COALESCE(c.created_at, NOW()), 'YYMM') as date_part,
          ROW_NUMBER() OVER (ORDER BY COALESCE(c.created_at, NOW()) ASC, c.id ASC) as seq
        FROM "customer" c
      )
      UPDATE "customer"
      SET customer_number = 'CUST' || nc.date_part || LPAD(nc.seq::text, 4, '0')
      FROM numbered_customers nc
      WHERE "customer".id = nc.id AND ("customer".customer_number IS NULL OR "customer".customer_number = '');
    `);

    // 3. Customer: Set NOT NULL and add UNIQUE constraint
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customer_number" SET NOT NULL`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_customer_number'
        ) THEN
          ALTER TABLE "customer" ADD CONSTRAINT "UQ_customer_number" UNIQUE ("customer_number");
        END IF;
      END $$;
    `);

    // 4. Lead: Add lead_number as nullable
    await queryRunner.query(
      `ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "lead_number" character varying`,
    );

    // 5. Lead: Backfill existing rows with LEAD + YYMM + 4-digit sequence
    await queryRunner.query(`
      WITH numbered_leads AS (
        SELECT 
          l.id,
          TO_CHAR(COALESCE(l.created_at, NOW()), 'YYMM') as date_part,
          ROW_NUMBER() OVER (ORDER BY COALESCE(l.created_at, NOW()) ASC, l.id ASC) as seq
        FROM "lead" l
      )
      UPDATE "lead"
      SET lead_number = 'LEAD' || nl.date_part || LPAD(nl.seq::text, 4, '0')
      FROM numbered_leads nl
      WHERE "lead".id = nl.id AND ("lead".lead_number IS NULL OR "lead".lead_number = '');
    `);

    // 6. Lead: Set NOT NULL and add UNIQUE constraint
    await queryRunner.query(
      `ALTER TABLE "lead" ALTER COLUMN "lead_number" SET NOT NULL`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_lead_number'
        ) THEN
          ALTER TABLE "lead" ADD CONSTRAINT "UQ_lead_number" UNIQUE ("lead_number");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "UQ_lead_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lead" DROP COLUMN IF EXISTS "lead_number"`,
    );

    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "UQ_customer_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN IF EXISTS "customer_number"`,
    );
  }
}
