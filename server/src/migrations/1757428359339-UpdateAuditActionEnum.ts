import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAuditActionEnum1757428359339 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add missing enum values to audit_logs_action_enum
        await queryRunner.query(`
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'authentication_success';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'authorization_success';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'authorization_failed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'user_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'user_updated';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'user_deleted';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'user_blocked';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'user_unblocked';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'password_changed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'password_reset';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'data_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'data_updated';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'data_deleted';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'data_exported';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'data_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'security_config_changed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_log_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'suspicious_activity';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'security_alert';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'system_config_changed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'backup_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'backup_restored';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'maintenance_mode_enabled';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'maintenance_mode_disabled';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'api_key_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'api_key_revoked';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'webhook_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'webhook_deleted';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'integration_created';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'integration_updated';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_logs_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_logs_searched';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_metrics_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_dashboard_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_trends_accessed';
            ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'audit_anomalies_accessed';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values directly
        // This migration is irreversible
        // In production, you would need to recreate the enum without the values
    }

}
