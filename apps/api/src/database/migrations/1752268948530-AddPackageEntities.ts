import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllEntities20250711210645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "packages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar,
        "destination" varchar,
        "duration" varchar,
        "price" decimal(10,2),
        "description" text,
        "maxGuests" int,
        "startDate" date,
        "endDate" date,
        "difficulty" varchar,
        "category" varchar,
        "status" varchar DEFAULT 'draft',
        "thumbnail" varchar,
        "createdById" uuid,
        "organizationId" uuid,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "checklist_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task" varchar,
        "description" text,
        "category" varchar,
        "dueDate" varchar,
        "completed" boolean DEFAULT false,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "document_requirements" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar,
        "description" text,
        "mandatory" boolean,
        "applicableFor" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "itinerary_days" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "day" int,
        "title" varchar,
        "description" text,
        "activities" text,
        "meals" text,
        "accommodation" varchar,
        "images" text,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "cancellation_policies" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "text" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "cancellation_tiers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "timeframe" varchar,
        "percentage" int,
        "description" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "exclusions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "item" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "inclusions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "item" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "meals_breakdowns" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "breakfast" text,
        "lunch" text,
        "dinner" text,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "package_locations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" varchar,
        "country" varchar,
        "state" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "payment_milestones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar,
        "percentage" int,
        "description" varchar,
        "dueDate" varchar,
        "packageId" uuid
      );

      CREATE TABLE IF NOT EXISTS "transportations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "toMode" varchar,
        "toDetails" varchar,
        "toIncluded" boolean,
        "fromMode" varchar,
        "fromDetails" varchar,
        "fromIncluded" boolean,
        "duringMode" varchar,
        "duringDetails" varchar,
        "duringIncluded" boolean,
        "packageId" uuid
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "transportations";
      DROP TABLE IF EXISTS "payment_milestones";
      DROP TABLE IF EXISTS "package_locations";
      DROP TABLE IF EXISTS "meals_breakdowns";
      DROP TABLE IF EXISTS "inclusions";
      DROP TABLE IF EXISTS "exclusions";
      DROP TABLE IF EXISTS "cancellation_tiers";
      DROP TABLE IF EXISTS "cancellation_policies";
      DROP TABLE IF EXISTS "itinerary_days";
      DROP TABLE IF EXISTS "document_requirements";
      DROP TABLE IF EXISTS "checklist_items";
      DROP TABLE IF EXISTS "packages";
    `);
  }
}
