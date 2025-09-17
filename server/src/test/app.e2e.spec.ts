// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import { startPostgresContainer, stopPostgresContainer } from './test-container.setup';
// import { AppTestModule } from './app-test.module';
import { TestSeederService } from './utils/test-seeder.service';
import { getAuthAgent } from './utils/auth.helper';
import { DatabaseTestModule } from './database-test.module';
import { startPostgresContainer, stopPostgresContainer } from './test-container.setup';

describe('School Management E2E (Testcontainers)', () => {
  let app: INestApplication;
  let seeder: TestSeederService;
  let seededData;
  let adminAgent;

  beforeAll(async () => {
    const dbConfig = await startPostgresContainer();

    // inject into env so AppTestModule picks it up
    process.env.TEST_DB_HOST = dbConfig.host;
    process.env.TEST_DB_PORT = dbConfig.port.toString();
    process.env.TEST_DB_USER = dbConfig.username;
    process.env.TEST_DB_PASS = dbConfig.password;
    process.env.TEST_DB_NAME = dbConfig.database;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      // imports: [AppTestModule],
      imports: [DatabaseTestModule],
      providers: [TestSeederService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    seeder = moduleFixture.get(TestSeederService);

    await seeder.clear();
    seededData = await seeder.seedAll();

    adminAgent = await getAuthAgent(app, 'super-admin'); // uses seeded user
  });

  afterAll(async () => {
    await app.close();
    await stopPostgresContainer();
  });

  it('Admin can fetch schools', async () => {
    const res = await adminAgent.get('/schools').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.map((s) => s.name)).toContain('Premium High School');
  });
});
