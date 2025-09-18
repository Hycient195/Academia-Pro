// test/utils/auth.helper.ts
import * as request from 'supertest';
import type { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { testUsers } from './test-users';

export async function getAuthAgent(app: INestApplication, role: keyof typeof testUsers): Promise<SuperAgentTest> {
  const agent = request.agent(app.getHttpServer()) as unknown as SuperAgentTest;
  const creds = testUsers[role];

  // All test apps use global prefix '/api/v1'
  if (['super-admin', 'delegated-super-admin', 'delegated-super-admin-limited', 'delegated-super-admin-schools', 'delegated-super-admin-analytics'].includes(role)) {
    // Prefer AuthController super admin endpoint to leverage shared cookie logic
    await agent
      .post('/api/v1/super-admin/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);
  } else {
    await agent
      .post('/api/v1/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);
  }

  return agent;
}