import { MigrationInterface, QueryRunner, Table, Index, TableColumn } from 'typeorm';

export class EnhanceAuditLogSchema1733764740000 implements MigrationInterface {
  name = 'EnhanceAuditLogSchema1733764740000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to audit_logs table
    await queryRunner.addColumns('audit_logs', [
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
        name: 'retention_period',
        type: 'int',
        isNullable: true,
        comment: 'Data retention period in days',
      }),
      new TableColumn({
        name: 'compliance_status',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Compliance status of the audit entry',
      }),
      new TableColumn({
        name: 'gdpr_compliant',
        type: 'boolean',
        default: true,
        comment: 'Whether the entry is GDPR compliant',
      }),
      new TableColumn({
        name: 'data_retention_policy',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Data retention policy applied',
      }),
      new TableColumn({
        name: 'device_info',
        type: 'jsonb',
        isNullable: true,
        comment: 'Device information JSON',
      }),
      new TableColumn({
        name: 'location_info',
        type: 'jsonb',
        isNullable: true,
        comment: 'Location information JSON',
      }),
    ]);

    // Add indexes for new columns
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_anomaly_score_timestamp" ON "audit_logs" ("anomaly_score", "timestamp");
      CREATE INDEX "IDX_audit_logs_is_anomaly_timestamp" ON "audit_logs" ("is_anomaly", "timestamp");
      CREATE INDEX "IDX_audit_logs_compliance_status_timestamp" ON "audit_logs" ("compliance_status", "timestamp");
      CREATE INDEX "IDX_audit_logs_gdpr_compliant_timestamp" ON "audit_logs" ("gdpr_compliant", "timestamp");
      CREATE INDEX "IDX_audit_logs_response_time_timestamp" ON "audit_logs" ("response_time", "timestamp");
      CREATE INDEX "IDX_audit_logs_correlation_id_timestamp" ON "audit_logs" ("correlation_id", "timestamp");
    `);

    // Add constraints
    await queryRunner.query(`
      ALTER TABLE audit_logs
      ADD CONSTRAINT CHK_audit_logs_anomaly_score_range
      CHECK (anomaly_score >= 0.0000 AND anomaly_score <= 1.0000)
    `);

    await queryRunner.query(`
      ALTER TABLE audit_logs
      ADD CONSTRAINT CHK_audit_logs_cpu_usage_range
      CHECK (cpu_usage >= 0.00 AND cpu_usage <= 100.00)
    `);

    // Create audit metrics aggregation table
    await queryRunner.createTable(
      new Table({
        name: 'audit_metrics_daily',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'date',
            type: 'date',
            isUnique: true,
            comment: 'Date for metrics aggregation',
          },
          {
            name: 'school_id',
            type: 'uuid',
            isNullable: true,
            comment: 'School ID for multi-tenant metrics',
          },
          {
            name: 'total_events',
            type: 'bigint',
            default: 0,
            comment: 'Total audit events for the day',
          },
          {
            name: 'events_by_severity',
            type: 'jsonb',
            default: '{}',
            comment: 'Events count by severity level',
          },
          {
            name: 'events_by_action',
            type: 'jsonb',
            default: '{}',
            comment: 'Events count by action type',
          },
          {
            name: 'anomaly_count',
            type: 'int',
            default: 0,
            comment: 'Number of anomalous events',
          },
          {
            name: 'avg_response_time',
            type: 'int',
            isNullable: true,
            comment: 'Average response time in milliseconds',
          },
          {
            name: 'max_response_time',
            type: 'int',
            isNullable: true,
            comment: 'Maximum response time in milliseconds',
          },
          {
            name: 'compliance_violations',
            type: 'int',
            default: 0,
            comment: 'Number of compliance violations',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Add indexes to metrics table
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_metrics_daily_date" ON "audit_metrics_daily" ("date");
      CREATE INDEX "IDX_audit_metrics_daily_school_date" ON "audit_metrics_daily" ("school_id", "date");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop metrics table
    await queryRunner.dropTable('audit_metrics_daily');

    // Drop constraints
    await queryRunner.query(`ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS CHK_audit_logs_anomaly_score_range`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS CHK_audit_logs_cpu_usage_range`);

    // Drop indexes
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_anomaly_score_timestamp');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_is_anomaly_timestamp');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_compliance_status_timestamp');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_gdpr_compliant_timestamp');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_response_time_timestamp');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_logs_correlation_id_timestamp');

    // Drop columns
    await queryRunner.dropColumn('audit_logs', 'response_time');
    await queryRunner.dropColumn('audit_logs', 'memory_usage');
    await queryRunner.dropColumn('audit_logs', 'cpu_usage');
    await queryRunner.dropColumn('audit_logs', 'query_execution_time');
    await queryRunner.dropColumn('audit_logs', 'anomaly_score');
    await queryRunner.dropColumn('audit_logs', 'is_anomaly');
    await queryRunner.dropColumn('audit_logs', 'anomaly_type');
    await queryRunner.dropColumn('audit_logs', 'anomaly_reason');
    await queryRunner.dropColumn('audit_logs', 'retention_period');
    await queryRunner.dropColumn('audit_logs', 'compliance_status');
    await queryRunner.dropColumn('audit_logs', 'gdpr_compliant');
    await queryRunner.dropColumn('audit_logs', 'data_retention_policy');
    await queryRunner.dropColumn('audit_logs', 'device_info');
    await queryRunner.dropColumn('audit_logs', 'location_info');
  }
}