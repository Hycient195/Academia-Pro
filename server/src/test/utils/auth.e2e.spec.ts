import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestSeederService } from './test-seeder.service';
import { AppModule } from 'src/app.module';
import { getAuthAgent } from './auth.helper';
// import { AppModule } from '../src/app.module';
// import { TestSeederService } from './utils/test-seeder.service';
// import { getAuthAgent } from './utils/auth.helper';

describe('E2E with Seeded Users & Cookie Auth', () => {
  let app: INestApplication;
  let seeder: TestSeederService;
  let superadminAgent, staffAgent, studentAgent;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestSeederService], // expose seeder
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    seeder = moduleFixture.get(TestSeederService);

    // reset DB users table
    await seeder.clear();
    await seeder.seedUsers();

    // login once per role
    superadminAgent = await getAuthAgent(app, 'super-admin');
    staffAgent = await getAuthAgent(app, 'staff');
    studentAgent = await getAuthAgent(app, 'student');
  });

  afterAll(async () => {
    await app.close();
  });

  it('Admin can create a school', async () => {
    const res = await superadminAgent
      .post('/schools')
      .send({ name: 'Premium High School', code: 'SCH123' })
      .expect(201);

    expect(res.body.name).toBe('Premium High School');
  });

  it('Teacher cannot create a school', async () => {
    await staffAgent
      .post('/schools')
      .send({ name: 'Another School', code: 'SCH456' })
      .expect(403);
  });

  it('Student can fetch their profile', async () => {
    const res = await studentAgent.get('/students/me').expect(200);
    expect(res.body.email).toBe('student@example.com');
  });
});
