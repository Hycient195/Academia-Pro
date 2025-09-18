// test/utils/auth.e2e.spec.ts - harness-based auth smoke tests with seeded users

import type { SuperAgentTest } from 'supertest';
import { TestHarness } from './test-harness';

describe('Auth E2E (seeded users, cookie sessions)', () => {
  let superadmin: SuperAgentTest;
  let staff: SuperAgentTest;
  let student: SuperAgentTest;

  beforeAll(async () => {
    await TestHarness.bootstrap();
    superadmin = await TestHarness.auth('super-admin');
    staff = await TestHarness.auth('staff');
    student = await TestHarness.auth('student');
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

  it('super admin can list schools (seeded)', async () => {
    // Uses seeded school "Premium High School"
    const res = await superadmin.get('/api/v1/schools').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.map((s: any) => s.name)).toContain('Premium High School');
  });

  it('staff and student sessions are established', () => {
    // Smoke: ensure we acquired logged-in agents
    expect(staff).toBeDefined();
    expect(student).toBeDefined();
  });
});
