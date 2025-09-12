import { MigrationInterface, QueryRunner } from 'typeorm';
import type { TStudentStage, TGradeCode } from '@academia-pro/types/student/student.types';

export class StudentMigration20250911 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrate legacy currentGrade to stage and gradeCode
    // This assumes a mapping; adjust based on actual legacy data
    await queryRunner.query(`
      UPDATE students 
      SET 
        stage = CASE 
          WHEN currentGrade LIKE '%Nursery%' OR currentGrade LIKE '%KG%' THEN 'EY'
          WHEN currentGrade LIKE '%Primary%' THEN 'PRY'
          WHEN currentGrade LIKE '%JSS%' THEN 'JSS'
          WHEN currentGrade LIKE '%SSS%' THEN 'SSS'
          ELSE 'PRY' -- default
        END,
        gradeCode = CASE 
          WHEN currentGrade = 'Primary 1' THEN 'PRY1'
          WHEN currentGrade = 'Primary 2' THEN 'PRY2'
          -- Add more mappings as needed
          WHEN currentGrade = 'JSS 1' THEN 'JSS1'
          WHEN currentGrade = 'SSS 3' THEN 'SSS3'
          ELSE 'PRY1' -- default
        END,
        streamSection = currentSection
      WHERE stage IS NULL OR gradeCode IS NULL
    `);

    // Set streamSection to currentSection for legacy data
    await queryRunner.query(`
      UPDATE students 
      SET streamSection = COALESCE(streamSection, currentSection)
      WHERE streamSection IS NULL
    `);

    // Set isBoarding to false if not set
    await queryRunner.query(`
      UPDATE students 
      SET isBoarding = false 
      WHERE isBoarding IS NULL
    `);

    // Initialize empty histories if null
    await queryRunner.query(`
      UPDATE students 
      SET promotionHistory = '[]'::jsonb 
      WHERE promotionHistory IS NULL
    `);

    await queryRunner.query(`
      UPDATE students 
      SET transferHistory = '[]'::jsonb 
      WHERE transferHistory IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert migration if needed, but this is destructive; log instead
    console.warn('Reverting student migration - this may not be reversible without backup');
    // Restore legacy fields from new ones - approximate
    await queryRunner.query(`
      UPDATE students 
      SET 
        currentGrade = CASE stage
          WHEN 'EY' THEN 'Nursery/KG'
          WHEN 'PRY' THEN 'Primary ' || SUBSTRING(gradeCode FROM 4 FOR 1)::int
          WHEN 'JSS' THEN 'JSS ' || SUBSTRING(gradeCode FROM 4 FOR 1)::int
          WHEN 'SSS' THEN 'SSS ' || SUBSTRING(gradeCode FROM 4 FOR 1)::int
          ELSE currentGrade
        END,
        currentSection = streamSection
      WHERE currentGrade IS NULL OR currentSection IS NULL
    `);
  }
}