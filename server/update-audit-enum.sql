-- Update audit_logs_action_enum to include missing values
-- Run this script directly in PostgreSQL

-- First, check current enum values
SELECT enum_range(NULL::audit_logs_action_enum);

-- Add missing enum values
ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'authentication_success';
ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'authentication_failed';
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

-- Verify the enum has been updated
SELECT enum_range(NULL::audit_logs_action_enum);