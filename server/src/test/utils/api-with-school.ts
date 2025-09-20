// test/utils/api-with-school.ts
// Helper to wrap SuperTest agents and automatically inject x-school-id for every request

import type { SuperAgentTest } from 'supertest';

export const SCHOOL_ID_HEADER = 'x-school-id';

export function withSchoolHeader(agent: SuperAgentTest, schoolId: string): SuperAgentTest {
  const target = agent as any;

  // Return a Proxy that injects x-school-id on HTTP verb methods
  return new Proxy(target, {
    get(t, prop, receiver) {
      if (typeof prop === 'string' && ['get', 'post', 'put', 'patch', 'delete', 'head'].includes(prop)) {
        return (path: string) => {
          const req = t[prop](path);
          return req.set(SCHOOL_ID_HEADER, schoolId);
        };
      }
      return Reflect.get(t, prop, receiver);
    },
  }) as unknown as SuperAgentTest;
}