// server/src/students/__test__/student.e2e.spec.ts
// Comprehensive E2E tests for Student flows

import { TestHarness } from './utils/test-harness';
import { DataSource, Repository } from 'typeorm';
import request, { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import { Student, StudentStatus, EnrollmentType } from '../students/student.entity';
import { TStudentStage, TGradeCode } from '@academia-pro/types/student/student.types';

describe('Students E2E', () => {
  let superAdmin: SuperAgentTest;
  let delegatedSuperAdmin: SuperAgentTest;
  let schoolAdmin: SuperAgentTest;
  let delegatedSchoolAdmin: SuperAgentTest;
  let staff: SuperAgentTest;
  let student: SuperAgentTest;
  let parent: SuperAgentTest;
  let ds: DataSource;
  let schoolId: string;

  beforeAll(async () => {
    jest.setTimeout(120000);
    await TestHarness.bootstrap();
    superAdmin = await TestHarness.auth('super-admin');
    delegatedSuperAdmin = await TestHarness.auth('delegated-super-admin');
    schoolAdmin = await TestHarness.auth('school-admin');
    delegatedSchoolAdmin = await TestHarness.auth('delegated-school-admin');
    staff = await TestHarness.auth('staff');
    student = await TestHarness.auth('student');
    parent = await TestHarness.auth('parent');
    ds = TestHarness.getDataSource();
  });

  afterAll(async () => {
    await TestHarness.shutdown();
  });

  beforeEach(async () => {
    await TestHarness.startTransaction();

    const rows = await ds.query('SELECT id FROM schools LIMIT 1');
    schoolId = rows?.[0]?.id;
    expect(schoolId).toBeDefined();
    console.log('Using schoolId:', schoolId);
  });

  afterEach(async () => {
    await TestHarness.rollbackTransaction();
  });

  // Helpers
  async function createStudentRecord(overrides: Partial<Student> = {}): Promise<Student> {
    const repo: Repository<Student> = ds.getRepository(Student);
    const now = Date.now();
    const baseAdmissionNumber = `ADM${new Date().getFullYear()}${(now % 100000).toString().padStart(5, '0')}`;

    const entity = repo.create({
      schoolId,
      admissionNumber: baseAdmissionNumber,
      currentGrade: 'Primary 1',
      currentSection: 'A',
      firstName: 'Test',
      lastName: `Student${now}`,
      middleName: 'Middle',
      dateOfBirth: new Date('2005-01-01'),
      gender: 'male',
      email: `test.student.${now}@example.test`,
      phone: '+10000000000',
      address: {
        street: '1 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '00000',
        country: 'TC',
      },
      stage: TStudentStage.PRY,
      gradeCode: 'PRY1',
      streamSection: 'A',
      isBoarding: false,
      admissionDate: new Date('2024-01-01'),
      enrollmentType: EnrollmentType.REGULAR,
      status: StudentStatus.ACTIVE,
      parentInfo: {
        fatherFirstName: 'Father',
        fatherLastName: 'Test',
        fatherPhone: '+10000000001',
        motherFirstName: 'Mother',
        motherLastName: 'Test',
        motherPhone: '+10000000002',
      },
      medicalInfo: {
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContact: {
          firstName: 'Emergency',
          lastName: 'Contact',
          phone: '+10000000003',
          relation: 'Uncle',
        },
      },
      transportation: {
        required: false,
      },
      hostel: {
        required: false,
      },
      financialInfo: {
        feeCategory: 'Standard',
        outstandingBalance: 0,
      },
      documents: [],
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true,
          parentCommunication: true,
        },
        extracurricular: [],
      },
      promotionHistory: [],
      transferHistory: [],
      academicStanding: {},
      createdBy: randomUUID(),
      updatedBy: randomUUID(),
      ...overrides,
    });

    const saved = await repo.save(entity);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  function api(serverAgent: SuperAgentTest) {
    return {
      list: (q?: Record<string, any>) => serverAgent.get('/api/v1/students').query(q ?? {}),
      search: (q?: Record<string, any>) => serverAgent.get('/api/v1/students/search').query(q ?? {}),
      byGrade: (schoolId: string, gradeCode: string) => serverAgent.get(`/api/v1/students/by-grade/${schoolId}/${gradeCode}`),
      bySection: (schoolId: string, gradeCode: string, section: string) => serverAgent.get(`/api/v1/students/by-section/${schoolId}/${gradeCode}/${section}`),
      get: (id: string) => serverAgent.get(`/api/v1/students/${id}`),
      byAdmission: (admissionNumber: string) => serverAgent.get(`/api/v1/students/admission/${admissionNumber}`),
      create: (body: any) => serverAgent.post('/api/v1/students').send(body),
      update: (id: string, body: any) => serverAgent.patch(`/api/v1/students/${id}`).send(body),
      updateStatus: (id: string, status: StudentStatus, reason?: string) =>
        serverAgent.patch(`/api/v1/students/${id}/status`).send({ status, reason }),
      transfer: (id: string, body: any) => serverAgent.patch(`/api/v1/students/${id}/transfer`).send(body),
      graduate: (id: string, body: any) => serverAgent.post(`/api/v1/students/${id}/graduate`).send(body),
      assignClass: (id: string, body: any) => serverAgent.post(`/api/v1/students/${id}/assign-class`).send(body),
      addDocument: (id: string, body: any) => serverAgent.post(`/api/v1/students/${id}/documents`).send(body),
      updateMedical: (id: string, body: any) => serverAgent.patch(`/api/v1/students/${id}/medical-info`).send(body),
      updateFinancial: (id: string, body: any) => serverAgent.patch(`/api/v1/students/${id}/financial-info`).send(body),
      remove: (id: string) => serverAgent.delete(`/api/v1/students/${id}`),
      stats: (q?: Record<string, any>) => serverAgent.get('/api/v1/students/statistics').query(q ?? {}),
    };
  }

  it('staff can list, filter, search, and paginate students', async () => {
    const a = api(staff);

    // Create some test students first
    const schoolAdminApi = api(schoolAdmin);
    const student1 = await schoolAdminApi.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: '2005-01-01',
      gender: 'female',
      stage: TStudentStage.PRY,
      gradeCode: 'PRY1',
      streamSection: 'A',
      admissionDate: '2024-01-01',
      schoolId,
      email: `alice.${Date.now()}@example.test`,
      parentInfo: {
        fatherFirstName: 'Father',
        fatherLastName: 'Test',
        fatherPhone: '+10000000001',
        motherFirstName: 'Mother',
        motherLastName: 'Test',
        motherPhone: '+10000000002',
      },
      medicalInfo: {
        emergencyContact: {
          firstName: 'Emergency',
          lastName: 'Contact',
          phone: '+10000000003',
          relation: 'Uncle',
        },
      },
    }).expect(201);

    const student2 = await schoolAdminApi.create({
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '2005-01-01',
      gender: 'male',
      stage: TStudentStage.PRY,
      gradeCode: 'PRY2',
      streamSection: 'B',
      admissionDate: '2024-01-01',
      schoolId,
      email: `bob.${Date.now()}@example.test`,
      parentInfo: {
        fatherFirstName: 'Father',
        fatherLastName: 'Test',
        fatherPhone: '+10000000001',
        motherFirstName: 'Mother',
        motherLastName: 'Test',
        motherPhone: '+10000000002',
      },
      medicalInfo: {
        emergencyContact: {
          firstName: 'Emergency',
          lastName: 'Contact',
          phone: '+10000000003',
          relation: 'Uncle',
        },
      },
    }).expect(201);

    const resAll = await a.list().expect(200);
    expect(resAll.body.data).toBeDefined();
    expect(Array.isArray(resAll.body.data)).toBe(true);
    expect(resAll.body.data.length).toBeGreaterThan(0);

    // Filter by stage
    const resStage = await a.list({ stages: ['PRY'] }).expect(200);
    expect(resStage.body.data.length).toBeGreaterThan(0);
    for (const s of resStage.body.data) {
      expect(s.stage).toBe('PRY');
    }

    // Filter by grade code
    const resGrade = await a.list({ gradeCodes: ['PRY1'] }).expect(200);
    expect(resGrade.body.data.length).toBeGreaterThan(0);
    for (const s of resGrade.body.data) {
      expect(s.gradeCode).toBe('PRY1');
    }

    // Filter by status
    const resStatus = await a.list({ statuses: ['active'] }).expect(200);
    expect(resStatus.body.data.length).toBeGreaterThan(0);
    for (const s of resStatus.body.data) {
      expect(s.status).toBe('active');
    }

    // Search by name
    const resSearch = await a.list({ search: 'Alice' }).expect(200);
    expect(resSearch.body.data.some((s: any) => /Alice/i.test(s.firstName))).toBe(true);

    // Pagination
    const resPaginated = await a.list({ limit: 1, offset: 1 }).expect(200);
    expect(Array.isArray(resPaginated.body.data)).toBe(true);
    expect(resPaginated.body.data.length).toBe(1);
  });

  it('search endpoint works with different criteria', async () => {
    const a = api(staff);

    // Create a test student first
    const schoolAdminApi = api(schoolAdmin);
    await schoolAdminApi.create({
      firstName: 'Searchable',
      lastName: 'Student',
      dateOfBirth: '2005-01-01',
      gender: 'male',
      stage: TStudentStage.PRY,
      gradeCode: 'PRY1',
      streamSection: 'A',
      admissionDate: '2024-01-01',
      schoolId,
      email: `searchable.${Date.now()}@example.test`,
      parentInfo: {
        fatherFirstName: 'Father',
        fatherLastName: 'Test',
        fatherPhone: '+10000000001',
        motherFirstName: 'Mother',
        motherLastName: 'Test',
        motherPhone: '+10000000002',
      },
      medicalInfo: {
        emergencyContact: {
          firstName: 'Emergency',
          lastName: 'Contact',
          phone: '+10000000003',
          relation: 'Uncle',
        },
      },
    }).expect(201);

    // Search by query
    const resSearch = await a.search({ query: 'Searchable', schoolId }).expect(200);
    expect(Array.isArray(resSearch.body)).toBe(true);
    expect(resSearch.body.length).toBeGreaterThan(0);
  });

  it('get by grade and section endpoints work', async () => {
    const a = api(staff);

    const resGrade = await a.byGrade(schoolId, 'PRY1').expect(200);
    expect(Array.isArray(resGrade.body)).toBe(true);

    const resSection = await a.bySection(schoolId, 'PRY1', 'A').expect(200);
    expect(Array.isArray(resSection.body)).toBe(true);
  });

  it('get by id and admission number work; 404 for non-existent', async () => {
    const a = api(staff);
    const list = await a.list().expect(200);
    const anyStudent = list.body.data[0];

    const ok = await a.get(anyStudent.id).expect(200);
    expect(ok.body.id).toBe(anyStudent.id);

    const okAdmission = await a.byAdmission(anyStudent.admissionNumber).expect(200);
    expect(okAdmission.body.admissionNumber).toBe(anyStudent.admissionNumber);

    const notFoundId = randomUUID();
    await a.get(notFoundId).expect(404);

    await a.byAdmission('NONEXISTENT').expect(404);
  });

  it('authorization: student forbidden on student endpoints; unauthenticated gets 401', async () => {
    // Student (authenticated) - should be forbidden for listing
    await api(student).list().expect(403);

    // Unauthenticated - 401
    const anon = request(TestHarness.getApp().getHttpServer());
    await anon.get('/api/v1/students').expect(401);
  });

  it('schoolAdmin can create student; staff forbidden; validations and conflict handled', async () => {
    const schoolAdminApi = api(schoolAdmin);
    const staffApi = api(staff);

    const uniqueEmail = `test.student.${Date.now()}@example.test`;
    const createRes = await schoolAdminApi
      .create({
        firstName: 'Test',
        lastName: 'Student',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: TStudentStage.PRY,
        gradeCode: 'PRY1',
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: uniqueEmail,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.firstName).toBe('Test');
    expect(createRes.body.lastName).toBe('Student');
    expect(createRes.body.email).toBe(uniqueEmail);

    // Duplicate email -> 409
    await schoolAdminApi
      .create({
        firstName: 'Another',
        lastName: 'Student',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: TStudentStage.PRY,
        gradeCode: 'PRY1' as any,
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: uniqueEmail,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(409);

    // Staff forbidden
    await staffApi
      .create({
        firstName: 'Teacher',
        lastName: 'Create',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: TStudentStage.PRY,
        gradeCode: 'PRY1',
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: `staff.${Date.now()}@example.test`,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(403);

    // Validation: invalid gender -> 400
    await schoolAdminApi
      .create({
        firstName: 'Bad',
        lastName: 'Gender',
        dateOfBirth: '2005-01-01',
        gender: 'invalid' as any,
      stage: TStudentStage.PRY,
        gradeCode: 'PRY1',
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: `bad.${Date.now()}@example.test`,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(400);

    // Validation: missing required fields -> 400
    await schoolAdminApi
      .create({
        lastName: 'Missing',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: 'PRY',
        gradeCode: 'PRY1',
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: `missing.${Date.now()}@example.test`,
      })
      .expect(400);
  });

  it('schoolAdmin can update student; validation and conflicts are enforced', async () => {
    const schoolAdminApi = api(schoolAdmin);
    const staffApi = api(staff);

    // Find two students to test conflict on update
    const all = await schoolAdminApi.list({ limit: 2, schoolId }).expect(200);
    expect(all.body.data.length).toBeGreaterThanOrEqual(2);

    const student1 = all.body.data[0];
    const student2 = all.body.data[1];

    // Successful partial update
    const newPhone = '+19999999999';
    const upd = await schoolAdminApi.update(student1.id, { phone: newPhone }).expect(200);
    expect(upd.body.phone).toBe(newPhone);

    // Email conflict: attempt to update to existing email
    await schoolAdminApi.update(student1.id, { email: student2.email }).expect(409);

    // Invalid gender on update -> 400
    await schoolAdminApi.update(student1.id, { gender: 'invalid' as any }).expect(400);

    // Staff forbidden to update
    await staffApi.update(student1.id, { phone: '+18888888888' }).expect(403);

    // Update non-existent -> 404
    await schoolAdminApi.update(randomUUID(), { phone: '+17777777777' }).expect(404);
  });

  it('status update works with validation', async () => {
    const schoolAdminApi = api(schoolAdmin);

    const list = await schoolAdminApi.list({ limit: 1 }).expect(200);
    const targetStudent = list.body.data[0];

    // Update to inactive
    const upd = await schoolAdminApi.updateStatus(targetStudent.id, StudentStatus.INACTIVE, 'Test reason').expect(200);
    expect(upd.body.status).toBe('inactive');

    // Update non-existent -> 404
    await schoolAdminApi.updateStatus(randomUUID(), StudentStatus.ACTIVE).expect(404);
  });

  it('transfer functionality works', async () => {
    const schoolAdminApi = api(schoolAdmin);

    const list = await schoolAdminApi.list({ limit: 1 }).expect(200);
    const targetStudent = list.body.data[0];

    // Internal transfer
    const transfer = await schoolAdminApi.transfer(targetStudent.id, {
      newGradeCode: 'PRY2',
      newStreamSection: 'B',
      reason: 'Test transfer'
    }).expect(200);
    expect(transfer.body.gradeCode).toBe('PRY2');
    expect(transfer.body.streamSection).toBe('B');

    // Transfer non-existent -> 404
    await schoolAdminApi.transfer(randomUUID(), {
      newGradeCode: 'PRY3',
      newStreamSection: 'A',
      reason: 'Test'
    }).expect(404);
  });

  it('graduation works for eligible students', async () => {
    const schoolAdminApi = api(schoolAdmin);

    // Create a student in final grade
    const createRes = await schoolAdminApi
      .create({
        firstName: 'Graduating',
        lastName: 'Student',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: TStudentStage.SSS,
        gradeCode: 'SSS3',
        streamSection: 'A',
        admissionDate: '2020-01-01',
        schoolId,
        email: `graduating.${Date.now()}@example.test`,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(201);

    // Update the student with GPA and credits to meet graduation requirements
    await schoolAdminApi.update(createRes.body.id, {
      gpa: 3.5,
      totalCredits: 180,
    }).expect(200);

    // Graduate the student
    const grad = await schoolAdminApi.graduate(createRes.body.id, { graduationYear: 2025 }).expect(200);
    expect(grad.body.status).toBe('graduated');
    expect(grad.body.graduationYear).toBe(2025);

    // Graduate non-existent -> 404
    await schoolAdminApi.graduate(randomUUID(), { graduationYear: 2025 }).expect(404);
  });

  it('medical and financial info updates work', async () => {
    const schoolAdminApi = api(schoolAdmin);

    const list = await schoolAdminApi.list({ limit: 1 }).expect(200);
    const targetStudent = list.body.data[0];

    // Update medical info
    const medicalUpdate = await schoolAdminApi.updateMedical(targetStudent.id, {
      allergies: ['peanuts'],
      medications: ['antihistamine']
    }).expect(200);
    expect(medicalUpdate.body.medicalInfo.allergies).toContain('peanuts');

    // Update financial info
    const financialUpdate = await schoolAdminApi.updateFinancial(targetStudent.id, {
      outstandingBalance: 1000,
      feeCategory: 'Premium'
    }).expect(200);
    expect(financialUpdate.body.financialInfo.outstandingBalance).toBe(1000);

    // Update non-existent -> 404
    await schoolAdminApi.updateMedical(randomUUID(), { allergies: [] }).expect(404);
    await schoolAdminApi.updateFinancial(randomUUID(), { outstandingBalance: 0 }).expect(404);
  });

  it('document addition works', async () => {
    const schoolAdminApi = api(schoolAdmin);

    const list = await schoolAdminApi.list({ limit: 1 }).expect(200);
    const targetStudent = list.body.data[0];

    // Add document
    const doc = await schoolAdminApi.addDocument(targetStudent.id, {
      type: 'birth_certificate',
      fileName: 'birth_cert.pdf',
      fileUrl: '/documents/birth_cert.pdf',
      verified: true
    }).expect(201);
    expect(doc.body.documents.length).toBeGreaterThan(0);

    // Add to non-existent -> 404
    await schoolAdminApi.addDocument(randomUUID(), {
      type: 'transcript',
      fileName: 'transcript.pdf',
      fileUrl: '/documents/transcript.pdf',
      verified: false
    }).expect(404);
  });

  it('delete works for super admin only', async () => {
    const schoolAdminApi = api(schoolAdmin);
    const superAdminApi = api(superAdmin);

    // Create a student (allowed for super admin or school admin)
    const createRes = await schoolAdminApi
      .create({
        firstName: 'Delete',
        lastName: 'Me',
        dateOfBirth: '2005-01-01',
        gender: 'male',
        stage: TStudentStage.PRY,
        gradeCode: 'PRY1',
        streamSection: 'A',
        admissionDate: '2024-01-01',
        schoolId,
        email: `delete.${Date.now()}@example.test`,
        parentInfo: {
          fatherFirstName: 'Father',
          fatherLastName: 'Test',
          fatherPhone: '+10000000001',
          motherFirstName: 'Mother',
          motherLastName: 'Test',
          motherPhone: '+10000000002',
        },
        medicalInfo: {
          emergencyContact: {
            firstName: 'Emergency',
            lastName: 'Contact',
            phone: '+10000000003',
            relation: 'Uncle',
          },
        },
      })
      .expect(201);

    // School admin cannot delete
    await schoolAdminApi.remove(createRes.body.id).expect(403);

    // Super admin can delete the student
    await superAdminApi.remove(createRes.body.id).expect(200);

    // Delete non-existent -> 404
    await superAdminApi.remove(randomUUID()).expect(404);
  });

  it('statistics endpoint works', async () => {
    const schoolAdminApi = api(schoolAdmin);

    const stats = await schoolAdminApi.stats({ schoolId }).expect(200);
    expect(typeof stats.body).toBe('object');
    expect(typeof stats.body.totalStudents).toBe('number');
    expect(typeof stats.body.activeStudents).toBe('number');
    expect(typeof stats.body.studentsByGrade).toBe('object');
    expect(typeof stats.body.studentsByStatus).toBe('object');
    expect(typeof stats.body.studentsByEnrollmentType).toBe('object');
  });

  it('delegated-school-admin permissions: can read, cannot create/update/delete without explicit permissions', async () => {
    const delegatedApi = api(delegatedSchoolAdmin);

    // Can read
    const list = await delegatedApi.list().expect(200);
    expect(Array.isArray(list.body.data)).toBe(true);

    // Cannot create
    await delegatedApi.create({
      firstName: 'Delegated',
      lastName: 'Test',
      dateOfBirth: '2005-01-01',
      gender: 'male',
      stage: TStudentStage.PRY,
      gradeCode: 'PRY1',
      streamSection: 'A',
      admissionDate: '2024-01-01',
      schoolId,
      email: `delegated.${Date.now()}@example.test`,
      parentInfo: {
        fatherFirstName: 'Father',
        fatherLastName: 'Test',
        fatherPhone: '+10000000001',
        motherFirstName: 'Mother',
        motherLastName: 'Test',
        motherPhone: '+10000000002',
      },
      medicalInfo: {
        emergencyContact: {
          firstName: 'Emergency',
          lastName: 'Contact',
          phone: '+10000000003',
          relation: 'Uncle',
        },
      },
    }).expect(403);

    // Prepare a target student id (created by school admin)
    const schoolAdminApi = api(schoolAdmin);
    const seedList = await schoolAdminApi.list({ limit: 1 }).expect(200);
    const targetId = seedList.body.data[0].id;

    // Cannot update
    await delegatedApi.update(targetId, { phone: '+19999999999' }).expect(403);

    // Cannot delete
    await delegatedApi.remove(targetId).expect(403);
  });

  it('RBAC on write operations: staff forbidden; unauthenticated 401', async () => {
    const staffApi = api(staff);

    const list = await api(schoolAdmin).list({ limit: 1 }).expect(200);
    const anyStudentId = list.body.data[0].id;

    await staffApi.update(anyStudentId, { phone: '+15555555555' }).expect(403);
    await staffApi.updateStatus(anyStudentId, StudentStatus.INACTIVE).expect(403);
    await staffApi.transfer(anyStudentId, { newGradeCode: 'PRY2', newStreamSection: 'B' }).expect(403);
    await staffApi.graduate(anyStudentId, { graduationYear: 2025 }).expect(403);
    await staffApi.updateMedical(anyStudentId, { allergies: [] }).expect(403);
    await staffApi.updateFinancial(anyStudentId, { outstandingBalance: 0 }).expect(403);
    await staffApi.addDocument(anyStudentId, { type: 'transcript', fileName: 'test.pdf', fileUrl: '/test.pdf' }).expect(403);
    await staffApi.remove(anyStudentId).expect(403);

    // Unauthenticated
    const anon = request(TestHarness.getApp().getHttpServer());
    await anon.patch(`/api/v1/students/${anyStudentId}`).send({ phone: '+14444444444' }).expect(401);
    await anon.delete(`/api/v1/students/${anyStudentId}`).expect(401);
  });

  it('other roles access: super-admin and delegated-super-admin have full access', async () => {
    // Super admin can access
    const superRes = await api(superAdmin).list().expect(200);
    expect(Array.isArray(superRes.body.data)).toBe(true);

    // Delegated super admin can access
    const delegatedSuperRes = await api(delegatedSuperAdmin).list().expect(200);
    expect(Array.isArray(delegatedSuperRes.body.data)).toBe(true);
  });

  it('student and parent cannot access student endpoints', async () => {
    await api(student).list().expect(403);
    await api(parent).list().expect(403);
  });
});