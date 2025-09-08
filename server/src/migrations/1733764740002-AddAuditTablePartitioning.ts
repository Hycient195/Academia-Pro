import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditTablePartitioning1733764740002 implements MigrationInterface {
  name = 'AddAuditTablePartitioning1733764740002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create partitioning for audit_logs table
    // First, create the partitioned table structure
    await queryRunner.query(`
      -- Create partitioned audit_logs table
      CREATE TABLE IF NOT EXISTS audit_logs_partitioned (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid,
        school_id uuid,
        session_id uuid,
        correlation_id varchar(100),
        action audit_action_enum NOT NULL,
        severity audit_severity_enum NOT NULL DEFAULT 'medium',
        resource varchar(100) NOT NULL,
        resource_id varchar(100),
        ip_address varchar(45) NOT NULL,
        user_agent text NOT NULL,
        details jsonb,
        metadata jsonb,
        old_values jsonb,
        new_values jsonb,
        timestamp timestamp NOT NULL,
        processed_at timestamp,
        is_archived boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        -- New fields
        response_time int,
        memory_usage bigint,
        cpu_usage decimal(5,2),
        query_execution_time int,
        anomaly_score decimal(5,4),
        is_anomaly boolean NOT NULL DEFAULT false,
        anomaly_type varchar(50),
        anomaly_reason text,
        retention_period int,
        compliance_status varchar(50),
        gdpr_compliant boolean NOT NULL DEFAULT true,
        data_retention_policy varchar(100),
        device_info jsonb,
        location_info jsonb
      ) PARTITION BY RANGE (timestamp);

      -- Create partitions for the last 12 months and next 3 months
      CREATE TABLE audit_logs_2024_09 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

      CREATE TABLE audit_logs_2024_10 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

      CREATE TABLE audit_logs_2024_11 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

      CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

      CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

      CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

      CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

      CREATE TABLE audit_logs_2025_04 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

      CREATE TABLE audit_logs_2025_05 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

      CREATE TABLE audit_logs_2025_06 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

      CREATE TABLE audit_logs_2025_07 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

      CREATE TABLE audit_logs_2025_08 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

      -- Default partition for future dates
      CREATE TABLE audit_logs_future PARTITION OF audit_logs_partitioned
        DEFAULT;

      -- Create indexes on partitioned table
      CREATE INDEX idx_audit_logs_partitioned_user_timestamp ON audit_logs_partitioned (user_id, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_action_timestamp ON audit_logs_partitioned (action, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_resource_timestamp ON audit_logs_partitioned (resource, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_severity_timestamp ON audit_logs_partitioned (severity, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_school_timestamp ON audit_logs_partitioned (school_id, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_anomaly_timestamp ON audit_logs_partitioned (anomaly_score, timestamp);
      CREATE INDEX idx_audit_logs_partitioned_correlation_timestamp ON audit_logs_partitioned (correlation_id, timestamp);

      -- BRIN index for timestamp (efficient for large partitioned tables)
      CREATE INDEX idx_audit_logs_partitioned_timestamp_brin ON audit_logs_partitioned USING brin (timestamp);
    `);

    // Create partitioning for student_audit_logs table
    await queryRunner.query(`
      -- Create partitioned student_audit_logs table
      CREATE TABLE IF NOT EXISTS student_audit_logs_partitioned (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        student_id uuid NOT NULL,
        action student_audit_action_enum NOT NULL,
        entity_type student_audit_entity_type_enum NOT NULL,
        entity_id uuid NOT NULL,
        entity_name varchar(200),
        severity student_audit_severity_enum NOT NULL DEFAULT 'low',
        user_id uuid NOT NULL,
        user_name varchar(100) NOT NULL,
        user_role varchar(50) NOT NULL,
        user_department varchar(100),
        old_values jsonb,
        new_values jsonb,
        changed_fields jsonb NOT NULL DEFAULT '[]',
        change_description text NOT NULL,
        ip_address varchar(45),
        user_agent varchar(500),
        session_id varchar(100),
        device_info jsonb,
        location_info jsonb,
        academic_year varchar(20),
        grade_level varchar(50),
        section varchar(20),
        is_confidential boolean NOT NULL DEFAULT false,
        requires_parent_consent boolean NOT NULL DEFAULT false,
        parent_consent_obtained boolean,
        gdpr_compliant boolean NOT NULL DEFAULT true,
        data_retention_period int,
        audit_batch_id uuid,
        related_audit_ids jsonb NOT NULL DEFAULT '[]',
        audit_trail jsonb NOT NULL DEFAULT '[]',
        business_rules_violated jsonb NOT NULL DEFAULT '[]',
        compliance_issues jsonb NOT NULL DEFAULT '[]',
        risk_assessment jsonb,
        tags jsonb NOT NULL DEFAULT '[]',
        metadata jsonb,
        internal_notes text,
        external_notes text,
        created_at timestamp NOT NULL DEFAULT now(),
        -- New fields
        correlation_id varchar(100),
        school_id uuid,
        processed_at timestamp,
        is_archived boolean NOT NULL DEFAULT false,
        response_time int,
        memory_usage bigint,
        cpu_usage decimal(5,2),
        query_execution_time int,
        anomaly_score decimal(5,4),
        is_anomaly boolean NOT NULL DEFAULT false,
        anomaly_type varchar(50),
        anomaly_reason text,
        compliance_status varchar(50),
        data_retention_policy varchar(100)
      ) PARTITION BY RANGE (created_at);

      -- Create partitions for student audit logs
      CREATE TABLE student_audit_logs_2024_09 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

      CREATE TABLE student_audit_logs_2024_10 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

      CREATE TABLE student_audit_logs_2024_11 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

      CREATE TABLE student_audit_logs_2024_12 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

      CREATE TABLE student_audit_logs_2025_01 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

      CREATE TABLE student_audit_logs_2025_02 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

      CREATE TABLE student_audit_logs_2025_03 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

      CREATE TABLE student_audit_logs_2025_04 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

      CREATE TABLE student_audit_logs_2025_05 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

      CREATE TABLE student_audit_logs_2025_06 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

      CREATE TABLE student_audit_logs_2025_07 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

      CREATE TABLE student_audit_logs_2025_08 PARTITION OF student_audit_logs_partitioned
        FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

      -- Default partition for future dates
      CREATE TABLE student_audit_logs_future PARTITION OF student_audit_logs_partitioned
        DEFAULT;

      -- Create indexes on partitioned table
      CREATE INDEX idx_student_audit_logs_partitioned_student_created ON student_audit_logs_partitioned (student_id, created_at);
      CREATE INDEX idx_student_audit_logs_partitioned_action_created ON student_audit_logs_partitioned (action, created_at);
      CREATE INDEX idx_student_audit_logs_partitioned_entity ON student_audit_logs_partitioned (entity_type, entity_id);
      CREATE INDEX idx_student_audit_logs_partitioned_user_created ON student_audit_logs_partitioned (user_id, created_at);
      CREATE INDEX idx_student_audit_logs_partitioned_correlation_created ON student_audit_logs_partitioned (correlation_id, created_at);
      CREATE INDEX idx_student_audit_logs_partitioned_school_created ON student_audit_logs_partitioned (school_id, created_at);
      CREATE INDEX idx_student_audit_logs_partitioned_anomaly_created ON student_audit_logs_partitioned (anomaly_score, created_at);

      -- BRIN index for created_at
      CREATE INDEX idx_student_audit_logs_partitioned_created_brin ON student_audit_logs_partitioned USING brin (created_at);
    `);

    // Create triggers for automatic partitioning (optional - for future partitions)
    await queryRunner.query(`
      -- Function to create new partitions automatically
      CREATE OR REPLACE FUNCTION create_audit_partition_if_not_exists()
      RETURNS trigger AS $$
      DECLARE
        partition_name text;
        partition_start date;
        partition_end date;
      BEGIN
        partition_start := date_trunc('month', NEW.timestamp);
        partition_end := partition_start + interval '1 month';
        partition_name := 'audit_logs_' || to_char(partition_start, 'YYYY_MM');

        IF NOT EXISTS (
          SELECT 1 FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = partition_name AND n.nspname = 'public'
        ) THEN
          EXECUTE format(
            'CREATE TABLE %I PARTITION OF audit_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name, partition_start, partition_end
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger for audit_logs partitioning
      CREATE TRIGGER trigger_create_audit_partition
        BEFORE INSERT ON audit_logs_partitioned
        FOR EACH ROW EXECUTE FUNCTION create_audit_partition_if_not_exists();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trigger_create_audit_partition ON audit_logs_partitioned;
      DROP FUNCTION IF EXISTS create_audit_partition_if_not_exists();
    `);

    // Drop partitioned tables
    await queryRunner.query(`
      DROP TABLE IF EXISTS audit_logs_partitioned CASCADE;
      DROP TABLE IF EXISTS student_audit_logs_partitioned CASCADE;
    `);
  }
}