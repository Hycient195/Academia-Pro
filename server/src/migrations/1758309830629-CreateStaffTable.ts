import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffTable1758309830629 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types if they don't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_gender_enum" AS ENUM('male', 'female', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_department_enum" AS ENUM('academic', 'administrative', 'support', 'technical', 'medical', 'security', 'transport', 'hostel', 'library', 'sports');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_position_enum" AS ENUM('principal', 'vice_principal', 'headmaster', 'librarian', 'accountant', 'administrator', 'clerk', 'driver', 'security_guard', 'nurse', 'technician', 'janitor', 'cook', 'secretary');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_employmenttype_enum" AS ENUM('full_time', 'part_time', 'contract', 'temporary', 'intern');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_employmentstatus_enum" AS ENUM('active', 'inactive', 'terminated', 'on_leave', 'suspended');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create staff table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "employeeId" character varying NOT NULL,
        "userId" character varying,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "middleName" character varying,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "dateOfBirth" date NOT NULL,
        "gender" "staff_gender_enum" NOT NULL,
        "address" jsonb NOT NULL,
        "department" "staff_department_enum" NOT NULL,
        "position" "staff_position_enum" NOT NULL,
        "employmentType" "staff_employmenttype_enum" NOT NULL DEFAULT 'full_time',
        "employmentStatus" "staff_employmentstatus_enum" NOT NULL DEFAULT 'active',
        "hireDate" date NOT NULL,
        "contractEndDate" date,
        "salary" jsonb NOT NULL,
        "qualifications" jsonb NOT NULL DEFAULT '[]',
        "emergencyContact" jsonb NOT NULL,
        "workSchedule" jsonb NOT NULL,
        "benefits" jsonb NOT NULL,
        "performance" jsonb NOT NULL DEFAULT '[]',
        "leaves" jsonb NOT NULL DEFAULT '[]',
        "documents" jsonb NOT NULL DEFAULT '[]',
        "schoolId" character varying NOT NULL,
        "managerId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdBy" character varying,
        "updatedBy" character varying,
        CONSTRAINT "PK_staff" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_staff_employeeId" ON "staff" ("employeeId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_staff_email" ON "staff" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_staff_schoolId_employeeId" ON "staff" ("schoolId", "employeeId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_staff_schoolId_email" ON "staff" ("schoolId", "email")
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "staff" ADD CONSTRAINT "FK_staff_managerId" FOREIGN KEY ("managerId") REFERENCES "staff"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "staff" DROP CONSTRAINT "FK_staff_managerId"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_staff_schoolId_email"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_staff_schoolId_employeeId"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_staff_email"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_staff_employeeId"
    `);

    // Drop table
    await queryRunner.query(`
      DROP TABLE "staff"
    `);

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE "staff_employmentstatus_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "staff_employmenttype_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "staff_position_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "staff_department_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "staff_gender_enum"
    `);
  }
}