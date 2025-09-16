import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateParentInfoStructure1757975434300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add the new parentInfo column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "parentInfo" jsonb
    `);

    // Migrate existing data from parents column to parentInfo column
    await queryRunner.query(`
      UPDATE students
      SET "parentInfo" = CASE
        WHEN parents IS NOT NULL THEN jsonb_build_object(
          'fatherFirstName', parents->'father'->>'firstName',
          'fatherLastName', parents->'father'->>'lastName',
          'fatherPhone', parents->'father'->>'phone',
          'fatherEmail', parents->'father'->>'email',
          'fatherOccupation', parents->'father'->>'occupation',
          'motherFirstName', parents->'mother'->>'firstName',
          'motherLastName', parents->'mother'->>'lastName',
          'motherPhone', parents->'mother'->>'phone',
          'motherEmail', parents->'mother'->>'email',
          'motherOccupation', parents->'mother'->>'occupation',
          'guardianFirstName', parents->'guardian'->>'firstName',
          'guardianLastName', parents->'guardian'->>'lastName',
          'guardianPhone', parents->'guardian'->>'phone',
          'guardianEmail', parents->'guardian'->>'email',
          'guardianOccupation', parents->'guardian'->>'occupation',
          'guardianRelation', parents->'guardian'->>'relation',
          'guardianCustomRelation', null
        )
        ELSE jsonb_build_object(
          'fatherFirstName', '',
          'fatherLastName', '',
          'motherFirstName', '',
          'motherLastName', '',
          'guardianCustomRelation', null
        )
      END
      WHERE "parentInfo" IS NULL
    `);

    // Set default values for parentInfo where it's still null
    await queryRunner.query(`
      UPDATE students
      SET "parentInfo" = jsonb_build_object(
        'fatherFirstName', '',
        'fatherLastName', '',
        'motherFirstName', '',
        'motherLastName', '',
        'guardianCustomRelation', null
      )
      WHERE "parentInfo" IS NULL
    `);

    // Remove the old parents column
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS "parents"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the parents column
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "parents" jsonb
    `);

    // Migrate data back from parentInfo to parents
    await queryRunner.query(`
      UPDATE students
      SET "parents" = CASE
        WHEN "parentInfo" IS NOT NULL THEN jsonb_build_object(
          'father', jsonb_build_object(
            'firstName', "parentInfo"->>'fatherFirstName',
            'lastName', "parentInfo"->>'fatherLastName',
            'phone', "parentInfo"->>'fatherPhone',
            'email', "parentInfo"->>'fatherEmail',
            'occupation', "parentInfo"->>'fatherOccupation'
          ),
          'mother', jsonb_build_object(
            'firstName', "parentInfo"->>'motherFirstName',
            'lastName', "parentInfo"->>'motherLastName',
            'phone', "parentInfo"->>'motherPhone',
            'email', "parentInfo"->>'motherEmail',
            'occupation', "parentInfo"->>'motherOccupation'
          ),
          'guardian', CASE
            WHEN "parentInfo"->>'guardianFirstName' IS NOT NULL THEN jsonb_build_object(
              'firstName', "parentInfo"->>'guardianFirstName',
              'lastName', "parentInfo"->>'guardianLastName',
              'phone', "parentInfo"->>'guardianPhone',
              'email', "parentInfo"->>'guardianEmail',
              'relation', "parentInfo"->>'guardianRelation',
              'occupation', "parentInfo"->>'guardianOccupation'
            )
            ELSE NULL
          END
        )
        ELSE NULL
      END
    `);

    // Remove the parentInfo column
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS "parentInfo"
    `);
  }
}