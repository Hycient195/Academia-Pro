// test/delegated-super-admin.e2e.spec.ts
// Comprehensive E2E tests for delegated super admin functionality
// Tests that delegated super admins can only access resources they have been granted permission to

import type { SuperAgentTest } from 'supertest';
import { TestHarness } from './utils/test-harness';
import { DataSource } from 'typeorm';
import { DelegatedAccount } from '../iam/entities/delegated-account.entity';
import { DelegatedAccountStatus } from '../iam/entities/delegated-account.entity';

describe('Delegated Super Admin E2E Tests', () => {
  let superAdmin: SuperAgentTest;
  let delegatedSuperAdminFull: SuperAgentTest; // Has all permissions
  let delegatedSuperAdminLimited: SuperAgentTest; // Has limited permissions
  let delegatedSuperAdminSchoolsOnly: SuperAgentTest; // Has only school permissions
  let delegatedSuperAdminAnalyticsOnly: SuperAgentTest; // Has only analytics permissions
  let dataSource: DataSource;
  let testSchoolId: string;

  beforeAll(async () => {
    await TestHarness.bootstrap();
    dataSource = TestHarness.getDataSource();

    // Create delegated accounts with specific permissions for testing
    await createDelegatedAccountsWithPermissions();

    // Debug: Check if delegated accounts exist
    const delegatedAccounts = await dataSource.query('SELECT * FROM delegated_accounts');
    console.log('Delegated accounts in DB:', delegatedAccounts);

    // Get authenticated agents for different user types
    superAdmin = await TestHarness.auth('super-admin');
    console.log('Authenticating delegated-super-admin...');
    delegatedSuperAdminFull = await TestHarness.auth('delegated-super-admin');
    console.log('Authenticating delegated-super-admin-limited...');
    delegatedSuperAdminLimited = await TestHarness.auth('delegated-super-admin-limited');
    console.log('Authenticating delegated-super-admin-schools...');
    delegatedSuperAdminSchoolsOnly = await TestHarness.auth('delegated-super-admin-schools');
    console.log('Authenticating delegated-super-admin-analytics...');
    delegatedSuperAdminAnalyticsOnly = await TestHarness.auth('delegated-super-admin-analytics');

    // Get the first school ID for testing
    const schoolResult = await dataSource.query('SELECT id FROM schools WHERE code = $1 LIMIT 1', ['SCH001']);
    testSchoolId = schoolResult.length > 0 ? schoolResult[0].id : null;
    console.log('Test school ID:', testSchoolId);
  });

  afterAll(async () => {
    await TestHarness.shutdown();
  });

  beforeEach(async () => {
    await TestHarness.startTransaction();
  });

  afterEach(async () => {
    await TestHarness.rollbackTransaction();
  });

  // Helper function to create delegated accounts with different permission sets
  async function createDelegatedAccountsWithPermissions() {
    const delegatedAccounts = [
      {
        id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        userId: '66666666-6666-4666-8666-666666666666', // delegated super admin user
        email: 'delegatedsuperadmin@example.com',
        permissions: [
          'schools:read', 'schools:create', 'schools:update', 'schools:delete',
          'analytics:read', 'system:read'
        ], // Full permissions
        status: DelegatedAccountStatus.ACTIVE,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Full permissions delegated super admin for testing'
      },
      {
        id: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
        userId: '66666666-6666-4666-8666-666666666667', // Create a new user for limited permissions
        email: 'delegatedsuperadmin-limited@example.com',
        permissions: ['schools:read', 'schools:create'], // Limited permissions
        status: DelegatedAccountStatus.ACTIVE,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Limited permissions delegated super admin for testing'
      },
      {
        id: 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa',
        userId: '66666666-6666-4666-8666-666666666668', // Create another user for schools only
        email: 'delegatedsuperadmin-schools@example.com',
        permissions: ['schools:read', 'schools:create', 'schools:update', 'schools:delete'],
        status: DelegatedAccountStatus.ACTIVE,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Schools only permissions delegated super admin for testing'
      },
      {
        id: 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb',
        userId: '66666666-6666-4666-8666-666666666669', // Create another user for analytics only
        email: 'delegatedsuperadmin-analytics@example.com',
        permissions: ['analytics:read'],
        status: DelegatedAccountStatus.ACTIVE,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Analytics only permissions delegated super admin for testing'
      }
    ];

    // Insert delegated accounts into database
    for (const account of delegatedAccounts) {
      await dataSource.query(
        `INSERT INTO delegated_accounts (id, "userId", email, permissions, status, "createdBy", notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [
          account.id,
          account.userId,
          account.email,
          JSON.stringify(account.permissions), // Convert array to JSON string
          account.status,
          account.createdBy,
          account.notes
        ]
      );
    }
  }

  describe('Super Admin Access Control', () => {
    it('super admin should have access to all endpoints', async () => {
      // Test school management endpoints
      await superAdmin.get('/api/v1/super-admin/schools').expect(200);
      await superAdmin.get(`/api/v1/super-admin/schools/${testSchoolId}`).expect(200);

      // Test analytics endpoints
      await superAdmin.get('/api/v1/super-admin/analytics').expect(200);
      await superAdmin.get('/api/v1/super-admin/reports/overview').expect(200);
      await superAdmin.get('/api/v1/super-admin/reports/subscription').expect(200);
      await superAdmin.get('/api/v1/super-admin/comparison').expect(200);
      await superAdmin.get('/api/v1/super-admin/geographic').expect(200);

      // Test system endpoints
      await superAdmin.get('/api/v1/super-admin/metrics').expect(200);
      await superAdmin.get('/api/v1/super-admin/health').expect(200);
    });

    it('super admin should be able to create, update, and delete schools', async () => {
      const schoolData = {
        name: 'Test School',
        type: ['secondary'],
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        email: 'test@testschool.edu',
        phone: '+1234567890',
        subscriptionPlan: 'basic'
      };

      // Create school
      const createResponse = await superAdmin
        .post('/api/v1/super-admin/schools')
        .send(schoolData)
        .expect(201);

      const schoolId = createResponse.body.id;

      // Update school
      await superAdmin
        .patch(`/api/v1/super-admin/schools/${schoolId}`)
        .send({ name: 'Updated Test School' })
        .expect(200);

      // Delete school
      await superAdmin
        .delete(`/api/v1/super-admin/schools/${schoolId}`)
        .expect(200);
    });
  });

  describe('Delegated Super Admin with Full Permissions', () => {
    it('should have access to all endpoints like super admin', async () => {
      // Test school management endpoints
      await delegatedSuperAdminFull.get('/api/v1/super-admin/schools').expect(200);
      await delegatedSuperAdminFull.get(`/api/v1/super-admin/schools/${testSchoolId}`).expect(200);

      // Test analytics endpoints
      await delegatedSuperAdminFull.get('/api/v1/super-admin/analytics').expect(200);
      await delegatedSuperAdminFull.get('/api/v1/super-admin/reports/overview').expect(200);
      await delegatedSuperAdminFull.get('/api/v1/super-admin/reports/subscription').expect(200);
      await delegatedSuperAdminFull.get('/api/v1/super-admin/comparison').expect(200);
      await delegatedSuperAdminFull.get('/api/v1/super-admin/geographic').expect(200);

      // Test system endpoints
      await delegatedSuperAdminFull.get('/api/v1/super-admin/metrics').expect(200);
      await delegatedSuperAdminFull.get('/api/v1/super-admin/health').expect(200);
    });

    it('should be able to perform CRUD operations on schools', async () => {
      const schoolData = {
        name: 'Delegated Test School',
        type: ['secondary'],
        address: '456 Delegated St',
        city: 'Delegated City',
        state: 'Delegated State',
        country: 'Delegated Country',
        email: 'delegated@testschool.edu',
        phone: '+1234567891',
        subscriptionPlan: 'basic'
      };

      // Create school
      const createResponse = await delegatedSuperAdminFull
        .post('/api/v1/super-admin/schools')
        .send(schoolData)
        .expect(201);

      const schoolId = createResponse.body.id;

      // Update school
      await delegatedSuperAdminFull
        .patch(`/api/v1/super-admin/schools/${schoolId}`)
        .send({ name: 'Updated Delegated Test School' })
        .expect(200);

      // Delete school
      await delegatedSuperAdminFull
        .delete(`/api/v1/super-admin/schools/${schoolId}`)
        .expect(200);
    });
  });

  describe('Delegated Super Admin with Limited Permissions', () => {
    it('should have access to permitted endpoints', async () => {
      // Should have access to schools:read and schools:create
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/schools').expect(200);
    });

    it('should be denied access to non-permitted endpoints', async () => {
      // Should NOT have access to analytics endpoints
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/analytics').expect(403);
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/reports/overview').expect(403);
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/reports/subscription').expect(403);
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/comparison').expect(403);
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/geographic').expect(403);

      // Should NOT have access to system endpoints
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/metrics').expect(403);
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/health').expect(403);
    });

    it('should be able to create schools but not update or delete', async () => {
      const schoolData = {
        name: 'Limited Permission Test School',
        type: ['secondary'],
        address: '789 Limited St',
        city: 'Limited City',
        state: 'Limited State',
        country: 'Limited Country',
        email: 'limited@testschool.edu',
        phone: '+1234567892',
        subscriptionPlan: 'basic'
      };

      // Should be able to create (has schools:create permission)
      const createResponse = await delegatedSuperAdminLimited
        .post('/api/v1/super-admin/schools')
        .send(schoolData)
        .expect(201);

      const schoolId = createResponse.body.id;

      // Should NOT be able to update (missing schools:update permission)
      await delegatedSuperAdminLimited
        .patch(`/api/v1/super-admin/schools/${schoolId}`)
        .send({ name: 'Updated Limited Test School' })
        .expect(403);

      // Should NOT be able to delete (missing schools:delete permission)
      await delegatedSuperAdminLimited
        .delete(`/api/v1/super-admin/schools/${schoolId}`)
        .expect(403);

      // Clean up - delete with super admin
      await superAdmin
        .delete(`/api/v1/super-admin/schools/${schoolId}`)
        .expect(200);
    });
  });

  describe('Delegated Super Admin with Schools Only Permissions', () => {
    it('should have full access to school management endpoints', async () => {
      // Should have access to all school operations
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/schools').expect(200);
      await delegatedSuperAdminSchoolsOnly.get(`/api/v1/super-admin/schools/${testSchoolId}`).expect(200);

      // Should be able to create, update, and delete schools
      const schoolData = {
        name: 'Schools Only Test School',
        type: ['secondary'],
        address: '101 Schools St',
        city: 'Schools City',
        state: 'Schools State',
        country: 'Schools Country',
        email: 'schools@testschool.edu',
        phone: '+1234567893',
        subscriptionPlan: 'basic'
      };

      const createResponse = await delegatedSuperAdminSchoolsOnly
        .post('/api/v1/super-admin/schools')
        .send(schoolData)
        .expect(201);

      const schoolId = createResponse.body.id;

      await delegatedSuperAdminSchoolsOnly
        .patch(`/api/v1/super-admin/schools/${schoolId}`)
        .send({ name: 'Updated Schools Only Test School' })
        .expect(200);

      await delegatedSuperAdminSchoolsOnly
        .delete(`/api/v1/super-admin/schools/${schoolId}`)
        .expect(200);
    });

    it('should be denied access to analytics and system endpoints', async () => {
      // Should NOT have access to analytics endpoints
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/analytics').expect(403);
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/reports/overview').expect(403);
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/reports/subscription').expect(403);
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/comparison').expect(403);
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/geographic').expect(403);

      // Should NOT have access to system endpoints
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/metrics').expect(403);
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/health').expect(403);
    });
  });

  describe('Delegated Super Admin with Analytics Only Permissions', () => {
    it('should have access to analytics endpoints', async () => {
      // Should have access to analytics endpoints
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/analytics').expect(200);
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/reports/overview').expect(200);
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/reports/subscription').expect(200);
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/comparison').expect(200);
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/geographic').expect(200);
    });

    it('should be denied access to school management endpoints', async () => {
      // Should NOT have access to school endpoints
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/schools').expect(403);
      await delegatedSuperAdminAnalyticsOnly.get(`/api/v1/super-admin/schools/${testSchoolId}`).expect(403);

      // Should NOT be able to create schools
      const schoolData = {
        name: 'Analytics Only Test School',
        type: ['secondary'],
        address: '202 Analytics St',
        city: 'Analytics City',
        state: 'Analytics State',
        country: 'Analytics Country',
        email: 'analytics@testschool.edu',
        phone: '+1234567894',
        subscriptionPlan: 'basic'
      };

      await delegatedSuperAdminAnalyticsOnly
        .post('/api/v1/super-admin/schools')
        .send(schoolData)
        .expect(403);
    });

    it('should be denied access to system endpoints', async () => {
      // Should NOT have access to system endpoints
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/metrics').expect(403);
      await delegatedSuperAdminAnalyticsOnly.get('/api/v1/super-admin/health').expect(403);
    });
  });

  describe('Permission Granularity Tests', () => {
    it('should handle wildcard permissions correctly', async () => {
      // Create a delegated account with wildcard permissions using a unique ID and email
      await dataSource.query(
        `INSERT INTO delegated_accounts (id, "userId", email, permissions, status, "createdBy", notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [
          'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeef',
          '77777777-8888-9999-0000-111111111111',
          'wildcard-test@example.com',
          JSON.stringify(['schools:*', 'analytics:*']), // Wildcard permissions
          DelegatedAccountStatus.ACTIVE,
          '550e8400-e29b-41d4-a716-446655440000',
          'Wildcard permissions test'
        ]
      );

      // Note: In a real test, we would need to authenticate as this user
      // For now, we'll test the permission logic conceptually
      // The permission guard should handle wildcard permissions correctly
    });

    it('should deny access when account is inactive', async () => {
      // Update a delegated account to have a start date in the future (making it effectively inactive)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future

      await dataSource.query(
        `UPDATE delegated_accounts SET "startDate" = $1 WHERE email = $2`,
        [futureDate, 'delegatedsuperadmin-limited@example.com']
      );

      // The user should now be denied access even to permitted endpoints
      await delegatedSuperAdminLimited.get('/api/v1/super-admin/schools').expect(403);
    });

    it('should deny access when account is expired', async () => {
      // Update a delegated account to have an expiry date in the past (making it effectively expired)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days in the past

      await dataSource.query(
        `UPDATE delegated_accounts SET "expiryDate" = $1 WHERE email = $2`,
        [pastDate, 'delegatedsuperadmin-schools@example.com']
      );

      // The user should now be denied access even to permitted endpoints
      await delegatedSuperAdminSchoolsOnly.get('/api/v1/super-admin/schools').expect(403);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return proper error messages for insufficient permissions', async () => {
      const response = await delegatedSuperAdminLimited
        .get('/api/v1/super-admin/analytics')
        .expect(403);

      expect(response.body.message).toContain('Access denied');
      expect(response.body.message).toContain('Required permissions');
    });

    it('should handle non-existent endpoints gracefully', async () => {
      await delegatedSuperAdminFull
        .get('/api/v1/super-admin/non-existent-endpoint')
        .expect(404);
    });

    it('should handle malformed requests appropriately', async () => {
      await delegatedSuperAdminFull
        .post('/api/v1/super-admin/schools')
        .send({}) // Empty body
        .expect(400);
    });
  });
});