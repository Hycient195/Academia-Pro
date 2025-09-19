// server/src/test/staff/department.analytics.e2e.spec.ts
// Verifies department stats endpoint returns default values when empty

import { TestHarness } from '../utils/test-harness';
import type { SuperAgentTest } from 'supertest';
import { DataSource } from 'typeorm';
import { EDepartmentType } from '@academia-pro/types/staff';

describe('Departments Analytics Defaults (E2E)', () => {
  let superAdmin: SuperAgentTest;
  let ds: DataSource;

  beforeAll(async () => {
    jest.setTimeout(120000);
    await TestHarness.bootstrap();
    superAdmin = await TestHarness.auth('super-admin');
    ds = TestHarness.getDataSource();
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

  function api(agent: SuperAgentTest) {
    return {
      stats: () => agent.get('/api/v1/departments/stats/overview'),
    };
  }

  it('returns zero-initialized stats when there are no departments', async () => {
    // Ensure empty dataset for departments
   await ds.query('TRUNCATE TABLE departments RESTART IDENTITY CASCADE;');

    const res = await api(superAdmin).stats().expect(200);
    const body = res.body;

    expect(typeof body.totalDepartments).toBe('number');
    expect(body.totalDepartments).toBe(0);
    expect(typeof body.averageStaffPerDepartment).toBe('number');
    expect(body.averageStaffPerDepartment).toBe(0);

    expect(body).toHaveProperty('departmentsByType');
    const allTypes = Object.values(EDepartmentType);
    for (const t of allTypes) {
      expect(body.departmentsByType).toHaveProperty(t);
      expect(body.departmentsByType[t]).toBe(0);
    }

    expect(Array.isArray(body.departmentsWithMostStaff)).toBe(true);
    expect(body.departmentsWithMostStaff.length).toBe(0);
  });
});