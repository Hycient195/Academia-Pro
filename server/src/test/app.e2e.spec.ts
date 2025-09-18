// test/app.e2e.spec.ts - unified harness-based E2E smoke and basic list test

import type { SuperAgentTest } from 'supertest';
import { TestHarness } from './utils/test-harness';

describe('School Management E2E (harness)', () => {
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

  it('boots the application with unified test factory', () => {
    expect(TestHarness.getApp()).toBeDefined();
  });

  it('super-admin can fetch students', async () => {
    const res = await superAdmin.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('delegated-super-admin can fetch students', async () => {
    const res = await delegatedSuperAdmin.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('school-admin can fetch students', async () => {
    const res = await schoolAdmin.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('delegated-school-admin can fetch students with permissions', async () => {
    const res = await delegatedSchoolAdmin.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('staff can fetch students', async () => {
    const res = await staff.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('student cannot fetch students', async () => {
    await student.get('/api/v1/students').expect(403);
  });

  it('parent cannot fetch students', async () => {
    await parent.get('/api/v1/students').expect(403);
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
