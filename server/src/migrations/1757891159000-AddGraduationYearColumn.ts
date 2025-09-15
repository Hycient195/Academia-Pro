import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGraduationYearColumn1757891159000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the graduationYear column to the students table
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS "graduationYear" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the graduationYear column
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS "graduationYear"
    `);
  }
}