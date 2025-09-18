// test/app.e2e.spec.ts - unified harness-based E2E smoke and basic list test

import type { SuperAgentTest } from 'supertest';
import { TestHarness } from './utils/test-harness';

describe('School Management E2E (harness)', () => {
  let admin: SuperAgentTest;

  beforeAll(async () => {
    await TestHarness.bootstrap();
    admin = await TestHarness.auth('super-admin');
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

  it('admin can fetch students', async () => {
    const res = await admin.get('/api/v1/students').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
