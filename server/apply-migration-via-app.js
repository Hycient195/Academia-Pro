const { Client } = require('pg');

// Database configuration
const config = {
  host: 'localhost',
  port: 5432,
  user: 'postgres', // Use postgres admin user
  password: 'admin',
  database: 'academia_pro'
};

async function applyMigration() {
  const client = new Client(config);

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Check current enum values
    console.log('Checking current audit_logs_action_enum values...');
    const result = await client.query(`
      SELECT enumtypid::regtype AS enum_type, enumlabel
      FROM pg_enum
      WHERE enumtypid::regtype::text = 'audit_logs_action_enum'
      ORDER BY enumsortorder;
    `);

    console.log('Current enum values:', result.rows.map(row => row.enumlabel));

    // Add missing enum value
    console.log('Adding AUTHENTICATION_SUCCESS to enum...');
    await client.query(`
      ALTER TYPE audit_logs_action_enum ADD VALUE IF NOT EXISTS 'AUTHENTICATION_SUCCESS';
    `);

    console.log('Migration applied successfully!');

    // Verify the enum was updated
    const updatedResult = await client.query(`
      SELECT enumtypid::regtype AS enum_type, enumlabel
      FROM pg_enum
      WHERE enumtypid::regtype::text = 'audit_logs_action_enum'
      ORDER BY enumsortorder;
    `);

    console.log('Updated enum values:', updatedResult.rows.map(row => row.enumlabel));

  } catch (error) {
    console.error('Error applying migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

applyMigration();