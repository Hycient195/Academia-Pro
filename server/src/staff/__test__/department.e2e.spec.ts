import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TestSeederService } from './utils/test-seeder.service';
import { getAuthAgent } from './utils/auth.helper';

describe('School Management E2E', () => {
  let app: INestApplication;
  let seeder: TestSeederService;
  let seededData: Awaited<ReturnType<TestSeederService['seedAll']>>;
  let adminAgent, teacherAgent, studentAgent;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestSeederService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    seeder = moduleFixture.get(TestSeederService);

    await seeder.clear();
    seededData = await seeder.seedAll();

    adminAgent = await getAuthAgent(app, 'admin');
    teacherAgent = await getAuthAgent(app, 'teacher');
    studentAgent = await getAuthAgent(app, 'student');
  });

  afterAll(async () => {
    await app.close();
  });

  it('Admin can see all schools', async () => {
    const res = await adminAgent.get('/schools').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.map((s) => s.name)).toContain('Premium High School');
  });

  it('Student can see their school', async () => {
    const res = await studentAgent.get('/students/me').expect(200);
    expect(res.body.email).toBe('student@example.com'); // seeded user
  });

  it('Teacher can fetch departments of a school', async () => {
    const res = await teacherAgent
      .get(`/schools/${seededData.schools[0].id}/departments`)
      .expect(200);

    expect(res.body.map((d) => d.name)).toEqual(
      expect.arrayContaining(['Mathematics', 'Science']),
    );
  });
});
