// server/src/staff/__test__/department.e2e.spec.ts
// Comprehensive E2E tests for Department flows

import { TestHarness } from '../../test/utils/test-harness';
import { DataSource, Repository } from 'typeorm';
import request, { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

import { Department } from '../entities/department.entity';
import { Staff } from '../entities/staff.entity';
import { StaffType, StaffStatus, EmploymentType, Gender } from '../entities/staff.entity';
import { EDepartmentType } from '@academia-pro/types/staff';

describe('Departments E2E', () => {
  let admin: SuperAgentTest;
  let staff: SuperAgentTest;
  let student: SuperAgentTest;
  let ds: DataSource;
  let schoolId: string;

  beforeAll(async () => {
    jest.setTimeout(120000);
    await TestHarness.bootstrap();
    admin = await TestHarness.auth('super-admin');
    staff = await TestHarness.auth('staff');
    student = await TestHarness.auth('student');
    ds = TestHarness.getDataSource();
  });

  afterAll(async () => {
    await TestHarness.shutdown();
  });

  beforeEach(async () => {
    await TestHarness.startTransaction();

    // Obtain an existing schoolId from DB to satisfy FK when inserting staff
    const rows = await ds.query('SELECT id FROM schools LIMIT 1');
    schoolId = rows?.[0]?.id;
    expect(schoolId).toBeDefined();
    console.log('Using schoolId:', schoolId);
  });

  afterEach(async () => {
    await TestHarness.rollbackTransaction();
  });

  // Helpers
  async function createStaffRecord(overrides: Partial<Staff> = {}): Promise<Staff> {
    const repo: Repository<Staff> = ds.getRepository(Staff);
    const now = Date.now();

    const basicSalary = faker.number.int({ min: 30000, max: 100000 });

    const entity = repo.create({
      schoolId,
      employeeId: `EMP${now}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
      contactInfo: {
        email: faker.internet.email(),
        phone: faker.phone.number(),
        emergencyContact: {
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          relation: 'Spouse',
        },
      },
      addressInfo: {
        current: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.countryCode(),
        },
        permanent: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.countryCode(),
        },
      },
      staffType: faker.helpers.arrayElement(Object.values(StaffType)),
      departments: [],
      designation: faker.person.jobTitle(),
      employmentType: faker.helpers.arrayElement(Object.values(EmploymentType)),
      joiningDate: faker.date.past({ years: 5 }),
      compensation: {
        basicSalary,
        salaryCurrency: 'NGN',
        grossSalary: basicSalary,
        netSalary: basicSalary,
        paymentMethod: 'bank_transfer',
      },
      status: StaffStatus.ACTIVE,
      createdBy: randomUUID(),
      updatedBy: randomUUID(),
      ...overrides,
    });

    const saved = await repo.save(entity);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async function createDepartmentViaApi(serverAgent: SuperAgentTest, overrides: Partial<{ type: EDepartmentType; name: string; description: string }> = {}): Promise<any> {
    const createRes = await serverAgent.post('/api/v1/departments').send({
      type: overrides.type ?? faker.helpers.arrayElement(Object.values(EDepartmentType) as EDepartmentType[]),
      name: overrides.name ?? faker.company.buzzNoun(),
      description: overrides.description ?? faker.lorem.sentence(),
    }).expect(201);

    return createRes.body;
  }

  function api(serverAgent: SuperAgentTest) {
    return {
      // Department CRUD
      create: (body: any) => serverAgent.post('/api/v1/departments').send(body),
      list: (q?: Record<string, any>) => serverAgent.get('/api/v1/departments').query(q ?? {}),
      get: (id: string) => serverAgent.get(`/api/v1/departments/${id}`),
      update: (id: string, body: any) => serverAgent.put(`/api/v1/departments/${id}`).send(body),
      delete: (id: string) => serverAgent.delete(`/api/v1/departments/${id}`),

      // Department by type
      getByType: (type: EDepartmentType) => serverAgent.get(`/api/v1/departments/type/${type}`),

      // Staff assignment to departments
      assignStaff: (deptId: string, staffId: string) =>
        serverAgent.post(`/api/v1/departments/${deptId}/staff/${staffId}`),
      removeStaff: (deptId: string, staffId: string) =>
        serverAgent.delete(`/api/v1/departments/${deptId}/staff/${staffId}`),

      // Statistics
      getStats: () => serverAgent.get('/api/v1/departments/stats/overview'),
    };
  }

  describe('Department CRUD Operations', () => {
    it('admin can create department with valid data', async () => {
      const adminApi = api(admin);

      const createRes = await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
        description: faker.lorem.sentence(),
      }).expect(201);

      expect(createRes.body.id).toBeDefined();
      expect(createRes.body.type).toBe(EDepartmentType.TEACHING);
      expect(createRes.body.name).toBeDefined();
      expect(createRes.body.description).toBeDefined();
      expect(createRes.body.createdBy).toBeDefined();
      expect(createRes.body.createdAt).toBeDefined();
    });

    it('rejects duplicate department name+type combination', async () => {
      const adminApi = api(admin);
      const deptName = faker.company.buzzNoun();

      // Create first department
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: deptName,
        description: faker.lorem.sentence(),
      }).expect(201);

      // Try to create duplicate
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: deptName,
        description: faker.lorem.sentence(),
      }).expect(409);
    });

    it('validates required fields and data types', async () => {
      const adminApi = api(admin);

      // Missing type
      await adminApi.create({
        name: faker.company.buzzNoun(),
        description: faker.lorem.sentence(),
      }).expect(400);

      // Missing name
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        description: faker.lorem.sentence(),
      }).expect(400);

      // Invalid type enum
      await adminApi.create({
        type: 'INVALID_TYPE',
        name: faker.company.buzzNoun(),
      }).expect(400);

      // Name too long (max 100 chars)
      const longName = faker.string.alphanumeric(101);
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: longName,
      }).expect(400);
    });

    it('staff cannot create department (403)', async () => {
      const staffApi = api(staff);

      await staffApi.create({
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
      }).expect(403);
    });

    it('student cannot create department (403)', async () => {
      const studentApi = api(student);

      await studentApi.create({
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
      }).expect(403);
    });

    it('unauthenticated user cannot create department (401)', async () => {
      const anon = request(TestHarness.getApp().getHttpServer());

      await anon.post('/api/v1/departments').send({
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
      }).expect(401);
    });

    it('creates departments with all department types', async () => {
      const adminApi = api(admin);

      for (const deptType of Object.values(EDepartmentType)) {
        if (typeof deptType === 'string') {
          const createRes = await adminApi.create({
            type: deptType as EDepartmentType,
            name: `${faker.company.buzzNoun()} ${deptType}`,
            description: faker.lorem.sentence(),
          }).expect(201);

          expect(createRes.body.type).toBe(deptType);
        }
      }
    });
  });

  describe('Department Retrieval Operations', () => {
    let testDept1: any;
    let testDept2: any;

    beforeEach(async () => {
      const adminApi = api(admin);

      // Create test departments
      testDept1 = await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
        description: faker.lorem.sentence(),
      });

      testDept2 = await createDepartmentViaApi(admin, {
        type: EDepartmentType.ADMINISTRATION,
        name: faker.company.buzzNoun(),
        description: faker.lorem.sentence(),
      });
    });

    it('lists all departments with pagination', async () => {
      const adminApi = api(admin);

      const listRes = await adminApi.list().expect(200);
      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThanOrEqual(2);

      // Check structure
      const dept = listRes.body[0];
      expect(dept.id).toBeDefined();
      expect(dept.type).toBeDefined();
      expect(dept.name).toBeDefined();
      expect(dept.description).toBeDefined();
      expect(dept.createdAt).toBeDefined();
      expect(dept.updatedAt).toBeDefined();
    });

    it('filters departments by type', async () => {
      const adminApi = api(admin);

      const teachingDepts = await adminApi.list({ type: EDepartmentType.TEACHING }).expect(200);
      expect(teachingDepts.body.every((d: any) => d.type === EDepartmentType.TEACHING)).toBe(true);

      const adminDepts = await adminApi.list({ type: EDepartmentType.ADMINISTRATION }).expect(200);
      expect(adminDepts.body.every((d: any) => d.type === EDepartmentType.ADMINISTRATION)).toBe(true);
    });

    it('searches departments by name and description', async () => {
      const adminApi = api(admin);
      const searchTerm = 'Mathematics';

      // Create department with searchable content
      await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: `Advanced ${searchTerm}`,
        description: `Teaching ${searchTerm.toLowerCase()} concepts`,
      });

      const searchRes = await adminApi.list({ search: searchTerm }).expect(200);
      expect(searchRes.body.length).toBeGreaterThan(0);
      expect(searchRes.body.some((d: any) => d.name.includes(searchTerm) || d.description.includes(searchTerm))).toBe(true);
    });

    it('paginates results correctly', async () => {
      const adminApi = api(admin);

      const page1 = await adminApi.list({ limit: 1, offset: 0 }).expect(200);
      expect(page1.body.length).toBe(1);

      const page2 = await adminApi.list({ limit: 1, offset: 1 }).expect(200);
      expect(page2.body.length).toBe(1);

      // Different results
      expect(page1.body[0].id).not.toBe(page2.body[0].id);
    });

    it('gets department by ID', async () => {
      const adminApi = api(admin);

      const getRes = await adminApi.get(testDept1.id).expect(200);
      expect(getRes.body.id).toBe(testDept1.id);
      expect(getRes.body.name).toBe(testDept1.name);
      expect(getRes.body.type).toBe(testDept1.type);
    });

    it('returns 404 for non-existent department', async () => {
      const adminApi = api(admin);

      await adminApi.get(randomUUID()).expect(404);
    });

    it('gets departments by type endpoint', async () => {
      const adminApi = api(admin);

      const teachingDepts = await adminApi.getByType(EDepartmentType.TEACHING).expect(200);
      expect(Array.isArray(teachingDepts.body)).toBe(true);
      expect(teachingDepts.body.every((d: any) => d.type === EDepartmentType.TEACHING)).toBe(true);
    });

    it('staff can read departments', async () => {
      const staffApi = api(staff);

      await staffApi.list().expect(200);
      await staffApi.get(testDept1.id).expect(200);
      await staffApi.getByType(EDepartmentType.TEACHING).expect(200);
    });

    it('student cannot read departments (403)', async () => {
      const studentApi = api(student);

      await studentApi.list().expect(403);
      await studentApi.get(testDept1.id).expect(403);
    });

    it('handles complex filtering scenarios', async () => {
      const adminApi = api(admin);

      // Create departments with specific patterns
      await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: 'Primary Mathematics',
        description: 'Basic math for primary students',
      });

      await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: 'Secondary Mathematics',
        description: 'Advanced math for secondary students',
      });

      await createDepartmentViaApi(admin, {
        type: EDepartmentType.ADMINISTRATION,
        name: 'Mathematics Records',
        description: 'Administrative records for math department',
      });

      // Filter by type and search
      const teachingMath = await adminApi.list({
        type: EDepartmentType.TEACHING,
        search: 'mathematics'
      }).expect(200);

      expect(teachingMath.body).toHaveLength(2);
      expect(teachingMath.body.every((d: any) => d.type === EDepartmentType.TEACHING)).toBe(true);
      expect(teachingMath.body.every((d: any) =>
        d.name.toLowerCase().includes('mathematics') ||
        d.description.toLowerCase().includes('mathematics')
      )).toBe(true);
    });
  });
});