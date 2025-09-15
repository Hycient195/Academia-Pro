import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGradeCodeColumn1757891157000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the gradeCode column to the students table
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "gradeCode" varchar(10)
    `);

    // Set default values for existing records
    await queryRunner.query(`
      UPDATE students
      SET "gradeCode" = 'PRY1'
      WHERE "gradeCode" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the gradeCode column
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS "gradeCode"
    `);
  }
}