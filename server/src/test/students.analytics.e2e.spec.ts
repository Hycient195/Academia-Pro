// server/src/test/students.analytics.e2e.spec.ts
// E2E test to ensure /api/v1/students/statistics returns complete defaults when empty

import { TestHarness } from './utils/test-harness';
import type { SuperAgentTest } from 'supertest';
import { DataSource } from 'typeorm';

describe('Students Analytics Defaults (E2E)', () => {
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

  const api = (agent: SuperAgentTest) => ({
    stats: (q?: Record<string, any>) => agent.get('/api/v1/students/statistics').query(q ?? {}),
  });

  it('returns defaulted zero stats when there are no students', async () => {
    // Clear students to ensure empty analytics
    await ds.query('TRUNCATE TABLE students RESTART IDENTITY CASCADE;');

    // Optionally clear schools to validate behavior without schoolId filter
    // await ds.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE;');

    const res = await api(superAdmin).stats().expect(200);
    const body = res.body;

    expect(typeof body.totalStudents).toBe('number');
    expect(body.totalStudents).toBe(0);

    expect(typeof body.activeStudents).toBe('number');
    expect(body.activeStudents).toBe(0);

    expect(body).toHaveProperty('studentsByGrade');
    expect(typeof body.studentsByGrade).toBe('object');
    // Dynamic keys map by gradeCode; may be empty object when no data

    expect(body).toHaveProperty('studentsByStatus');
    expect(typeof body.studentsByStatus).toBe('object');
    // Verify presence of all statuses with zero
    const statusKeys = ['active', 'inactive', 'graduated', 'transferred', 'withdrawn', 'suspended'];
    for (const k of statusKeys) {
      expect(body.studentsByStatus).toHaveProperty(k);
      expect(body.studentsByStatus[k]).toBe(0);
    }

    expect(body).toHaveProperty('studentsByEnrollmentType');
    expect(typeof body.studentsByEnrollmentType).toBe('object');
    const types = ['regular', 'special_needs', 'gifted', 'international', 'transfer'];
    for (const t of types) {
      expect(body.studentsByEnrollmentType).toHaveProperty(t);
      expect(body.studentsByEnrollmentType[t]).toBe(0);
    }
  });
});