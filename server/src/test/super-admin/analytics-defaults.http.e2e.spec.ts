// server/src/test/super-admin/analytics-defaults.http.e2e.spec.ts
// E2E tests using the unified TestHarness to ensure all super-admin analytics endpoints
// return a full, default-initialized shape when underlying data is empty.

import { TestHarness } from '../utils/test-harness';
import type { SuperAgentTest } from 'supertest';
import { DataSource } from 'typeorm';

describe('Super Admin Analytics Defaults (E2E via HTTP)', () => {
  let superAdmin: SuperAgentTest;
  let ds: DataSource;

  beforeAll(async () => {
    jest.setTimeout(120000);
    await TestHarness.bootstrap();
    ds = TestHarness.getDataSource();
  });

  afterAll(async () => {
    await TestHarness.shutdown();
  });

  beforeEach(async () => {
    await TestHarness.startTransaction();
    superAdmin = await TestHarness.auth('super-admin');
  });

  afterEach(async () => {
    await TestHarness.rollbackTransaction();
  });

  const api = (agent: SuperAgentTest) => ({
    overview: () => agent.get('/api/v1/super-admin/reports/overview'),
    subscription: () => agent.get('/api/v1/super-admin/reports/subscription'),
    comparison: () => agent.get('/api/v1/super-admin/comparison'),
    geographic: () => agent.get('/api/v1/super-admin/geographic'),
    analytics: (period?: string) =>
      period ? agent.get('/api/v1/super-admin/analytics').query({ period }) : agent.get('/api/v1/super-admin/analytics'),
  });

  it('reports/overview returns zero/defaults when schools are empty', async () => {
    // Clear all schools and dependent data to simulate empty system
    await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');
    // Reseed users and re-authenticate because TRUNCATE ... CASCADE wipes users table via FK cascade
    await TestHarness.getSeeder().seedUsers();
    superAdmin = await TestHarness.auth('super-admin');

    const res = await api(superAdmin).overview().expect(200);
    const body = res.body;

    expect(body).toHaveProperty('summary');
    expect(body.summary).toMatchObject({
      totalSchools: 0,
      activeSchools: 0,
      inactiveSchools: 0,
      totalStudents: 0,
      totalStaff: 0,
      totalCapacity: 0,
    });
    expect(typeof body.summary.occupancyRate).toBe('number');

    expect(body).toHaveProperty('subscriptionMetrics');
    expect(body.subscriptionMetrics).toHaveProperty('summary');
    expect(body.subscriptionMetrics.summary).toMatchObject({
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      expiringSoon: 0,
      totalSchools: 0,
      totalMonthlyRevenue: 0,
      totalAnnualRevenue: 0,
    });

    expect(body).toHaveProperty('distributions');
    expect(typeof body.distributions.schoolTypes).toBe('object');
    expect(typeof body.distributions.geographic).toBe('object');

    expect(body).toHaveProperty('performance');
    expect(typeof body.performance.averageUsersPerSchool).toBe('number');
    expect(typeof body.performance.averageStudentsPerSchool).toBe('number');
    expect(Array.isArray(body.performance.topPerformingSchools)).toBe(true);
  });

  it('reports/subscription returns zeros/empties by default', async () => {
    await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');
    // Reseed users and re-authenticate because TRUNCATE ... CASCADE wipes users table via FK cascade
    await TestHarness.getSeeder().seedUsers();
    superAdmin = await TestHarness.auth('super-admin');

    const res = await api(superAdmin).subscription().expect(200);
    const body = res.body;

    expect(body).toHaveProperty('subscriptionStatus');
    expect(body.subscriptionStatus).toMatchObject({
      active: 0,
      expired: 0,
      expiringSoon: 0,
      total: 0,
    });

    expect(typeof body.planDistribution).toBe('object');
    expect(body).toHaveProperty('revenue');
    expect(body.revenue).toMatchObject({
      monthly: 0,
      annual: 0,
    });

    expect(Array.isArray(body.atRiskSchools)).toBe(true);
    expect(Array.isArray(body.expiredSchools)).toBe(true);
  });

  it('comparison returns empty schools list and defaulted summary', async () => {
    await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');
    // Reseed users and re-authenticate because TRUNCATE ... CASCADE wipes users table via FK cascade
    await TestHarness.getSeeder().seedUsers();
    superAdmin = await TestHarness.auth('super-admin');

    const res = await api(superAdmin).comparison().expect(200);
    const body = res.body;

    expect(Array.isArray(body.schools)).toBe(true);
    expect(body.schools.length).toBe(0);

    expect(body).toHaveProperty('summary');
    expect(body.summary.totalSchools).toBe(0);
    expect(body.summary.averagePerformanceScore).toBe(0);
    expect(body.summary.topPerformer).toBeNull();
    expect(Array.isArray(body.summary.needsAttention)).toBe(true);
  });

  it('geographic returns defaulted objects and arrays', async () => {
    await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');
    // Reseed users and re-authenticate because TRUNCATE ... CASCADE wipes users table via FK cascade
    await TestHarness.getSeeder().seedUsers();
    superAdmin = await TestHarness.auth('super-admin');

    const res = await api(superAdmin).geographic().expect(200);
    const body = res.body;

    expect(body).toHaveProperty('distributions');
    expect(typeof body.distributions.countries).toBe('object');
    expect(typeof body.distributions.cities).toBe('object');

    expect(body).toHaveProperty('topLocations');
    expect(Array.isArray(body.topLocations.countries)).toBe(true);
    expect(Array.isArray(body.topLocations.cities)).toBe(true);

    expect(typeof body.regionalBreakdown).toBe('object');
  });

  it('analytics returns zeros when no schools exist', async () => {
    await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');
    // Reseed users and re-authenticate because TRUNCATE ... CASCADE wipes users table via FK cascade
    await TestHarness.getSeeder().seedUsers();
    superAdmin = await TestHarness.auth('super-admin');

    const res = await api(superAdmin).analytics('30d').expect(200);
    const body = res.body;

    expect(body).toHaveProperty('schools');
    expect(body.schools).toMatchObject({
      total: 0,
      active: 0,
      growth: 0,
    });

    expect(body).toHaveProperty('users');
    expect(body.users).toMatchObject({
      total: 0,
      active: 0,
      growth: 0,
    });

    expect(body).toHaveProperty('revenue');
    expect(body.revenue).toMatchObject({
      total: 0,
      growth: 0,
      subscriptions: 0,
    });

    expect(body).toHaveProperty('performance');
    expect(typeof body.performance.avgResponseTime).toBe('number');
    expect(typeof body.performance.uptime).toBe('number');
    expect(typeof body.performance.errorRate).toBe('number');
  });
});