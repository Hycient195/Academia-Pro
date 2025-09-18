// server/src/staff/__test__/department.e2e.spec.ts
// Comprehensive E2E tests for Department flows

import { TestHarness } from '../../test/utils/test-harness';
import { DataSource, Repository } from 'typeorm';
import request, { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

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

    const entity = repo.create({
      schoolId,
      employeeId: `EMP${now}`,
      firstName: 'Test',
      lastName: `Staff${now}`,
      middleName: 'Middle',
      dateOfBirth: new Date('1985-01-01'),
      gender: Gender.MALE,
      email: `test.staff.${now}@example.test`,
      phone: '+10000000000',
      currentAddress: {
        street: '1 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '00000',
        country: 'TC',
      },
      permanentAddress: {
        street: '1 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '00000',
        country: 'TC',
      },
      staffType: StaffType.TEACHING,
      departments: [],
      designation: 'Teacher',
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: new Date('2020-01-01'),
      basicSalary: 50000,
      status: StaffStatus.ACTIVE,
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '+10000000001',
      emergencyContactRelation: 'Spouse',
      createdBy: randomUUID(),
      updatedBy: randomUUID(),
      ...overrides,
    });

    const saved = await repo.save(entity);
    return Array.isArray(saved) ? saved[0] : saved;
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
        name: 'Computer Science Department',
        description: 'Teaching computer science and programming',
      }).expect(201);

      expect(createRes.body.id).toBeDefined();
      expect(createRes.body.type).toBe(EDepartmentType.TEACHING);
      expect(createRes.body.name).toBe('Computer Science Department');
      expect(createRes.body.description).toBe('Teaching computer science and programming');
      expect(createRes.body.createdBy).toBeDefined();
      expect(createRes.body.createdAt).toBeDefined();
    });

    it('rejects duplicate department name+type combination', async () => {
      const adminApi = api(admin);

      // Create first department
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Physics Department',
        description: 'Teaching physics',
      }).expect(201);

      // Try to create duplicate
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Physics Department',
        description: 'Another physics department',
      }).expect(409);
    });

    it('validates required fields and data types', async () => {
      const adminApi = api(admin);

      // Missing type
      await adminApi.create({
        name: 'Test Department',
        description: 'Test description',
      }).expect(400);

      // Missing name
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        description: 'Test description',
      }).expect(400);

      // Invalid type enum
      await adminApi.create({
        type: 'INVALID_TYPE',
        name: 'Test Department',
      }).expect(400);

      // Name too long (max 100 chars)
      const longName = 'A'.repeat(101);
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: longName,
      }).expect(400);
    });

    it('staff cannot create department (403)', async () => {
      const staffApi = api(staff);

      await staffApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Unauthorized Department',
      }).expect(403);
    });

    it('student cannot create department (403)', async () => {
      const studentApi = api(student);

      await studentApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Unauthorized Department',
      }).expect(403);
    });

    it('unauthenticated user cannot create department (401)', async () => {
      const anon = request(TestHarness.getApp().getHttpServer());

      await anon.post('/api/v1/departments').send({
        type: EDepartmentType.TEACHING,
        name: 'Unauthorized Department',
      }).expect(401);
    });
  });

  describe('Department Retrieval Operations', () => {
    let testDept1: any;
    let testDept2: any;

    beforeEach(async () => {
      const adminApi = api(admin);

      // Create test departments
      testDept1 = await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Mathematics Department',
        description: 'Teaching mathematics',
      }).expect(201);

      testDept2 = await adminApi.create({
        type: EDepartmentType.ADMINISTRATION,
        name: 'School Administration',
        description: 'Administrative functions',
      }).expect(201);
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

      const searchRes = await adminApi.list({ search: 'Mathematics' }).expect(200);
      expect(searchRes.body.length).toBeGreaterThan(0);
      expect(searchRes.body.some((d: any) => d.name.includes('Mathematics'))).toBe(true);
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

      const getRes = await adminApi.get(testDept1.body.id).expect(200);
      expect(getRes.body.id).toBe(testDept1.body.id);
      expect(getRes.body.name).toBe(testDept1.body.name);
      expect(getRes.body.type).toBe(testDept1.body.type);
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
      await staffApi.get(testDept1.body.id).expect(200);
      await staffApi.getByType(EDepartmentType.TEACHING).expect(200);
    });

    it('student cannot read departments (403)', async () => {
      const studentApi = api(student);

      await studentApi.list().expect(403);
      await studentApi.get(testDept1.body.id).expect(403);
    });
  });

  describe('Department Update Operations', () => {
    let testDept: any;

    beforeEach(async () => {
      const adminApi = api(admin);

      testDept = await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Original Department',
        description: 'Original description',
      }).expect(201);
    });

    it('admin can update department successfully', async () => {
      const adminApi = api(admin);

      const updateRes = await adminApi.update(testDept.body.id, {
        name: 'Updated Department',
        description: 'Updated description',
      }).expect(200);

      expect(updateRes.body.id).toBe(testDept.body.id);
      expect(updateRes.body.name).toBe('Updated Department');
      expect(updateRes.body.description).toBe('Updated description');
      expect(updateRes.body.updatedBy).toBeDefined();
      expect(updateRes.body.updatedAt).toBeDefined();
    });

    it('admin can update department type', async () => {
      const adminApi = api(admin);

      const updateRes = await adminApi.update(testDept.body.id, {
        type: EDepartmentType.ADMINISTRATION,
        name: 'Updated Department',
      }).expect(200);

      expect(updateRes.body.type).toBe(EDepartmentType.ADMINISTRATION);
      expect(updateRes.body.name).toBe('Updated Department');
    });

    it('rejects update that would create duplicate name+type', async () => {
      const adminApi = api(admin);

      // Create another department
      await adminApi.create({
        type: EDepartmentType.ADMINISTRATION,
        name: 'Admin Department',
      }).expect(201);

      // Try to update first department to match second
      await adminApi.update(testDept.body.id, {
        type: EDepartmentType.ADMINISTRATION,
        name: 'Admin Department',
      }).expect(409);
    });

    it('validates update data', async () => {
      const adminApi = api(admin);

      // Invalid type
      await adminApi.update(testDept.body.id, {
        type: 'INVALID_TYPE',
      }).expect(400);

      // Name too long
      await adminApi.update(testDept.body.id, {
        name: 'A'.repeat(101),
      }).expect(400);
    });

    it('returns 404 for non-existent department update', async () => {
      const adminApi = api(admin);

      await adminApi.update(randomUUID(), {
        name: 'Updated Name',
      }).expect(404);
    });

    it('staff cannot update department (403)', async () => {
      const staffApi = api(staff);

      await staffApi.update(testDept.body.id, {
        name: 'Unauthorized Update',
      }).expect(403);
    });
  });

  describe('Department Deletion Operations', () => {
    let testDept: any;
    let staffMember: Staff;

    beforeEach(async () => {
      const adminApi = api(admin);

      testDept = await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Department to Delete',
        description: 'Will be deleted',
      }).expect(201);

      // Create a staff member for assignment tests
      staffMember = await createStaffRecord();
    });

    it('admin can delete empty department', async () => {
      const adminApi = api(admin);

      await adminApi.delete(testDept.body.id).expect(204);

      // Verify deletion
      await adminApi.get(testDept.body.id).expect(404);
    });

    it('rejects deletion of department with assigned staff', async () => {
      const adminApi = api(admin);

      // Assign staff to department
      await adminApi.assignStaff(testDept.body.id, staffMember.id).expect(200);

      // Try to delete
      await adminApi.delete(testDept.body.id).expect(409);
    });

    it('returns 404 for non-existent department deletion', async () => {
      const adminApi = api(admin);

      await adminApi.delete(randomUUID()).expect(404);
    });

    it('staff cannot delete department (403)', async () => {
      const staffApi = api(staff);

      await staffApi.delete(testDept.body.id).expect(403);
    });
  });

  describe('Staff Assignment to Departments', () => {
    let testDept: any;
    let staffMember: Staff;

    beforeEach(async () => {
      const adminApi = api(admin);

      testDept = await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Assignment Test Department',
        description: 'For testing staff assignments',
      }).expect(201);

      staffMember = await createStaffRecord();
    });

    it('admin can assign staff to department', async () => {
      const adminApi = api(admin);

      const assignRes = await adminApi.assignStaff(testDept.body.id, staffMember.id).expect(200);

      expect(assignRes.body.id).toBe(testDept.body.id);
      expect(assignRes.body.staff).toBeDefined();
      expect(Array.isArray(assignRes.body.staff)).toBe(true);
      expect(assignRes.body.staff.some((s: any) => s.id === staffMember.id)).toBe(true);
    });

    it('rejects duplicate staff assignment to same department', async () => {
      const adminApi = api(admin);

      // First assignment
      await adminApi.assignStaff(testDept.body.id, staffMember.id).expect(200);

      // Second assignment should fail
      await adminApi.assignStaff(testDept.body.id, staffMember.id).expect(409);
    });

    it('admin can remove staff from department', async () => {
      const adminApi = api(admin);

      // Assign first
      await adminApi.assignStaff(testDept.body.id, staffMember.id).expect(200);

      // Remove
      const removeRes = await adminApi.removeStaff(testDept.body.id, staffMember.id).expect(200);

      expect(removeRes.body.id).toBe(testDept.body.id);
      expect(removeRes.body.staff).toBeDefined();
      expect(removeRes.body.staff.some((s: any) => s.id === staffMember.id)).toBe(false);
    });

    it('returns 404 for non-existent department in assignment', async () => {
      const adminApi = api(admin);

      await adminApi.assignStaff(randomUUID(), staffMember.id).expect(404);
      await adminApi.removeStaff(randomUUID(), staffMember.id).expect(404);
    });

    it('returns 404 for non-existent staff in assignment', async () => {
      const adminApi = api(admin);

      await adminApi.assignStaff(testDept.body.id, randomUUID()).expect(404);
      await adminApi.removeStaff(testDept.body.id, randomUUID()).expect(404);
    });

    it('staff cannot assign/remove staff (403)', async () => {
      const staffApi = api(staff);

      await staffApi.assignStaff(testDept.body.id, staffMember.id).expect(403);
      await staffApi.removeStaff(testDept.body.id, staffMember.id).expect(403);
    });
  });

  describe('Department Statistics', () => {
    beforeEach(async () => {
      const adminApi = api(admin);

      // Create departments of different types
      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Math Department',
      }).expect(201);

      await adminApi.create({
        type: EDepartmentType.TEACHING,
        name: 'Science Department',
      }).expect(201);

      await adminApi.create({
        type: EDepartmentType.ADMINISTRATION,
        name: 'Admin Department',
      }).expect(201);
    });

    it('returns comprehensive department statistics', async () => {
      const adminApi = api(admin);

      const statsRes = await adminApi.getStats().expect(200);

      expect(statsRes.body.totalDepartments).toBeDefined();
      expect(typeof statsRes.body.totalDepartments).toBe('number');
      expect(statsRes.body.totalDepartments).toBeGreaterThanOrEqual(3);

      expect(statsRes.body.departmentsByType).toBeDefined();
      expect(typeof statsRes.body.departmentsByType).toBe('object');

      expect(statsRes.body.averageStaffPerDepartment).toBeDefined();
      expect(typeof statsRes.body.averageStaffPerDepartment).toBe('number');

      expect(statsRes.body.departmentsWithMostStaff).toBeDefined();
      expect(Array.isArray(statsRes.body.departmentsWithMostStaff)).toBe(true);
    });

    it('staff can view department statistics', async () => {
      const staffApi = api(staff);

      await staffApi.getStats().expect(200);
    });

    it('student cannot view department statistics (403)', async () => {
      const studentApi = api(student);

      await studentApi.getStats().expect(403);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles invalid UUIDs gracefully', async () => {
      const adminApi = api(admin);

      await adminApi.get('invalid-uuid').expect(400);
      await adminApi.update('invalid-uuid', { name: 'Test' }).expect(400);
      await adminApi.delete('invalid-uuid').expect(400);
      await adminApi.assignStaff('invalid-uuid', randomUUID()).expect(400);
      await adminApi.removeStaff('invalid-uuid', randomUUID()).expect(400);
    });

    it('handles empty request bodies', async () => {
      const adminApi = api(admin);

      await adminApi.create({}).expect(400);
      await adminApi.update(randomUUID(), {}).expect(404); // 404 takes precedence
    });

    it('handles concurrent operations correctly', async () => {
      const adminApi = api(admin);

      // Create multiple departments simultaneously
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          adminApi.create({
            type: EDepartmentType.TEACHING,
            name: `Concurrent Department ${i}`,
          })
        );
      }

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.status).toBe(201);
      });

      // Verify all were created
      const listRes = await adminApi.list().expect(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(5);
    });
  });
});