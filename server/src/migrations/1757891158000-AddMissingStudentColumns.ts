import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingStudentColumns1757891158000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add stage column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "stage" varchar(10)
    `);

    // Add streamSection column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "streamSection" varchar(20)
    `);

    // Add enrollmentType column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "enrollmentType" varchar(20) DEFAULT 'regular'
    `);

    // Add isBoarding column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "isBoarding" boolean DEFAULT false
    `);

    // Add promotionHistory column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "promotionHistory" jsonb DEFAULT '[]'::jsonb
    `);

    // Add transferHistory column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "transferHistory" jsonb DEFAULT '[]'::jsonb
    `);

    // Set default values for existing records
    await queryRunner.query(`
      UPDATE students
      SET
        "stage" = COALESCE("stage", 'PRY'),
        "streamSection" = COALESCE("streamSection", 'A'),
        "enrollmentType" = COALESCE("enrollmentType", 'regular'),
        "isBoarding" = COALESCE("isBoarding", false),
        "promotionHistory" = COALESCE("promotionHistory", '[]'::jsonb),
        "transferHistory" = COALESCE("transferHistory", '[]'::jsonb)
      WHERE "stage" IS NULL OR "streamSection" IS NULL OR "enrollmentType" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS "stage",
      DROP COLUMN IF EXISTS "streamSection",
      DROP COLUMN IF EXISTS "enrollmentType",
      DROP COLUMN IF EXISTS "isBoarding",
      DROP COLUMN IF EXISTS "promotionHistory",
      DROP COLUMN IF EXISTS "transferHistory"
    `);
  }
}