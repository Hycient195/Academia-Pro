// test/utils/auth.helper.ts
import * as request from 'supertest';
import type { SuperAgentTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { testUsers } from './test-users';

export async function getAuthAgent(app: INestApplication, role: keyof typeof testUsers): Promise<SuperAgentTest> {
  const agent = request.agent(app.getHttpServer()) as unknown as SuperAgentTest;
  const creds = testUsers[role];

  console.log(`Authenticating user with role: ${role}, email: ${creds.email}`);

  // All test apps use global prefix '/api/v1'
  if (['super-admin', 'delegated-super-admin', 'delegated-super-admin-limited', 'delegated-super-admin-schools', 'delegated-super-admin-analytics'].includes(role)) {
    // Use AuthController super admin login to ensure cookies are set with proper names
    const response = await agent
      .post('/api/v1/auth/super-admin/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);

    console.log(`Authentication response for ${role}:`, response.body);
  } else {
    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email: creds.email, password: creds.password })
      .expect(200);

    console.log(`Authentication response for ${role}:`, response.body);
  }

  return agent;
}