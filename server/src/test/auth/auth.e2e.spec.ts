// test/utils/auth.e2e.spec.ts - harness-based auth smoke tests with seeded users

import type { SuperAgentTest } from 'supertest';
import { TestHarness } from './test-harness';

describe('Auth E2E (seeded users, cookie sessions)', () => {
  let superAdmin: SuperAgentTest;
  let delegatedSuperAdmin: SuperAgentTest;
  let schoolAdmin: SuperAgentTest;
  let delegatedSchoolAdmin: SuperAgentTest;
  let staff: SuperAgentTest;
  let student: SuperAgentTest;
  let parent: SuperAgentTest;

  beforeAll(async () => {
    await TestHarness.bootstrap();
    superAdmin = await TestHarness.auth('super-admin');
    delegatedSuperAdmin = await TestHarness.auth('delegated-super-admin');
    schoolAdmin = await TestHarness.auth('school-admin');
    delegatedSchoolAdmin = await TestHarness.auth('delegated-school-admin');
    staff = await TestHarness.auth('staff');
    student = await TestHarness.auth('student');
    parent = await TestHarness.auth('parent');
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
    const res = await superAdmin.get('/api/v1/schools').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.map((s: any) => s.name)).toContain('Premium High School');
  });

  it('all user sessions are established', () => {
    // Smoke: ensure we acquired logged-in agents for all roles
    expect(superAdmin).toBeDefined();
    expect(delegatedSuperAdmin).toBeDefined();
    expect(schoolAdmin).toBeDefined();
    expect(delegatedSchoolAdmin).toBeDefined();
    expect(staff).toBeDefined();
    expect(student).toBeDefined();
    expect(parent).toBeDefined();
  });
});
