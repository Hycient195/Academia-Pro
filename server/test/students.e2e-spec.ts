import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseTestModule } from '../src/test/database-test.module';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let container: PostgreSqlContainer;

  beforeAll(async () => {
    // Start PostgreSQL container for testing
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseTestModule)
      .useModule(await DatabaseTestModule.forRoot())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Store container reference for cleanup
    app.setGlobalPrefix('api/v1');
  }, 60000); // Increase timeout for container startup

  afterAll(async () => {
    await app.close();
    if (container) {
      await container.stop();
    }
  });

  beforeEach(async () => {
    // Clean up data between tests
    // This would typically use a test seeder to reset database state
  });

  describe('/api/v1/students (GET)', () => {
    it('should return empty array when no students exist', () => {
      return request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('should return students when they exist', async () => {
      // First create a test student
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({
          firstName: 'Test',
          lastName: 'Student',
          dateOfBirth: '2005-01-01',
          gender: 'male',
          admissionNumber: 'TEST001',
          schoolId: 'test-school-id',
          stage: 'SSS',
          gradeCode: 'G10',
          streamSection: 'A',
          admissionDate: '2020-09-01',
          enrollmentType: 'regular',
        })
        .expect(201);

      // Then fetch all students
      return request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('firstName', 'Test');
          expect(res.body[0]).toHaveProperty('lastName', 'Student');
        });
    });
  });

  describe('/api/v1/students/:id (GET)', () => {
    it('should return 404 for non-existent student', () => {
      return request(app.getHttpServer())
        .get('/api/v1/students/non-existent-id')
        .expect(404);
    });

    it('should return student by id', async () => {
      // First create a test student
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '2005-05-15',
          gender: 'male',
          admissionNumber: 'TEST002',
          schoolId: 'test-school-id',
          stage: 'SSS',
          gradeCode: 'G10',
          streamSection: 'A',
          admissionDate: '2020-09-01',
          enrollmentType: 'regular',
        })
        .expect(201);

      const studentId = createResponse.body.id;

      // Then fetch the specific student
      return request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', studentId);
          expect(res.body).toHaveProperty('firstName', 'John');
          expect(res.body).toHaveProperty('lastName', 'Doe');
          expect(res.body).toHaveProperty('admissionNumber', 'TEST002');
        });
    });
  });

  describe('/api/v1/students (POST)', () => {
    it('should create a new student', () => {
      const studentData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '2006-03-20',
        gender: 'female',
        admissionNumber: 'TEST003',
        schoolId: 'test-school-id',
        stage: 'SSS',
        gradeCode: 'G9',
        streamSection: 'B',
        admissionDate: '2021-09-01',
        enrollmentType: 'regular',
      };

      return request(app.getHttpServer())
        .post('/api/v1/students')
        .send(studentData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('firstName', 'Jane');
          expect(res.body).toHaveProperty('lastName', 'Smith');
          expect(res.body).toHaveProperty('admissionNumber', 'TEST003');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidData = {
        // Missing required fields
        firstName: 'Invalid',
      };

      return request(app.getHttpServer())
        .post('/api/v1/students')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('/api/v1/students/:id (PUT)', () => {
    it('should update an existing student', async () => {
      // First create a test student
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({
          firstName: 'Update',
          lastName: 'Test',
          dateOfBirth: '2005-07-10',
          gender: 'male',
          admissionNumber: 'TEST004',
          schoolId: 'test-school-id',
          stage: 'SSS',
          gradeCode: 'G10',
          streamSection: 'A',
          admissionDate: '2020-09-01',
          enrollmentType: 'regular',
        })
        .expect(201);

      const studentId = createResponse.body.id;
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      // Update the student
      await request(app.getHttpServer())
        .put(`/api/v1/students/${studentId}`)
        .send(updateData)
        .expect(200);

      // Verify the update
      return request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('firstName', 'Updated');
          expect(res.body).toHaveProperty('lastName', 'Name');
        });
    });
  });

  describe('/api/v1/students/:id (DELETE)', () => {
    it('should delete an existing student', async () => {
      // First create a test student
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({
          firstName: 'Delete',
          lastName: 'Test',
          dateOfBirth: '2005-08-15',
          gender: 'female',
          admissionNumber: 'TEST005',
          schoolId: 'test-school-id',
          stage: 'SSS',
          gradeCode: 'G10',
          streamSection: 'A',
          admissionDate: '2020-09-01',
          enrollmentType: 'regular',
        })
        .expect(201);

      const studentId = createResponse.body.id;

      // Delete the student
      await request(app.getHttpServer())
        .delete(`/api/v1/students/${studentId}`)
        .expect(200);

      // Verify the student is deleted
      return request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .expect(404);
    });
  });
});