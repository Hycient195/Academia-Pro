// Simple test to check if Postgres service can be instantiated
const { Client } = require('pg');

async function testPostgres() {
  try {
    console.log('Testing Postgres connection...');

    console.log(process.env.DB_PASSWORD)

    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || "admin",
      database: process.env.DB_NAME || 'postgres',
    });

    // Connect
    await client.connect();

    // Test basic query
    const res = await client.query('SELECT NOW() as current_time');
    console.log('Postgres test successful: Current time is', res.rows[0].current_time);

    await client.end();

    console.log('✅ Postgres service test passed!');
  } catch (error) {
    console.error('❌ Postgres test failed:', error.message);
  }
}

testPostgres();
