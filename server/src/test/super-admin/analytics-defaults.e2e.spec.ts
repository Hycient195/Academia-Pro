// server/src/test/super-admin/analytics-defaults.e2e.spec.ts
// Integration-style tests (Nest TestingModule) to verify default responses for Super Admin analytics endpoints
// when the underlying analytics or school data is empty/missing. We mock the dependencies to simulate emptiness.

import { SuperAdminController } from '../../super-admin/super-admin.controller';

// Create minimal mocks for the services the controller depends on
class MockSchoolContextService {
  // Simulate no schools
  async getAllSchools() {
    return [];
  }
}

class MockCrossSchoolReportingService {
  // Simulate undefined/empty payloads so controller defaults are exercised
  async generateCrossSchoolAnalytics() {
    return undefined as any; // triggers defaulting in controller
  }
  async generateSubscriptionReport() {
    return undefined as any; // triggers defaulting in controller
  }
  async generateSchoolComparisonReport(_: string[] | undefined) {
    return undefined as any; // controller should handle to []
  }
  async generateGeographicReport() {
    return undefined as any; // controller should handle to empty objects/arrays
  }
}

describe('SuperAdmin Analytics Defaults (Integration via controller)', () => {
  let controller: SuperAdminController;

  beforeAll(async () => {
    // Directly instantiate controller with plain mocks to avoid DI/guard instantiation
    const schoolContextService = new MockSchoolContextService();
    const crossSchoolReportingService = new MockCrossSchoolReportingService();
    controller = new SuperAdminController(
      schoolContextService as any,
      crossSchoolReportingService as any
    );
  });

  it('getSystemOverview returns full defaulted shape when analytics are missing', async () => {
    const res = await controller.getSystemOverview();

    expect(res).toHaveProperty('summary');
    expect(typeof res.summary.totalSchools).toBe('number');
    expect(res.summary.totalSchools).toBe(0);
    expect(typeof res.summary.activeSchools).toBe('number');
    expect(res.summary.activeSchools).toBe(0);
    expect(typeof res.summary.inactiveSchools).toBe('number');
    expect(res.summary.inactiveSchools).toBe(0);
    expect(typeof res.summary.totalStudents).toBe('number');
    expect(res.summary.totalStudents).toBe(0);
    expect(typeof res.summary.totalStaff).toBe('number');
    expect(res.summary.totalStaff).toBe(0);
    expect(typeof res.summary.totalCapacity).toBe('number');
    expect(res.summary.totalCapacity).toBe(0);
    expect(typeof res.summary.occupancyRate).toBe('number');
    expect(res.summary.occupancyRate).toBe(0);

    expect(res).toHaveProperty('subscriptionMetrics');
    expect(res.subscriptionMetrics).toHaveProperty('summary');
    expect(res.subscriptionMetrics.summary).toMatchObject({
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      expiringSoon: 0,
      totalSchools: 0,
      totalMonthlyRevenue: 0,
      totalAnnualRevenue: 0,
    });

    expect(res).toHaveProperty('distributions');
    expect(res.distributions.schoolTypes).toBeDefined();
    expect(typeof res.distributions.schoolTypes).toBe('object');
    expect(res.distributions.geographic).toBeDefined();
    expect(typeof res.distributions.geographic).toBe('object');

    expect(res).toHaveProperty('performance');
    expect(typeof res.performance.averageUsersPerSchool).toBe('number');
    expect(typeof res.performance.averageStudentsPerSchool).toBe('number');
    expect(Array.isArray(res.performance.topPerformingSchools)).toBe(true);
  });

  it('getSubscriptionAnalytics returns zeros and empty collections by default', async () => {
    const res = await controller.getSubscriptionAnalytics();

    expect(res).toHaveProperty('subscriptionStatus');
    expect(res.subscriptionStatus).toMatchObject({
      active: 0,
      expired: 0,
      expiringSoon: 0,
      total: 0,
    });

    expect(res).toHaveProperty('planDistribution');
    expect(typeof res.planDistribution).toBe('object');

    expect(res).toHaveProperty('revenue');
    expect(res.revenue).toMatchObject({
      monthly: 0,
      annual: 0,
    });

    expect(Array.isArray(res.atRiskSchools)).toBe(true);
    expect(Array.isArray(res.expiredSchools)).toBe(true);
  });

  it('getSchoolComparison returns an empty list and defaulted summary', async () => {
    const res = await controller.getSchoolComparison(undefined);

    expect(Array.isArray(res.schools)).toBe(true);
    expect(res.schools.length).toBe(0);

    expect(res).toHaveProperty('summary');
    expect(res.summary).toMatchObject({
      totalSchools: 0,
      averagePerformanceScore: 0,
    });
    expect(res.summary.topPerformer).toBeNull();
    expect(Array.isArray(res.summary.needsAttention)).toBe(true);
  });

  it('getGeographicReport returns defaulted empty objects/arrays', async () => {
    const res = await controller.getGeographicReport();

    expect(res).toHaveProperty('distributions');
    expect(typeof res.distributions.countries).toBe('object');
    expect(typeof res.distributions.cities).toBe('object');

    expect(res).toHaveProperty('topLocations');
    expect(Array.isArray(res.topLocations.countries)).toBe(true);
    expect(Array.isArray(res.topLocations.cities)).toBe(true);

    expect(typeof res.regionalBreakdown).toBe('object');
  });

  it('getSystemAnalytics returns zeros when there are no schools (noData)', async () => {
    const res = await controller.getSystemAnalytics('7d');

    expect(res).toHaveProperty('schools');
    expect(res.schools).toMatchObject({
      total: 0,
      active: 0,
      growth: 0,
    });

    expect(res).toHaveProperty('users');
    expect(res.users).toMatchObject({
      total: 0,
      active: 0,
      growth: 0,
    });

    expect(res).toHaveProperty('revenue');
    expect(res.revenue).toMatchObject({
      total: 0,
      growth: 0,
      subscriptions: 0,
    });

    expect(res).toHaveProperty('performance');
    expect(typeof res.performance.avgResponseTime).toBe('number');
    expect(typeof res.performance.uptime).toBe('number');
    expect(typeof res.performance.errorRate).toBe('number');
  });
});