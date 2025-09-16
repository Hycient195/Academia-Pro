// Academia Pro - Student Promotion E2E Tests
// Integration tests for batch student promotion functionality

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { TestSeeder } from '../../../test/test-seeder';

describe('Student Promotion (E2E)', () => {
  let app: INestApplication;
  let testSeeder: TestSeeder;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    app.setGlobalPrefix('api/v1');

    const dataSource = app.get('DATA_SOURCE');
    testSeeder = new TestSeeder(dataSource);

    // Seed school and admin for authentication
    const { school } = await testSeeder.seed();
    const admin = await testSeeder.seedSchoolAdmin(school.id);

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: admin.email,
        password: 'testpassword',
      })
      .expect(200);

    adminToken = loginResponse.body.tokens.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testSeeder.clear();
  });

  describe('POST /api/v1/students/promotion', () => {
    it('should promote students by grade successfully', async () => {
      // Seed students in JSS3
      await testSeeder.seedSchoolWithStudents('JSS3', 3);

      const promotionData = {
        scope: 'grade',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'End of year promotion',
        includeRepeaters: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(3);
      expect(Array.isArray(response.body.studentIds)).toBe(true);
      expect(response.body.studentIds.length).toBe(3);

      // Verify students moved to SSS1
      const sss1Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      expect(sss1Students.body.data.length).toBe(3);

      // Verify no students left in JSS3
      const jss3Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'JSS3' })
        .expect(200);

      expect(jss3Students.body.data.length).toBe(0);
    });

    it('should promote students by section successfully', async () => {
      // Seed students in JSS3 section A and B
      await testSeeder.seedSchoolWithStudentsInSections('JSS3', ['A', 'B'], 2);

      const promotionData = {
        scope: 'section',
        gradeCode: 'JSS3',
        streamSection: 'A',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Section promotion',
        includeRepeaters: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(2);
      expect(response.body.studentIds.length).toBe(2);

      // Verify section A moved to SSS1
      const sss1Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      expect(sss1Students.body.data.length).toBe(2);

      // Verify section B still in JSS3
      const jss3BStudents = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'JSS3', streamSections: 'B' })
        .expect(200);

      expect(jss3BStudents.body.data.length).toBe(2);
    });

    it('should promote specific students successfully', async () => {
      // Seed 4 students
      const seededStudents = await testSeeder.seedSchoolWithStudents('JSS3', 4);

      const studentIdsToPromote = seededStudents.slice(0, 2).map((s: any) => s.id);

      const promotionData = {
        scope: 'students',
        studentIds: studentIdsToPromote,
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Selective promotion',
        includeRepeaters: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(2);
      expect(response.body.studentIds.length).toBe(2);

      // Verify selected promoted
      const sss1Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      expect(sss1Students.body.data.length).toBe(2);

      // Others remain in JSS3
      const jss3Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'JSS3' })
        .expect(200);

      expect(jss3Students.body.data.length).toBe(2);
    });

    it('should exclude repeaters when includeRepeaters is false', async () => {
      const seededStudents = await testSeeder.seedSchoolWithStudents('JSS3', 3);

      // Mark first student as repeater
      await request(app.getHttpServer())
        .patch(`/api/v1/students/${seededStudents[0].id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          academicStanding: { probation: true },
        })
        .expect(200);

      const promotionData = {
        scope: 'grade',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Promotion excluding repeaters',
        includeRepeaters: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(2);

      const sss1Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      expect(sss1Students.body.data.length).toBe(2);
    });

    it('should include repeaters when includeRepeaters is true', async () => {
      const seededStudents = await testSeeder.seedSchoolWithStudents('JSS3', 3);

      // Mark one as repeater
      await request(app.getHttpServer())
        .patch(`/api/v1/students/${seededStudents[0].id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          academicStanding: { probation: true },
        })
        .expect(200);

      const promotionData = {
        scope: 'grade',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Promotion including repeaters',
        includeRepeaters: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(3);

      const sss1Students = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      expect(sss1Students.body.data.length).toBe(3);
    });

    it('should update stage when crossing stage boundaries', async () => {
      // Seed JSS3 students (stage 'JSS')
      await testSeeder.seedSchoolWithStudents('JSS3', 2);

      const promotionData = {
        scope: 'grade',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Cross-stage promotion',
        includeRepeaters: false,
      };

      await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      const promotedStudents = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ gradeCodes: 'SSS1' })
        .expect(200);

      promotedStudents.body.data.forEach((student: any) => {
        expect(student.stage).toBe('SSS');
      });
    });

    it('should create promotion history records', async () => {
      const seededStudents = await testSeeder.seedSchoolWithStudents('JSS3', 1);
      const studentId = seededStudents[0].id;

      const promotionData = {
        scope: 'students',
        studentIds: [studentId],
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Test promotion history',
        includeRepeaters: false,
      };

      await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      const studentResponse = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const student = studentResponse.body;
      expect(student.promotionHistory.length).toBe(1);
      expect(student.promotionHistory[0].fromGrade).toBe('JSS3');
      expect(student.promotionHistory[0].toGrade).toBe('SSS1');
      expect(student.promotionHistory[0].academicYear).toBe('2025');
      expect(student.promotionHistory[0].reason).toBe('Test promotion history');
      expect(student.promotionHistory[0].timestamp).toBeDefined();
    });

    it('should return 401 for unauthorized access', async () => {
      const promotionData = {
        scope: 'grade',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
      };

      await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .send(promotionData)
        .expect(401);
    });

    it('should return 400 for invalid scope', async () => {
      const promotionData = {
        scope: 'invalid',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
      };

      await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const promotionData = {
        scope: 'grade',
        // missing targetGradeCode
        academicYear: '2025',
      };

      await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(400);
    });

    it('should handle empty selection for grade scope', async () => {
      const promotionData = {
        scope: 'grade',
        gradeCode: 'NONEXISTENT',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students/promotion')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData)
        .expect(200);

      expect(response.body.promotedStudents).toBe(0);
      expect(response.body.studentIds.length).toBe(0);
    });
  });