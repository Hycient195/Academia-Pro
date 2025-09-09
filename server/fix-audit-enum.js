// Script to fix audit enum mismatch
// Run with: node fix-audit-enum.js

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'academia_pro'
});

async function fixAuditEnum() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check current enum values
    const result = await client.query("SELECT enum_range(NULL::audit_logs_action_enum)");
    console.log('Current enum values:', result.rows[0].enum_range);

    // Add missing enum values
    const missingValues = [
      'authentication_success',
      'authentication_failed',
      'authorization_success',
      'authorization_failed',
      'user_created',
      'user_updated',
      'user_deleted',
      'user_blocked',
      'user_unblocked',
      'password_changed',
      'password_reset',
      'data_created',
      'data_updated',
      'data_deleted',
      'data_exported',
      'data_accessed',
      'security_config_changed',
      'audit_log_accessed',
      'suspicious_activity',
      'security_alert',
      'system_config_changed',
      'backup_created',
      'backup_restored',
      'maintenance_mode_enabled',
      'maintenance_mode_disabled',
      'api_key_created',
      'api_key_revoked',
      'webhook_created',
      'webhook_deleted',
      'integration_created',
      'integration_updated'
    ];

    for (const value of missingValues) {
      try {
        await client.query(`ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS '${value}'`);
        console.log(`Added enum value: ${value}`);
      } catch (error) {
        if (error.code === '42710') { // duplicate_object
          console.log(`Enum value already exists: ${value}`);
        } else {
          console.error(`Error adding ${value}:`, error.message);
        }
      }
    }

    // Verify the enum has been updated
    const updatedResult = await client.query("SELECT enum_range(NULL::audit_logs_action_enum)");
    console.log('Updated enum values:', updatedResult.rows[0].enum_range);

    console.log('Audit enum fix completed successfully');

  } catch (error) {
    console.error('Error fixing audit enum:', error);
  } finally {
    await client.end();
  }
}

fixAuditEnum();