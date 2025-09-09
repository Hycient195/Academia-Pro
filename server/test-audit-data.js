const axios = require('axios');

// Test script to generate audit data
async function generateTestAuditData() {
  const baseURL = 'http://localhost:3001';

  try {
    // First, login to get authentication
    console.log('Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/super-admin/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    }, {
      withCredentials: true
    });

    console.log('Login successful');

    // Extract cookies from response
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';

    // Make several API calls to generate audit logs
    console.log('Generating audit data...');

    const endpoints = [
      '/api/v1/super-admin/users',
      '/api/v1/super-admin/schools',
      '/api/v1/super-admin/reports/overview',
      '/api/v1/super-admin/audit/logs',
      '/api/v1/super-admin/audit/metrics'
    ];

    for (const endpoint of endpoints) {
      try {
        await axios.get(`${baseURL}${endpoint}`, {
          headers: {
            Cookie: cookieHeader
          },
          withCredentials: true
        });
        console.log(`Called ${endpoint}`);
      } catch (error) {
        console.log(`Error calling ${endpoint}:`, error.message);
      }
    }

    // Wait a moment for audit data to be flushed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test the audit endpoints
    console.log('Testing audit endpoints...');

    const auditLogsResponse = await axios.get(`${baseURL}/api/v1/super-admin/audit/logs?period=24h&page=1&limit=10`, {
      headers: {
        Cookie: cookieHeader
      },
      withCredentials: true
    });

    console.log('Audit logs response:', JSON.stringify(auditLogsResponse.data, null, 2));

    const auditMetricsResponse = await axios.get(`${baseURL}/api/v1/super-admin/audit/metrics?period=24h`, {
      headers: {
        Cookie: cookieHeader
      },
      withCredentials: true
    });

    console.log('Audit metrics response:', JSON.stringify(auditMetricsResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

generateTestAuditData();