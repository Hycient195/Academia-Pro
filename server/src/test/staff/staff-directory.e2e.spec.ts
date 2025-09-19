// server/src/staff/__test__/staff-directory.e2e.spec.ts
// Comprehensive E2E tests for Staff Directory functionality
//
// Test Strategy:
// - createMinimalStaffRecord(): For basic CRUD tests (faster, easier debugging)
// - createStaffRecord(): For integration/complex scenarios (full payload)
// - Comprehensive coverage of GET, POST, PUT, DELETE operations
// - Negative authorization tests for all CRUD operations
// - Edge cases and error handling

import { TestHarness } from '../utils/test-harness';
import { DataSource, Repository } from 'typeorm';
import request, { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

import { Staff } from '../../staff/entities/staff.entity';
import { StaffType, StaffStatus, EmploymentType, Gender, MaritalStatus, BloodGroup, QualificationLevel } from '../../staff/entities/staff.entity';
import { Department } from '../../staff/entities/department.entity';
import { EDepartmentType } from '@academia-pro/types/staff';

describe('Staff Directory E2E', () => {
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
  async function createMinimalStaffRecord(overrides: Partial<Staff> = {}): Promise<Staff> {
    const repo: Repository<Staff> = ds.getRepository(Staff);
    const now = Date.now();

    const baseData = {
      schoolId,
      employeeId: `EMP${now}`,
      firstName: overrides.firstName ?? faker.person.firstName(),
      lastName: overrides.lastName ?? faker.person.lastName(),
      dateOfBirth: overrides.dateOfBirth ?? faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      gender: overrides.gender ?? faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
      contactInfo: {
        email: overrides.email ?? faker.internet.email(),
        phone: overrides.phone ?? faker.phone.number(),
        emergencyContact: {
          name: overrides.emergencyContactName ?? faker.person.fullName(),
          phone: overrides.emergencyContactPhone ?? faker.phone.number(),
          relation: overrides.emergencyContactRelation ?? 'Spouse',
        },
      },
      addressInfo: {
        current: overrides.currentAddress ?? {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.countryCode(),
        },
        permanent: overrides.permanentAddress ?? {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.countryCode(),
        },
      },
      staffType: overrides.staffType ?? faker.helpers.arrayElement(Object.values(StaffType)),
      departments: overrides.departments ?? [],
      designation: overrides.designation ?? faker.person.jobTitle(),
      employmentType: overrides.employmentType ?? EmploymentType.FULL_TIME,
      joiningDate: overrides.joiningDate ?? faker.date.past({ years: 5 }),
      compensation: {
        basicSalary: overrides.compensation?.basicSalary ?? faker.number.int({ min: 30000, max: 100000 }),
        salaryCurrency: 'NGN',
        grossSalary: 0,
        netSalary: 0,
        paymentMethod: 'bank_transfer',
      },
      status: overrides.status ?? StaffStatus.ACTIVE,
      createdBy: overrides.createdBy ?? randomUUID(),
      updatedBy: overrides.updatedBy ?? randomUUID(),
    };

    // Filter out any methods or invalid properties from overrides
    const cleanOverrides = Object.keys(overrides).reduce((acc, key) => {
      if (typeof overrides[key] !== 'function' && key in baseData) {
        acc[key] = overrides[key];
      }
      return acc;
    }, {} as any);

    const entity = repo.create({ ...baseData, ...cleanOverrides });
    const saved = await repo.save(entity);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async function createStaffRecord(overrides: Partial<Staff> = {}): Promise<Staff> {
    const repo: Repository<Staff> = ds.getRepository(Staff);
    const now = Date.now();

    const baseData = {
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
        alternatePhone: faker.phone.number(),
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
        basicSalary: faker.number.int({ min: 30000, max: 100000 }),
        salaryCurrency: 'NGN',
        houseAllowance: faker.number.int({ min: 0, max: 10000 }),
        transportAllowance: faker.number.int({ min: 0, max: 5000 }),
        medicalAllowance: faker.number.int({ min: 0, max: 3000 }),
        otherAllowances: faker.number.int({ min: 0, max: 2000 }),
        grossSalary: faker.number.int({ min: 40000, max: 120000 }),
        taxDeductible: faker.number.int({ min: 0, max: 5000 }),
        providentFund: faker.number.int({ min: 0, max: 2000 }),
        otherDeductions: faker.number.int({ min: 0, max: 1000 }),
        netSalary: faker.number.int({ min: 35000, max: 110000 }),
        paymentMethod: faker.helpers.arrayElement(['bank_transfer', 'check', 'cash']),
        bankDetails: {
          bankName: faker.company.name(),
          accountNumber: faker.finance.accountNumber(),
          branch: faker.location.city(),
          ifscCode: faker.finance.routingNumber(),
        },
      },
      status: StaffStatus.ACTIVE,
      createdBy: randomUUID(),
      updatedBy: randomUUID(),
      maritalStatus: faker.helpers.arrayElement(Object.values(MaritalStatus)),
      bloodGroup: faker.helpers.arrayElement(Object.values(BloodGroup)),
      reportingTo: randomUUID(),
      probationEndDate: faker.date.future(),
      contractEndDate: faker.date.future({ years: 2 }),
      qualifications: [{
        level: faker.helpers.arrayElement(Object.values(QualificationLevel)),
        field: faker.person.jobArea(),
        institution: faker.company.name(),
        yearOfCompletion: faker.number.int({ min: 1990, max: 2023 }),
        isVerified: faker.datatype.boolean(),
      }],
      certifications: [{
        name: faker.lorem.words(2),
        issuingAuthority: faker.company.name(),
        issueDate: faker.date.past({ years: 5 }),
        isVerified: faker.datatype.boolean(),
      }],
      previousExperience: [{
        organization: faker.company.name(),
        designation: faker.person.jobTitle(),
        startDate: faker.date.past({ years: 10 }),
        responsibilities: faker.lorem.sentences(2),
      }],
      totalExperienceYears: faker.number.int({ min: 0, max: 20 }),
      performanceRating: faker.number.int({ min: 1, max: 5 }),
      lastPerformanceReview: faker.date.past(),
      nextPerformanceReview: faker.date.future(),
      performanceNotes: faker.lorem.paragraph(),
      annualLeaveBalance: faker.number.int({ min: 0, max: 30 }),
      sickLeaveBalance: faker.number.int({ min: 0, max: 12 }),
      maternityLeaveBalance: faker.number.int({ min: 0, max: 90 }),
      paternityLeaveBalance: faker.number.int({ min: 0, max: 14 }),
      casualLeaveBalance: faker.number.int({ min: 0, max: 12 }),
      workingHoursPerWeek: faker.number.int({ min: 35, max: 50 }),
      workingDaysPerWeek: faker.number.int({ min: 5, max: 6 }),
      shiftStartTime: faker.helpers.arrayElement(['08:00', '09:00', '10:00']),
      shiftEndTime: faker.helpers.arrayElement(['17:00', '18:00', '19:00']),
      medicalInfo: {
        allergies: [faker.lorem.word()],
        medications: [faker.lorem.word()],
        conditions: [faker.lorem.word()],
        doctorName: faker.person.fullName(),
        doctorPhone: faker.phone.number(),
      },
      documents: [{
        type: 'id',
        name: faker.system.fileName(),
        url: faker.internet.url(),
        uploadDate: faker.date.recent(),
        isVerified: faker.datatype.boolean(),
      }],
      userId: randomUUID(),
      biometricId: faker.string.alphanumeric(10),
      rfidCardNumber: faker.string.alphanumeric(12),
      communicationPreferences: {
        email: faker.datatype.boolean(),
        sms: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        newsletter: faker.datatype.boolean(),
        emergencyAlerts: faker.datatype.boolean(),
      },
      tags: [faker.lorem.word()],
      metadata: {
        specialSkills: [faker.lorem.word()],
        languages: [faker.lorem.word()],
      },
      internalNotes: faker.lorem.sentences(3),
    };

    // Filter out any methods or invalid properties from overrides
    const cleanOverrides = Object.keys(overrides).reduce((acc, key) => {
      if (typeof overrides[key] !== 'function' && key in baseData) {
        acc[key] = overrides[key];
      }
      return acc;
    }, {} as any);

    const entity = repo.create({ ...baseData, ...cleanOverrides });

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
      // Staff CRUD
      create: (body: any) => serverAgent.post('/api/v1/staff').send(body),
      list: (q?: Record<string, any>) => serverAgent.get('/api/v1/staff').query(q ?? {}),
      get: (id: string) => serverAgent.get(`/api/v1/staff/${id}`),
      update: (id: string, body: any) => serverAgent.put(`/api/v1/staff/${id}`).send(body),
      delete: (id: string) => serverAgent.delete(`/api/v1/staff/${id}`),

      // Staff search and filter
      search: (q: string) => serverAgent.get('/api/v1/staff/search').query({ q }),
      filter: (filters: Record<string, any>) => serverAgent.get('/api/v1/staff/filter').query(filters),

      // Staff attendance
      getAttendance: (id: string) => serverAgent.get(`/api/v1/staff/${id}/attendance`),
      updateAttendance: (id: string, body: any) => serverAgent.put(`/api/v1/staff/${id}/attendance`).send(body),

      // Staff payroll
      getPayroll: (id: string) => serverAgent.get(`/api/v1/staff/${id}/payroll`),
      updatePayroll: (id: string, body: any) => serverAgent.put(`/api/v1/staff/${id}/payroll`).send(body),

      // Staff statistics
      getStats: () => serverAgent.get('/api/v1/staff/stats/overview'),
    };
  }

  describe('Staff Directory Listing', () => {
    let testStaff: Staff[];
    let testDepartment: any;

    beforeEach(async () => {
      // Create a test department
      testDepartment = await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: 'Mathematics Department',
      });

      // Create test staff members
      testStaff = [];
      for (let i = 0; i < 5; i++) {
        const staffMember = await createStaffRecord({
          firstName: `Test${i}`,
          lastName: `Staff${i}`,
          email: `test${i}@example.com`,
          designation: i % 2 === 0 ? 'Teacher' : 'Administrator',
          staffType: i % 2 === 0 ? StaffType.TEACHING : StaffType.ADMINISTRATIVE,
        });
        testStaff.push(staffMember);
      }

      // Assign some staff to the department
      await admin.post(`/api/v1/departments/${testDepartment.id}/staff/${testStaff[0].id}`).expect(200);
      await admin.post(`/api/v1/departments/${testDepartment.id}/staff/${testStaff[1].id}`).expect(200);
    });

    it('lists all staff with basic information', async () => {
      const adminApi = api(admin);

      const listRes = await adminApi.list().expect(200);
      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThanOrEqual(5);

      // Check structure of first staff member
      const staff = listRes.body[0];
      expect(staff.id).toBeDefined();
      expect(staff.firstName).toBeDefined();
      expect(staff.lastName).toBeDefined();
      expect(staff.email).toBeDefined();
      expect(staff.designation).toBeDefined();
      expect(staff.staffType).toBeDefined();
      expect(staff.status).toBeDefined();
      expect(staff.createdAt).toBeDefined();
    });

    it('searches staff by name and email', async () => {
      const adminApi = api(admin);

      // Search by first name
      const searchRes1 = await adminApi.list({ search: 'Test0' }).expect(200);
      expect(searchRes1.body.length).toBeGreaterThan(0);
      expect(searchRes1.body.some((s: any) => s.firstName.includes('Test0'))).toBe(true);

      // Search by email
      const searchRes2 = await adminApi.list({ search: 'test0@example.com' }).expect(200);
      expect(searchRes2.body.length).toBeGreaterThan(0);
      expect(searchRes2.body.some((s: any) => s.email.includes('test0'))).toBe(true);

      // Case insensitive search
      const searchRes3 = await adminApi.list({ search: 'TEST0' }).expect(200);
      expect(searchRes3.body.length).toBeGreaterThan(0);
    });

    it('filters staff by department', async () => {
      const adminApi = api(admin);

      const deptFilterRes = await adminApi.list({ departmentId: testDepartment.id }).expect(200);
      expect(deptFilterRes.body.length).toBe(2); // We assigned 2 staff to the department
      expect(deptFilterRes.body.every((s: any) =>
        s.departments?.some((d: any) => d.id === testDepartment.id)
      )).toBe(true);
    });

    it('filters staff by staff type', async () => {
      const adminApi = api(admin);

      const teachingFilterRes = await adminApi.list({ staffType: StaffType.TEACHING }).expect(200);
      expect(teachingFilterRes.body.every((s: any) => s.staffType === StaffType.TEACHING)).toBe(true);

      const adminFilterRes = await adminApi.list({ staffType: StaffType.ADMINISTRATIVE }).expect(200);
      expect(adminFilterRes.body.every((s: any) => s.staffType === StaffType.ADMINISTRATIVE)).toBe(true);
    });

    it('filters staff by status', async () => {
      const adminApi = api(admin);

      const activeFilterRes = await adminApi.list({ status: StaffStatus.ACTIVE }).expect(200);
      expect(activeFilterRes.body.every((s: any) => s.status === StaffStatus.ACTIVE)).toBe(true);
    });

    it('paginates staff results correctly', async () => {
      const adminApi = api(admin);

      const page1 = await adminApi.list({ limit: 2, offset: 0 }).expect(200);
      expect(page1.body.length).toBe(2);

      const page2 = await adminApi.list({ limit: 2, offset: 2 }).expect(200);
      expect(page2.body.length).toBe(2);

      // Different results
      const page1Ids = page1.body.map((s: any) => s.id);
      const page2Ids = page2.body.map((s: any) => s.id);
      expect(page1Ids.some((id: string) => page2Ids.includes(id))).toBe(false);
    });

    it('sorts staff by different criteria', async () => {
      const adminApi = api(admin);

      // Sort by name ascending
      const nameSortRes = await adminApi.list({ sortBy: 'firstName', sortOrder: 'ASC' }).expect(200);
      const names = nameSortRes.body.map((s: any) => s.firstName);
      expect(names).toEqual([...names].sort());

      // Sort by joining date descending
      const dateSortRes = await adminApi.list({ sortBy: 'joiningDate', sortOrder: 'DESC' }).expect(200);
      expect(dateSortRes.body.length).toBeGreaterThan(0);
    });

    it('staff can view staff directory', async () => {
      const staffApi = api(staff);

      await staffApi.list().expect(200);
      await staffApi.get(testStaff[0].id).expect(200);
    });

    it('student cannot view staff directory (403)', async () => {
      const studentApi = api(student);

      await studentApi.list().expect(403);
      await studentApi.get(testStaff[0].id).expect(403);
    });
  });

  describe('Staff Details View', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createStaffRecord({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        designation: 'Senior Teacher',
        compensation: {
          basicSalary: 75000,
          salaryCurrency: 'NGN',
          grossSalary: 75000,
          netSalary: 75000,
          paymentMethod: 'bank_transfer',
        },
        performanceRating: 4,
        annualLeaveBalance: 25,
        sickLeaveBalance: 10,
      });
    });

    it('returns complete staff details', async () => {
      const adminApi = api(admin);

      const getRes = await adminApi.get(testStaff.id).expect(200);
      const staff = getRes.body;

      expect(staff.id).toBe(testStaff.id);
      expect(staff.firstName).toBe('John');
      expect(staff.lastName).toBe('Doe');
      expect(staff.email).toBe('john.doe@example.com');
      expect(staff.phone).toBe('+1234567890');
      expect(staff.designation).toBe('Senior Teacher');
      expect(staff.compensation?.basicSalary).toBe(75000);
      expect(staff.performanceRating).toBe(4);
      expect(staff.annualLeaveBalance).toBe(25);
      expect(staff.sickLeaveBalance).toBe(10);

      // Check nested objects
      expect(staff.currentAddress).toBeDefined();
      expect(staff.permanentAddress).toBeDefined();
      expect(staff.emergencyContactName).toBeDefined();
      expect(staff.emergencyContactPhone).toBeDefined();
    });

    it('includes department relationships', async () => {
      const adminApi = api(admin);

      // Create and assign to department
      const department = await createDepartmentViaApi(admin, {
        type: EDepartmentType.TEACHING,
        name: 'Science Department',
      });

      await admin.post(`/api/v1/departments/${department.id}/staff/${testStaff.id}`).expect(200);

      const getRes = await adminApi.get(testStaff.id).expect(200);
      expect(getRes.body.departments).toBeDefined();
      expect(Array.isArray(getRes.body.departments)).toBe(true);
      expect(getRes.body.departments.some((d: any) => d.id === department.id)).toBe(true);
    });

    it('returns 404 for non-existent staff', async () => {
      const adminApi = api(admin);

      await adminApi.get(randomUUID()).expect(404);
    });

    it('handles invalid UUID format', async () => {
      const adminApi = api(admin);

      await adminApi.get('invalid-uuid').expect(400);
    });

    it('admin can create staff with minimal data', async () => {
      const adminApi = api(admin);

      const minimalStaff = await createMinimalStaffRecord({
        firstName: 'Minimal',
        lastName: 'Test',
        designation: 'Test Staff',
      });

      expect(minimalStaff.id).toBeDefined();
      expect(minimalStaff.firstName).toBe('Minimal');
      expect(minimalStaff.lastName).toBe('Test');
      expect(minimalStaff.designation).toBe('Test Staff');
    });
  });

  describe('Staff Contact Information', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createStaffRecord({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
        alternatePhone: '+1555123456',
        emergencyContactName: 'John Smith',
        emergencyContactPhone: '+1444987654',
        emergencyContactRelation: 'Husband',
      });
    });

    it('returns complete contact information', async () => {
      const adminApi = api(admin);

      const getRes = await adminApi.get(testStaff.id).expect(200);
      const staff = getRes.body;

      expect(staff.email).toBe('jane.smith@example.com');
      expect(staff.phone).toBe('+1987654321');
      expect(staff.alternatePhone).toBe('+1555123456');
      expect(staff.emergencyContactName).toBe('John Smith');
      expect(staff.emergencyContactPhone).toBe('+1444987654');
      expect(staff.emergencyContactRelation).toBe('Husband');
    });

    it('includes address information', async () => {
      const adminApi = api(admin);

      const getRes = await adminApi.get(testStaff.id).expect(200);
      const staff = getRes.body;

      expect(staff.currentAddress).toBeDefined();
      expect(staff.currentAddress.street).toBeDefined();
      expect(staff.currentAddress.city).toBeDefined();
      expect(staff.currentAddress.state).toBeDefined();
      expect(staff.currentAddress.postalCode).toBeDefined();
      expect(staff.currentAddress.country).toBeDefined();

      expect(staff.permanentAddress).toBeDefined();
      expect(staff.permanentAddress.street).toBeDefined();
      expect(staff.permanentAddress.city).toBeDefined();
    });
  });

  describe('Staff Attendance Tracking', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createStaffRecord({
        firstName: 'Attendance',
        lastName: 'Test',
        workingHoursPerWeek: 40,
        workingDaysPerWeek: 5,
      });
    });

    it('returns attendance information for staff', async () => {
      const adminApi = api(admin);

      const attendanceRes = await adminApi.getAttendance(testStaff.id).expect(200);

      expect(attendanceRes.body.staffId).toBe(testStaff.id);
      expect(attendanceRes.body.workingHoursPerWeek).toBe(40);
      expect(attendanceRes.body.workingDaysPerWeek).toBe(5);
      expect(attendanceRes.body.shiftStartTime).toBeDefined();
      expect(attendanceRes.body.shiftEndTime).toBeDefined();
    });

    it('updates attendance information', async () => {
      const adminApi = api(admin);

      const updateRes = await adminApi.updateAttendance(testStaff.id, {
        workingHoursPerWeek: 45,
        workingDaysPerWeek: 6,
        shiftStartTime: '07:30',
        shiftEndTime: '16:30',
      }).expect(200);

      expect(updateRes.body.workingHoursPerWeek).toBe(45);
      expect(updateRes.body.workingDaysPerWeek).toBe(6);
      expect(updateRes.body.shiftStartTime).toBe('07:30');
      expect(updateRes.body.shiftEndTime).toBe('16:30');
    });

    it('validates attendance update data', async () => {
      const adminApi = api(admin);

      // Invalid working hours
      await adminApi.updateAttendance(testStaff.id, {
        workingHoursPerWeek: 80, // Too high
      }).expect(400);

      // Invalid working days
      await adminApi.updateAttendance(testStaff.id, {
        workingDaysPerWeek: 8, // Too high
      }).expect(400);
    });
  });

  describe('Staff Payroll Information', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createStaffRecord({
        firstName: 'Payroll',
        lastName: 'Test',
        compensation: {
          basicSalary: 50000,
          salaryCurrency: 'NGN',
          houseAllowance: 5000,
          transportAllowance: 3000,
          medicalAllowance: 2000,
          grossSalary: 60000,
          taxDeductible: 3000,
          providentFund: 1000,
          netSalary: 46000,
          paymentMethod: 'bank_transfer',
          bankDetails: {
            bankName: 'Test Bank',
            accountNumber: '1234567890',
          },
        },
      });
    });

    it('returns complete payroll information', async () => {
      const adminApi = api(admin);

      const payrollRes = await adminApi.getPayroll(testStaff.id).expect(200);

      expect(payrollRes.body.compensation?.basicSalary).toBe(50000);
      expect(payrollRes.body.compensation?.houseAllowance).toBe(5000);
      expect(payrollRes.body.compensation?.transportAllowance).toBe(3000);
      expect(payrollRes.body.compensation?.medicalAllowance).toBe(2000);
      expect(payrollRes.body.compensation?.grossSalary).toBe(60000);
      expect(payrollRes.body.compensation?.taxDeductible).toBe(3000);
      expect(payrollRes.body.compensation?.providentFund).toBe(1000);
      expect(payrollRes.body.compensation?.netSalary).toBe(46000);
      expect(payrollRes.body.compensation?.paymentMethod).toBe('bank_transfer');
      expect(payrollRes.body.compensation?.bankDetails?.bankName).toBe('Test Bank');
      expect(payrollRes.body.compensation?.bankDetails?.accountNumber).toBe('1234567890');
    });

    it('updates payroll information', async () => {
      const adminApi = api(admin);

      const updateRes = await adminApi.updatePayroll(testStaff.id, {
        basicSalary: 55000,
        houseAllowance: 6000,
        grossSalary: 65000,
        netSalary: 51000,
      }).expect(200);

      expect(updateRes.body.compensation?.basicSalary).toBe(55000);
      expect(updateRes.body.compensation?.houseAllowance).toBe(6000);
      expect(updateRes.body.compensation?.grossSalary).toBe(65000);
      expect(updateRes.body.compensation?.netSalary).toBe(51000);
    });

    it('validates payroll update data', async () => {
      const adminApi = api(admin);

      // Negative salary
      await adminApi.updatePayroll(testStaff.id, {
        basicSalary: -1000,
      }).expect(400);

      // Invalid payment method
      await adminApi.updatePayroll(testStaff.id, {
        paymentMethod: 'invalid_method',
      }).expect(400);
    });
  });

  describe('Staff Statistics and Analytics', () => {
    beforeEach(async () => {
      // Create diverse staff for statistics
      const staffTypes = Object.values(StaffType);
      const statuses = Object.values(StaffStatus);

      for (let i = 0; i < 20; i++) {
        await createStaffRecord({
          staffType: staffTypes[i % staffTypes.length] as StaffType,
          status: statuses[i % statuses.length] as StaffStatus,
          compensation: {
            basicSalary: faker.number.int({ min: 30000, max: 100000 }),
            salaryCurrency: 'NGN',
            grossSalary: 0,
            netSalary: 0,
            paymentMethod: 'bank_transfer',
          },
          performanceRating: faker.number.int({ min: 1, max: 5 }),
        });
      }
    });

    it('returns comprehensive staff statistics', async () => {
      const adminApi = api(admin);

      const statsRes = await adminApi.getStats().expect(200);

      expect(statsRes.body.totalStaff).toBeDefined();
      expect(typeof statsRes.body.totalStaff).toBe('number');
      expect(statsRes.body.totalStaff).toBeGreaterThanOrEqual(20);

      expect(statsRes.body.staffByType).toBeDefined();
      expect(typeof statsRes.body.staffByType).toBe('object');

      expect(statsRes.body.staffByStatus).toBeDefined();
      expect(typeof statsRes.body.staffByStatus).toBe('object');

      expect(statsRes.body.averageSalary).toBeDefined();
      expect(typeof statsRes.body.averageSalary).toBe('number');

      expect(statsRes.body.averagePerformanceRating).toBeDefined();
      expect(typeof statsRes.body.averagePerformanceRating).toBe('number');
    });

    it('calculates correct statistics', async () => {
      const adminApi = api(admin);

      const statsRes = await adminApi.getStats().expect(200);

      // Verify staff by type includes all types
      Object.values(StaffType).forEach(type => {
        if (typeof type === 'string') {
          expect(statsRes.body.staffByType[type]).toBeDefined();
          expect(typeof statsRes.body.staffByType[type]).toBe('number');
        }
      });

      // Verify staff by status includes all statuses
      Object.values(StaffStatus).forEach(status => {
        if (typeof status === 'string') {
          expect(statsRes.body.staffByStatus[status]).toBeDefined();
          expect(typeof statsRes.body.staffByStatus[status]).toBe('number');
        }
      });

      // Average salary should be reasonable
      expect(statsRes.body.averageSalary).toBeGreaterThan(30000);
      expect(statsRes.body.averageSalary).toBeLessThan(100000);

      // Average performance rating should be between 1 and 5
      expect(statsRes.body.averagePerformanceRating).toBeGreaterThanOrEqual(1);
      expect(statsRes.body.averagePerformanceRating).toBeLessThanOrEqual(5);
    });

    it('staff can view statistics', async () => {
      const staffApi = api(staff);

      await staffApi.getStats().expect(200);
    });

    it('student cannot view statistics (403)', async () => {
      const studentApi = api(student);

      await studentApi.getStats().expect(403);
    });
  });

  describe('Complex Filtering and Search', () => {
    beforeEach(async () => {
      // Create staff with specific attributes for testing
      await createStaffRecord({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        designation: 'Mathematics Teacher',
        staffType: StaffType.TEACHING,
        compensation: {
          basicSalary: 60000,
          salaryCurrency: 'NGN',
          grossSalary: 60000,
          netSalary: 60000,
          paymentMethod: 'bank_transfer',
        },
        performanceRating: 5,
      });

      await createStaffRecord({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        designation: 'Administrator',
        staffType: StaffType.ADMINISTRATIVE,
        compensation: {
          basicSalary: 70000,
          salaryCurrency: 'NGN',
          grossSalary: 70000,
          netSalary: 70000,
          paymentMethod: 'bank_transfer',
        },
        performanceRating: 4,
      });

      await createStaffRecord({
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol.williams@example.com',
        designation: 'Science Teacher',
        staffType: StaffType.TEACHING,
        compensation: {
          basicSalary: 55000,
          salaryCurrency: 'NGN',
          grossSalary: 55000,
          netSalary: 55000,
          paymentMethod: 'bank_transfer',
        },
        performanceRating: 3,
      });
    });

    it('combines multiple filters correctly', async () => {
      const adminApi = api(admin);

      // Filter by staff type and salary range
      const filterRes = await adminApi.list({
        staffType: StaffType.TEACHING,
        minSalary: 55000,
        maxSalary: 65000,
      }).expect(200);

      expect(filterRes.body.length).toBe(2); // Alice and Carol
      expect(filterRes.body.every((s: any) => s.staffType === StaffType.TEACHING)).toBe(true);
      expect(filterRes.body.every((s: any) => s.compensation?.basicSalary >= 55000 && s.compensation?.basicSalary <= 65000)).toBe(true);
    });

    it('searches across multiple fields', async () => {
      const adminApi = api(admin);

      // Search for "teacher" should find both teaching staff
      const searchRes = await adminApi.list({ search: 'teacher' }).expect(200);
      expect(searchRes.body.length).toBe(2);
      expect(searchRes.body.every((s: any) =>
        s.designation.toLowerCase().includes('teacher') ||
        s.staffType.toLowerCase().includes('teaching')
      )).toBe(true);
    });

    it('handles special characters in search', async () => {
      const adminApi = api(admin);

      // Search with special characters
      const searchRes = await adminApi.list({ search: 'alice.johnson' }).expect(200);
      expect(searchRes.body.length).toBeGreaterThan(0);
      expect(searchRes.body.some((s: any) => s.email.includes('alice.johnson'))).toBe(true);
    });
  });

  describe('Performance and Load Testing', () => {
    it('handles large staff datasets efficiently', async () => {
      const adminApi = api(admin);
      const startTime = Date.now();

      // Create 50 staff members
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(createStaffRecord({
          firstName: `Bulk${i}`,
          lastName: `Staff${i}`,
          email: `bulk${i}@example.com`,
        }));
      }

      await Promise.all(promises);
      const createEndTime = Date.now();

      // Test listing performance
      const listStartTime = Date.now();
      const listRes = await adminApi.list().expect(200);
      const listEndTime = Date.now();

      expect(listRes.body.length).toBeGreaterThanOrEqual(50);

      // Should complete within reasonable time
      expect(createEndTime - startTime).toBeLessThan(60000); // 60 seconds for creation
      expect(listEndTime - listStartTime).toBeLessThan(5000); // 5 seconds for listing
    });

    it('handles concurrent staff operations', async () => {
      const adminApi = api(admin);

      // Create multiple staff simultaneously
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          createStaffRecord({
            employeeId: `CONC${i}`,
            firstName: `Concurrent${i}`,
            lastName: 'Test',
            email: `concurrent${i}@example.com`,
            designation: 'Test Staff',
            staffType: StaffType.TEACHING,
            employmentType: EmploymentType.FULL_TIME,
            compensation: {
              basicSalary: 50000,
              salaryCurrency: 'NGN',
              grossSalary: 50000,
              netSalary: 50000,
              paymentMethod: 'bank_transfer',
            },
            status: StaffStatus.ACTIVE,
          })
        );
      }

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.status).toBe(201);
      });

      // Verify all were created
      const listRes = await adminApi.list().expect(200);
      const concurrentStaff = listRes.body.filter((s: any) => s.firstName.includes('Concurrent'));
      expect(concurrentStaff).toHaveLength(10);
    });
  });

  describe('Staff Update Operations', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createMinimalStaffRecord({
        firstName: 'Update',
        lastName: 'Test',
        designation: 'Junior Teacher',
        compensation: {
          basicSalary: 40000,
          salaryCurrency: 'NGN',
          grossSalary: 40000,
          netSalary: 40000,
          paymentMethod: 'bank_transfer',
        },
      });
    });

    it('admin can update staff basic information', async () => {
      const adminApi = api(admin);

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        designation: 'Senior Teacher',
        phone: '+1234567890',
      };

      const updateRes = await adminApi.update(testStaff.id, updateData).expect(200);

      expect(updateRes.body.firstName).toBe('Updated');
      expect(updateRes.body.lastName).toBe('Name');
      expect(updateRes.body.designation).toBe('Senior Teacher');
      expect(updateRes.body.phone).toBe('+1234567890');
    });

    it('admin can update staff employment details', async () => {
      const adminApi = api(admin);

      const updateData = {
        employmentType: EmploymentType.PART_TIME,
        basicSalary: 50000,
        designation: 'Part-time Instructor',
      };

      const updateRes = await adminApi.update(testStaff.id, updateData).expect(200);

      expect(updateRes.body.employmentType).toBe(EmploymentType.PART_TIME);
      expect(updateRes.body.compensation?.basicSalary).toBe(50000);
      expect(updateRes.body.designation).toBe('Part-time Instructor');
    });

    it('admin can update staff contact information', async () => {
      const adminApi = api(admin);

      const updateData = {
        email: 'updated.email@example.com',
        phone: '+1987654321',
        alternatePhone: '+1555123456',
        emergencyContactName: 'Updated Contact',
        emergencyContactPhone: '+1444987654',
      };

      const updateRes = await adminApi.update(testStaff.id, updateData).expect(200);

      expect(updateRes.body.email).toBe('updated.email@example.com');
      expect(updateRes.body.phone).toBe('+1987654321');
      expect(updateRes.body.alternatePhone).toBe('+1555123456');
      expect(updateRes.body.emergencyContactName).toBe('Updated Contact');
      expect(updateRes.body.emergencyContactPhone).toBe('+1444987654');
    });

    it('admin can update staff address information', async () => {
      const adminApi = api(admin);

      const updateData = {
        currentAddress: {
          street: '123 Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          postalCode: '12345',
          country: 'Updated Country',
        },
      };

      const updateRes = await adminApi.update(testStaff.id, updateData).expect(200);

      expect(updateRes.body.currentAddress.street).toBe('123 Updated Street');
      expect(updateRes.body.currentAddress.city).toBe('Updated City');
      expect(updateRes.body.currentAddress.state).toBe('Updated State');
    });

    it('validates email uniqueness on update', async () => {
      const adminApi = api(admin);

      // Create another staff member
      const anotherStaff = await createMinimalStaffRecord({
        email: 'existing.email@example.com',
      });

      // Try to update testStaff with the existing email
      const updateData = {
        email: 'existing.email@example.com',
      };

      await adminApi.update(testStaff.id, updateData).expect(409);
    });

    it('returns 404 for non-existent staff update', async () => {
      const adminApi = api(admin);

      const updateData = {
        firstName: 'Non-existent',
      };

      await adminApi.update(randomUUID(), updateData).expect(404);
    });

    it('staff can update their own information', async () => {
      const staffApi = api(staff);

      const updateData = {
        phone: '+1111111111',
        alternatePhone: '+1222222222',
      };

      await staffApi.update(testStaff.id, updateData).expect(200);
    });

    it('staff cannot update other staff information (403)', async () => {
      const staffApi = api(staff);

      // Create another staff member
      const anotherStaff = await createMinimalStaffRecord();

      const updateData = {
        firstName: 'Unauthorized Update',
      };

      await staffApi.update(anotherStaff.id, updateData).expect(403);
    });
  });

  describe('Staff Delete Operations', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createMinimalStaffRecord({
        firstName: 'Delete',
        lastName: 'Test',
      });
    });

    it('admin can delete staff', async () => {
      const adminApi = api(admin);

      // Delete the staff
      await adminApi.delete(testStaff.id).expect(200);

      // Verify staff is deleted (should return 404)
      await adminApi.get(testStaff.id).expect(404);
    });

    it('returns 404 for non-existent staff delete', async () => {
      const adminApi = api(admin);

      await adminApi.delete(randomUUID()).expect(404);
    });

    it('staff cannot delete staff (403)', async () => {
      const staffApi = api(staff);

      await staffApi.delete(testStaff.id).expect(403);
    });

    it('student cannot delete staff (403)', async () => {
      const studentApi = api(student);

      await studentApi.delete(testStaff.id).expect(403);
    });
  });

  describe('Negative Authorization Tests for CRUD Operations', () => {
    let testStaff: Staff;

    beforeEach(async () => {
      testStaff = await createMinimalStaffRecord({
        firstName: 'Auth',
        lastName: 'Test',
      });
    });

    describe('Create Operations', () => {
      it('staff cannot create staff (403)', async () => {
        const staffApi = api(staff);

        const createData = {
          employeeId: 'STAFF001',
          firstName: 'Unauthorized',
          lastName: 'Create',
          dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          gender: Gender.MALE,
          contactInfo: {
            email: 'unauthorized@example.com',
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
          staffType: StaffType.TEACHING,
          designation: 'Teacher',
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: faker.date.past({ years: 5 }),
          compensation: {
            basicSalary: 40000,
            salaryCurrency: 'NGN',
            grossSalary: 40000,
            netSalary: 40000,
            paymentMethod: 'bank_transfer',
          },
          createdBy: randomUUID(),
          updatedBy: randomUUID(),
        };

        await staffApi.create(createData).expect(403);
      });

      it('student cannot create staff (403)', async () => {
        const studentApi = api(student);

        const createData = {
          employeeId: 'STUDENT001',
          firstName: 'Student',
          lastName: 'Create',
          dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          gender: Gender.FEMALE,
          contactInfo: {
            email: 'student.create@example.com',
            phone: faker.phone.number(),
            emergencyContact: {
              name: faker.person.fullName(),
              phone: faker.phone.number(),
              relation: 'Parent',
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
          staffType: StaffType.ADMINISTRATIVE,
          designation: 'Admin',
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: faker.date.past({ years: 5 }),
          compensation: {
            basicSalary: 35000,
            salaryCurrency: 'NGN',
            grossSalary: 35000,
            netSalary: 35000,
            paymentMethod: 'bank_transfer',
          },
          createdBy: randomUUID(),
          updatedBy: randomUUID(),
        };

        await studentApi.create(createData).expect(403);
      });

      it('unauthenticated user cannot create staff (401)', async () => {
        const anon = request(TestHarness.getApp().getHttpServer());

        const createData = {
          employeeId: 'ANON001',
          firstName: 'Anonymous',
          lastName: 'User',
          dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          gender: Gender.MALE,
          contactInfo: {
            email: 'anon@example.com',
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
          staffType: StaffType.TEACHING,
          designation: 'Teacher',
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: faker.date.past({ years: 5 }),
          compensation: {
            basicSalary: 40000,
            salaryCurrency: 'NGN',
            grossSalary: 40000,
            netSalary: 40000,
            paymentMethod: 'bank_transfer',
          },
          createdBy: randomUUID(),
          updatedBy: randomUUID(),
        };

        await anon.post('/api/v1/staff').send(createData).expect(401);
      });
    });

    describe('Update Operations', () => {
      it('staff cannot update other staff information (403)', async () => {
        const staffApi = api(staff);

        // Create another staff member
        const anotherStaff = await createMinimalStaffRecord({
          firstName: 'Another',
          lastName: 'Staff',
        });

        const updateData = {
          firstName: 'Unauthorized Update',
        };

        await staffApi.update(anotherStaff.id, updateData).expect(403);
      });

      it('student cannot update staff information (403)', async () => {
        const studentApi = api(student);

        const updateData = {
          firstName: 'Student Update',
        };

        await studentApi.update(testStaff.id, updateData).expect(403);
      });

      it('unauthenticated user cannot update staff (401)', async () => {
        const anon = request(TestHarness.getApp().getHttpServer());

        const updateData = {
          firstName: 'Anonymous Update',
        };

        await anon.put(`/api/v1/staff/${testStaff.id}`).send(updateData).expect(401);
      });
    });

    describe('Delete Operations', () => {
      it('staff cannot delete staff (403)', async () => {
        const staffApi = api(staff);

        await staffApi.delete(testStaff.id).expect(403);
      });

      it('student cannot delete staff (403)', async () => {
        const studentApi = api(student);

        await studentApi.delete(testStaff.id).expect(403);
      });

      it('unauthenticated user cannot delete staff (401)', async () => {
        const anon = request(TestHarness.getApp().getHttpServer());

        await anon.delete(`/api/v1/staff/${testStaff.id}`).expect(401);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles invalid UUID format in URLs', async () => {
      const adminApi = api(admin);

      await adminApi.get('invalid-uuid').expect(400);
      await adminApi.update('invalid-uuid', { firstName: 'Test' }).expect(400);
      await adminApi.delete('invalid-uuid').expect(400);
    });

    it('validates required fields on create', async () => {
      const adminApi = api(admin);

      // Missing required fields
      await adminApi.create({}).expect(400);

      // Missing firstName
      await adminApi.create({
        lastName: 'Test',
        email: 'test@example.com',
      }).expect(400);

      // Missing email
      await adminApi.create({
        firstName: 'Test',
        lastName: 'User',
      }).expect(400);
    });

    it('validates email format on create and update', async () => {
      const adminApi = api(admin);

      // Invalid email on create
      const invalidCreateData = {
        employeeId: 'INVALID001',
        firstName: 'Invalid',
        lastName: 'Email',
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: Gender.MALE,
        contactInfo: {
          email: 'invalid-email',
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
        staffType: StaffType.TEACHING,
        designation: 'Teacher',
        employmentType: EmploymentType.FULL_TIME,
        joiningDate: faker.date.past({ years: 5 }),
        compensation: {
          basicSalary: 40000,
          salaryCurrency: 'NGN',
          grossSalary: 40000,
          netSalary: 40000,
          paymentMethod: 'bank_transfer',
        },
        createdBy: randomUUID(),
        updatedBy: randomUUID(),
      };

      await adminApi.create(invalidCreateData).expect(400);

      // Invalid email on update
      const testStaff = await createMinimalStaffRecord();
      await adminApi.update(testStaff.id, { email: 'invalid-email-format' }).expect(400);
    });

    it('validates salary constraints', async () => {
      const adminApi = api(admin);

      const testStaff = await createMinimalStaffRecord();

      // Negative salary
      await adminApi.update(testStaff.id, { compensation: { basicSalary: -1000, salaryCurrency: 'NGN', grossSalary: -1000, netSalary: -1000, paymentMethod: 'bank_transfer' } }).expect(400);

      // Extremely high salary
      await adminApi.update(testStaff.id, { compensation: { basicSalary: 10000000, salaryCurrency: 'NGN', grossSalary: 10000000, netSalary: 10000000, paymentMethod: 'bank_transfer' } }).expect(400);
    });

    it('handles concurrent staff operations', async () => {
      const adminApi = api(admin);

      // Create multiple staff simultaneously
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          adminApi.create({
            employeeId: `CONC${i}`,
            firstName: `Concurrent${i}`,
            lastName: 'Test',
            dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
            gender: Gender.MALE,
            contactInfo: {
              email: `concurrent${i}@example.com`,
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
            staffType: StaffType.TEACHING,
            designation: 'Teacher',
            employmentType: EmploymentType.FULL_TIME,
            joiningDate: faker.date.past({ years: 5 }),
            compensation: {
              basicSalary: 40000,
              salaryCurrency: 'NGN',
              grossSalary: 40000,
              netSalary: 40000,
              paymentMethod: 'bank_transfer',
            },
            createdBy: randomUUID(),
            updatedBy: randomUUID(),
          })
        );
      }

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.status).toBe(201);
      });
    });
  });
});