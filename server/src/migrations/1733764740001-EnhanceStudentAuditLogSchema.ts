import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class EnhanceStudentAuditLogSchema1733764740001 implements MigrationInterface {
  name = 'EnhanceStudentAuditLogSchema1733764740001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to student_audit_logs table
    await queryRunner.addColumns('student_audit_logs', [
      new TableColumn({
        name: 'correlation_id',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Correlation ID for tracking related events',
      }),
      new TableColumn({
        name: 'school_id',
        type: 'uuid',
        isNullable: true,
        comment: 'School ID for multi-tenant support',
      }),
      new TableColumn({
        name: 'processed_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Timestamp when the audit log was processed',
      }),
      new TableColumn({
        name: 'is_archived',
        type: 'boolean',
        default: false,
        comment: 'Whether the audit log has been archived',
      }),
      new TableColumn({
        name: 'response_time',
        type: 'int',
        isNullable: true,
        comment: 'Response time in milliseconds',
      }),
      new TableColumn({
        name: 'memory_usage',
        type: 'bigint',
        isNullable: true,
        comment: 'Memory usage in bytes',
      }),
      new TableColumn({
        name: 'cpu_usage',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'CPU usage percentage',
      }),
      new TableColumn({
        name: 'query_execution_time',
        type: 'int',
        isNullable: true,
        comment: 'Query execution time in milliseconds',
      }),
      new TableColumn({
        name: 'anomaly_score',
        type: 'decimal',
        precision: 5,
        scale: 4,
        isNullable: true,
        comment: 'Anomaly score (0.0000 to 1.0000)',
      }),
      new TableColumn({
        name: 'is_anomaly',
        type: 'boolean',
        default: false,
        comment: 'Whether this log entry is anomalous',
      }),
      new TableColumn({
        name: 'anomaly_type',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Type of anomaly detected',
      }),
      new TableColumn({
        name: 'anomaly_reason',
        type: 'text',
        isNullable: true,
        comment: 'Reason for anomaly detection',
      }),
      new TableColumn({
        name: 'compliance_status',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Compliance status of the audit entry',
      }),
      new TableColumn({
        name: 'data_retention_policy',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Data retention policy applied',
      }),
    ]);

    // Add indexes for new columns
    await queryRunner.query(`
      CREATE INDEX "IDX_student_audit_logs_correlation_id_created_at" ON "student_audit_logs" ("correlation_id", "created_at");
      CREATE INDEX "IDX_student_audit_logs_school_id_created_at" ON "student_audit_logs" ("school_id", "created_at");
      CREATE INDEX "IDX_student_audit_logs_anomaly_score_created_at" ON "student_audit_logs" ("anomaly_score", "created_at");
      CREATE INDEX "IDX_student_audit_logs_is_anomaly_created_at" ON "student_audit_logs" ("is_anomaly", "created_at");
      CREATE INDEX "IDX_student_audit_logs_compliance_status_created_at" ON "student_audit_logs" ("compliance_status", "created_at");
      CREATE INDEX "IDX_student_audit_logs_gdpr_compliant_created_at" ON "student_audit_logs" ("gdpr_compliant", "created_at");
      CREATE INDEX "IDX_student_audit_logs_response_time_created_at" ON "student_audit_logs" ("response_time", "created_at");
    `);

    // Add constraints
    await queryRunner.query(`
      ALTER TABLE student_audit_logs
      ADD CONSTRAINT CHK_student_audit_logs_anomaly_score_range
      CHECK (anomaly_score >= 0.0000 AND anomaly_score <= 1.0000)
    `);

    await queryRunner.query(`
      ALTER TABLE student_audit_logs
      ADD CONSTRAINT CHK_student_audit_logs_cpu_usage_range
      CHECK (cpu_usage >= 0.00 AND cpu_usage <= 100.00)
    `);

    // Create student audit metrics aggregation table
    await queryRunner.query(`
      CREATE TABLE "student_audit_metrics_daily" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "school_id" uuid,
        "student_id" uuid,
        "total_events" bigint NOT NULL DEFAULT 0,
        "events_by_action" jsonb NOT NULL DEFAULT '{}',
        "events_by_severity" jsonb NOT NULL DEFAULT '{}',
        "anomaly_count" integer NOT NULL DEFAULT 0,
        "compliance_violations" integer NOT NULL DEFAULT 0,
        "avg_response_time" integer,
        "max_response_time" integer,
        "academic_year" varchar(20),
        "grade_level" varchar(50),
        "section" varchar(20),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_audit_metrics_daily" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_student_audit_metrics_daily_date_student" UNIQUE ("date", "student_id")
      )
    `);

    // Add indexes to student metrics table
    await queryRunner.query(`
      CREATE INDEX "IDX_student_audit_metrics_daily_date" ON "student_audit_metrics_daily" ("date");
      CREATE INDEX "IDX_student_audit_metrics_daily_school_student_date" ON "student_audit_metrics_daily" ("school_id", "student_id", "date");
      CREATE INDEX "IDX_student_audit_metrics_daily_academic_year" ON "student_audit_metrics_daily" ("academic_year");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop student metrics table
    await queryRunner.query(`DROP TABLE "student_audit_metrics_daily"`);

    // Drop constraints
    await queryRunner.query(`ALTER TABLE student_audit_logs DROP CONSTRAINT IF EXISTS CHK_student_audit_logs_anomaly_score_range`);
    await queryRunner.query(`ALTER TABLE student_audit_logs DROP CONSTRAINT IF EXISTS CHK_student_audit_logs_cpu_usage_range`);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_student_audit_logs_correlation_id_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_school_id_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_anomaly_score_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_is_anomaly_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_compliance_status_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_gdpr_compliant_created_at";
      DROP INDEX IF EXISTS "IDX_student_audit_logs_response_time_created_at";
    `);

    // Drop columns
    await queryRunner.dropColumn('student_audit_logs', 'correlation_id');
    await queryRunner.dropColumn('student_audit_logs', 'school_id');
    await queryRunner.dropColumn('student_audit_logs', 'processed_at');
    await queryRunner.dropColumn('student_audit_logs', 'is_archived');
    await queryRunner.dropColumn('student_audit_logs', 'response_time');
    await queryRunner.dropColumn('student_audit_logs', 'memory_usage');
    await queryRunner.dropColumn('student_audit_logs', 'cpu_usage');
    await queryRunner.dropColumn('student_audit_logs', 'query_execution_time');
    await queryRunner.dropColumn('student_audit_logs', 'anomaly_score');
    await queryRunner.dropColumn('student_audit_logs', 'is_anomaly');
    await queryRunner.dropColumn('student_audit_logs', 'anomaly_type');
    await queryRunner.dropColumn('student_audit_logs', 'anomaly_reason');
    await queryRunner.dropColumn('student_audit_logs', 'compliance_status');
    await queryRunner.dropColumn('student_audit_logs', 'data_retention_policy');
  }
}