// test/utils/auth.helper.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { testUsers } from './test-users';

export async function getAuthAgent(app: INestApplication, role: keyof typeof testUsers) {
  const agent = request.agent(app.getHttpServer());
  const creds = testUsers[role];

  if (['super-admin', 'delegated-super-admin'].includes(role)) {
    await agent.post('/auth/super-admin/login')
        .send({ email: creds.email, password: creds.password })
        .expect(201);
  } else {
    await agent.post('/auth/login')
        .send({ email: creds.email, password: creds.password })
        .expect(201);
  }

  return agent;
}