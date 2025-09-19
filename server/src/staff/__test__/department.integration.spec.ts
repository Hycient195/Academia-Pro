// Academia Pro - Department True Integration Tests (Service-level with real Postgres, mocked Audit)
// Mirrors the Students true integration tests approach using Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

import { DepartmentService } from '../services/department.service';
import { Department } from '../entities/department.entity';
import { Staff, Gender, MaritalStatus, BloodGroup, StaffType, EmploymentType } from '../entities/staff.entity';
import { EDepartmentType } from '@academia-pro/types/staff';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction } from '../../security/types/audit.types';

describe('DepartmentService - True Integration Tests', () => {
  let service: DepartmentService;
  let departmentRepository: Repository<Department>;
  let staffRepository: Repository<Staff>;
  let moduleFixture: TestingModule;
  let postgresContainer: StartedPostgreSqlContainer;
  let testDataSource: DataSource;
  let mockAuditService: { logActivity: jest.Mock };

  beforeAll(async () => {
    // Start PostgreSQL container
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('test_academia_pro_staff')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    // Create test DataSource with only the entities we need
    testDataSource = new DataSource({
      type: 'postgres',
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      username: postgresContainer.getUsername(),
      password: postgresContainer.getPassword(),
      database: postgresContainer.getDatabase(),
      entities: [Department, Staff],
      synchronize: true,
      logging: false,
      dropSchema: true,
    });

    await testDataSource.initialize();
  }, 60000);

  afterAll(async () => {
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
    if (postgresContainer) {
      await postgresContainer.stop();
    }
  }, 30000);

  beforeEach(async () => {
    // Clean DB
    await testDataSource.synchronize(true);

    mockAuditService = {
      logActivity: jest.fn().mockResolvedValue(undefined),
    };

    moduleFixture = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(Department),
          useFactory: () => testDataSource.getRepository(Department),
        },
        {
          provide: getRepositoryToken(Staff),
          useFactory: () => testDataSource.getRepository(Staff),
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = moduleFixture.get<DepartmentService>(DepartmentService);
    departmentRepository = moduleFixture.get<Repository<Department>>(getRepositoryToken(Department));
    staffRepository = moduleFixture.get<Repository<Staff>>(getRepositoryToken(Staff));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleFixture.close();
  });

  // Helpers
  async function makeDepartment(overrides: Partial<Pick<Department, 'type' | 'name' | 'description'>> = {}, createdBy?: string): Promise<Department> {
    const creator = createdBy ?? randomUUID();
    const dto = {
      type: overrides.type ?? EDepartmentType.TEACHING,
      name: overrides.name ?? `Dept-${Math.random().toString(36).slice(2, 7)}`,
      description: overrides.description ?? faker.lorem.sentence(),
    };
    return service.createDepartment(dto, creator);
  }

  async function makeStaff(overrides: Partial<Staff> & {
    basicSalary?: number;
    grossSalary?: number;
    netSalary?: number;
    salaryCurrency?: string;
    houseAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    taxDeductible?: number;
    providentFund?: number;
    otherDeductions?: number;
    paymentMethod?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankBranch?: string;
    ifscCode?: string;
  } = {}): Promise<Staff> {
    const seq = Math.floor(Math.random() * 1_000_000);
    const salary = overrides.basicSalary ?? faker.number.int({ min: 30000, max: 100000 });
    const gross = overrides.grossSalary ?? salary;
    const net = overrides.netSalary ?? gross;

    const employeeId = overrides.employeeId ?? `EMP${seq.toString().padStart(6, '0')}`;

    // Build compensation object
    const compensation = {
      basicSalary: salary,
      salaryCurrency: overrides.salaryCurrency ?? 'en',
      houseAllowance: overrides.houseAllowance ?? faker.number.int({ min: 0, max: 10000 }),
      transportAllowance: overrides.transportAllowance ?? faker.number.int({ min: 0, max: 5000 }),
      medicalAllowance: overrides.medicalAllowance ?? faker.number.int({ min: 0, max: 3000 }),
      otherAllowances: overrides.otherAllowances ?? faker.number.int({ min: 0, max: 2000 }),
      grossSalary: gross,
      taxDeductible: overrides.taxDeductible ?? faker.number.int({ min: 0, max: 5000 }),
      providentFund: overrides.providentFund ?? faker.number.int({ min: 0, max: 2000 }),
      otherDeductions: overrides.otherDeductions ?? faker.number.int({ min: 0, max: 1000 }),
      netSalary: net,
      paymentMethod: overrides.paymentMethod ?? faker.helpers.arrayElement(['bank_transfer', 'check', 'cash']),
      bankDetails: {
        bankName: overrides.bankName ?? faker.company.name(),
        accountNumber: overrides.bankAccountNumber ?? faker.finance.accountNumber(),
        branch: overrides.bankBranch ?? faker.location.city(),
        ifscCode: overrides.ifscCode ?? faker.finance.routingNumber(),
      },
    };

    const staff = await staffRepository.save({
      schoolId: overrides.schoolId ?? randomUUID(),
      employeeId,
      firstName: overrides.firstName ?? faker.person.firstName(),
      lastName: overrides.lastName ?? faker.person.lastName(),
      middleName: overrides.middleName,
      gender: overrides.gender ?? faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
      dateOfBirth: overrides.dateOfBirth ?? faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      maritalStatus: overrides.maritalStatus ?? faker.helpers.arrayElement(Object.values(MaritalStatus)),
      bloodGroup: overrides.bloodGroup ?? faker.helpers.arrayElement(Object.values(BloodGroup)),
      contactInfo: {
        email: overrides.email ?? faker.internet.email(),
        phone: overrides.phone ?? faker.phone.number(),
        alternatePhone: overrides.alternatePhone,
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
        permanent: overrides.permanentAddress,
      },
      staffType: overrides.staffType ?? faker.helpers.arrayElement(Object.values(StaffType)),
      departments: overrides.departments,
      designation: overrides.designation ?? faker.person.jobTitle(),
      reportingTo: overrides.reportingTo,
      employmentType: overrides.employmentType ?? faker.helpers.arrayElement(Object.values(EmploymentType)),
      joiningDate: overrides.joiningDate ?? faker.date.past({ years: 5 }),
      probationEndDate: overrides.probationEndDate,
      contractEndDate: overrides.contractEndDate,
      status: overrides.status,
      compensation,
      qualifications: overrides.qualifications ?? [faker.person.jobArea()],
      certifications: overrides.certifications ?? [faker.lorem.words(2)],
      previousExperience: overrides.previousExperience ?? [faker.lorem.sentence()],
      totalExperienceYears: overrides.totalExperienceYears ?? faker.number.int({ min: 0, max: 20 }),
      performanceRating: overrides.performanceRating ?? faker.number.int({ min: 1, max: 5 }),
      lastPerformanceReview: overrides.lastPerformanceReview ?? faker.date.past(),
      nextPerformanceReview: overrides.nextPerformanceReview ?? faker.date.future(),
      performanceNotes: overrides.performanceNotes ?? faker.lorem.paragraph(),
      annualLeaveBalance: overrides.annualLeaveBalance ?? faker.number.int({ min: 0, max: 30 }),
      sickLeaveBalance: overrides.sickLeaveBalance ?? faker.number.int({ min: 0, max: 12 }),
      maternityLeaveBalance: overrides.maternityLeaveBalance ?? faker.number.int({ min: 0, max: 90 }),
      paternityLeaveBalance: overrides.paternityLeaveBalance ?? faker.number.int({ min: 0, max: 14 }),
      casualLeaveBalance: overrides.casualLeaveBalance ?? faker.number.int({ min: 0, max: 12 }),
      workingHoursPerWeek: overrides.workingHoursPerWeek ?? faker.number.int({ min: 35, max: 50 }),
      workingDaysPerWeek: overrides.workingDaysPerWeek ?? faker.number.int({ min: 5, max: 6 }),
      shiftStartTime: overrides.shiftStartTime ?? faker.helpers.arrayElement(['08:00', '09:00', '10:00']),
      shiftEndTime: overrides.shiftEndTime ?? faker.helpers.arrayElement(['17:00', '18:00', '19:00']),
      medicalInfo: overrides.medicalInfo ?? faker.lorem.sentences(2),
      documents: overrides.documents ?? [faker.system.fileName()],
      userId: overrides.userId,
      biometricId: overrides.biometricId ?? faker.string.alphanumeric(10),
      rfidCardNumber: overrides.rfidCardNumber ?? faker.string.alphanumeric(12),
      communicationPreferences: overrides.communicationPreferences ?? {
        email: faker.datatype.boolean(),
        sms: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
      },
      tags: overrides.tags ?? [faker.lorem.word()],
      metadata: overrides.metadata,
      internalNotes: overrides.internalNotes ?? faker.lorem.sentences(3),
      createdBy: overrides.createdBy ?? randomUUID(),
      updatedBy: overrides.updatedBy,
    } as any);

    return staff;
  }

  describe('Service Instantiation', () => {
    it('should be defined with all core methods', () => {
      expect(service).toBeDefined();
      expect(typeof service.createDepartment).toBe('function');
      expect(typeof service.getAllDepartments).toBe('function');
      expect(typeof service.getDepartmentsByType).toBe('function');
      expect(typeof service.getDepartmentById).toBe('function');
      expect(typeof service.updateDepartment).toBe('function');
      expect(typeof service.deleteDepartment).toBe('function');
      expect(typeof service.assignStaffToDepartment).toBe('function');
      expect(typeof service.removeStaffFromDepartment).toBe('function');
      expect(typeof service.getDepartmentStatistics).toBe('function');
    });
  });

  describe('Create Department', () => {
    it('creates a department and audits the creation', async () => {
      const creatorId = randomUUID();
      const dept = await service.createDepartment(
        { type: EDepartmentType.TEACHING, name: faker.company.buzzNoun(), description: faker.lorem.sentence() },
        creatorId,
      );

      expect(dept).toBeDefined();
      expect(dept.id).toBeDefined();
      expect(dept.type).toBe(EDepartmentType.TEACHING);
      expect(dept.name).toBeDefined();
      expect(mockAuditService.logActivity).toHaveBeenCalled();

      const call = mockAuditService.logActivity.mock.calls.find(
        (c) => c[0]?.action === AuditAction.DATA_CREATED && c[0]?.resource === 'department',
      );
      expect(call).toBeTruthy();
      expect(call?.[0]?.details?.eventType).toBe('department_creation');
      expect(call?.[0]?.userId).toBe(creatorId);
    });

    it('throws ConflictException when type+name already exists', async () => {
      const creatorId = randomUUID();
      const deptName = faker.company.buzzNoun();
      await service.createDepartment({ type: EDepartmentType.TEACHING, name: deptName }, creatorId);

      await expect(
        service.createDepartment({ type: EDepartmentType.TEACHING, name: deptName }, creatorId),
      ).rejects.toThrow('Department with this type and name already exists');
    });

    it('creates departments with various types and realistic data', async () => {
      const creatorId = randomUUID();
      const testCases = [
        { type: EDepartmentType.ADMINISTRATION, name: 'Human Resources', description: 'Manages employee relations and policies' },
        { type: EDepartmentType.TEACHING, name: 'Mathematics', description: 'Mathematics education department' },
        { type: EDepartmentType.MEDICAL, name: 'School Clinic', description: 'Healthcare services for students and staff' },
        { type: EDepartmentType.IT, name: 'Information Technology', description: 'IT support and infrastructure' },
        { type: EDepartmentType.SECURITY, name: 'Campus Security', description: 'Security and safety services' },
      ];

      for (const testCase of testCases) {
        const dept = await service.createDepartment(testCase, creatorId);
        expect(dept.type).toBe(testCase.type);
        expect(dept.name).toBe(testCase.name);
        expect(dept.description).toBe(testCase.description);
      }
    });

    it('handles edge cases in department creation', async () => {
      const creatorId = randomUUID();

      // Very long description
      const longDesc = faker.lorem.paragraphs(3);
      const dept1 = await service.createDepartment({
        type: EDepartmentType.TEACHING,
        name: faker.company.buzzNoun(),
        description: longDesc,
      }, creatorId);
      expect(dept1.description).toBe(longDesc);

      // Minimal description
      const dept2 = await service.createDepartment({
        type: EDepartmentType.ADMINISTRATION,
        name: faker.company.buzzNoun(),
        description: 'A',
      }, creatorId);
      expect(dept2.description).toBe('A');

      // No description
      const dept3 = await service.createDepartment({
        type: EDepartmentType.MEDICAL,
        name: faker.company.buzzNoun(),
      }, creatorId);
      expect(dept3.description).toBeNull();
    });
  });

  describe('Get Department(s)', () => {
    it('gets department by id and fails for unknown id', async () => {
      const d = await makeDepartment({ type: EDepartmentType.MEDICAL, name: faker.company.buzzNoun() });
      const fetched = await service.getDepartmentById(d.id);
      expect(fetched.id).toBe(d.id);
      expect(fetched.name).toBe(d.name);
      expect(Array.isArray(fetched.staff)).toBe(true);

      await expect(service.getDepartmentById(randomUUID())).rejects.toThrow('Department with ID');
    });

    it('lists all with filters: search, type, limit & offset (ordered by name ASC)', async () => {
      const creatorId = randomUUID();
      const a = await service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Alpha Department' }, creatorId);
      const b = await service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Beta Department' }, creatorId);
      const c = await service.createDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic Department' }, creatorId);

      // Assign a staff to Beta to verify relation loads
      const staff = await makeStaff();
      await service.assignStaffToDepartment(b.id, staff.id, creatorId);

      const all = await service.getAllDepartments();
      expect(all.map((d) => d.name)).toEqual(['Alpha Department', 'Beta Department', 'Clinic Department']);

      const teachingOnly = await service.getAllDepartments({ type: EDepartmentType.TEACHING });
      expect(teachingOnly.map((d) => d.name)).toEqual(['Alpha Department', 'Beta Department']);

      const searchAlpha = await service.getAllDepartments({ search: 'alpha' });
      expect(searchAlpha.map((d) => d.name)).toEqual(['Alpha Department']);

      const paged = await service.getAllDepartments({ limit: 1, offset: 1 });
      expect(paged.map((d) => d.name)).toEqual(['Beta Department']);
    });

    it('gets departments by type sorted by name', async () => {
      await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Zeta' });
      await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Alpha' });
      await makeDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic' });

      const teaching = await service.getDepartmentsByType(EDepartmentType.TEACHING);
      expect(teaching.map((d) => d.name)).toEqual(['Alpha', 'Zeta']);
    });

    it('handles complex search scenarios', async () => {
      const creatorId = randomUUID();
      await service.createDepartment({
        type: EDepartmentType.TEACHING,
        name: 'Advanced Mathematics',
        description: 'Covers calculus and algebra'
      }, creatorId);
      await service.createDepartment({
        type: EDepartmentType.TEACHING,
        name: 'Basic Science',
        description: 'Introduction to physics and chemistry'
      }, creatorId);
      await service.createDepartment({
        type: EDepartmentType.ADMINISTRATION,
        name: 'Student Affairs',
        description: 'Handles student mathematics records'
      }, creatorId);

      // Search in name
      const mathSearch = await service.getAllDepartments({ search: 'mathematics' });
      expect(mathSearch).toHaveLength(2);

      // Search in description
      const calculusSearch = await service.getAllDepartments({ search: 'calculus' });
      expect(calculusSearch).toHaveLength(1);

      // Case insensitive search
      const upperSearch = await service.getAllDepartments({ search: 'MATHEMATICS' });
      expect(upperSearch).toHaveLength(2);

      // Partial word search
      const partialSearch = await service.getAllDepartments({ search: 'sci' });
      expect(partialSearch).toHaveLength(1);
    });

    it('handles pagination correctly', async () => {
      const creatorId = randomUUID();

      // Create 10 departments
      for (let i = 0; i < 10; i++) {
        await service.createDepartment({
          type: EDepartmentType.TEACHING,
          name: `Department ${i.toString().padStart(2, '0')}`,
        }, creatorId);
      }

      // Test pagination
      const page1 = await service.getAllDepartments({ limit: 3, offset: 0 });
      expect(page1).toHaveLength(3);

      const page2 = await service.getAllDepartments({ limit: 3, offset: 3 });
      expect(page2).toHaveLength(3);

      const page3 = await service.getAllDepartments({ limit: 3, offset: 6 });
      expect(page3).toHaveLength(3);

      const page4 = await service.getAllDepartments({ limit: 3, offset: 9 });
      expect(page4).toHaveLength(1);
    });
  });

  describe('Update Department', () => {
    it('updates department fields and audits', async () => {
      const userId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.IT, name: faker.company.buzzNoun() });

      const updated = await service.updateDepartment(d.id, { description: faker.lorem.sentence() }, userId);
      expect(updated.description).toBeDefined();
      expect(mockAuditService.logActivity).toHaveBeenCalled();

      const call = mockAuditService.logActivity.mock.calls.find(
        (c) => c[0]?.action === AuditAction.DATA_UPDATED && c[0]?.resource === 'department',
      );
      expect(call).toBeTruthy();
      expect(call?.[0]?.details?.eventType).toBe('department_update');
      expect(call?.[0]?.userId).toBe(userId);
    });

    it('throws ConflictException when updating to an existing type+name combo', async () => {
      const userId = randomUUID();
      const d1 = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const d2 = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });

      await expect(
        service.updateDepartment(d2.id, { name: d1.name }, userId),
      ).rejects.toThrow('Department with this type and name already exists');
    });

    it('allows updating type while keeping same name', async () => {
      const userId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });

      const updated = await service.updateDepartment(d.id, { type: EDepartmentType.ADMINISTRATION }, userId);
      expect(updated.type).toBe(EDepartmentType.ADMINISTRATION);
      expect(updated.name).toBe(d.name);
    });

    it('allows updating name while keeping same type', async () => {
      const userId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const newName = faker.company.buzzNoun();

      const updated = await service.updateDepartment(d.id, { name: newName }, userId);
      expect(updated.type).toBe(EDepartmentType.TEACHING);
      expect(updated.name).toBe(newName);
    });

    it('handles partial updates correctly', async () => {
      const userId = randomUUID();
      const originalName = faker.company.buzzNoun();
      const originalDesc = faker.lorem.sentence();
      const d = await makeDepartment({
        type: EDepartmentType.TEACHING,
        name: originalName,
        description: originalDesc
      });

      // Update only description
      const updated1 = await service.updateDepartment(d.id, { description: 'New description' }, userId);
      expect(updated1.name).toBe(originalName);
      expect(updated1.description).toBe('New description');

      // Update only name
      const newName = faker.company.buzzNoun();
      const updated2 = await service.updateDepartment(d.id, { name: newName }, userId);
      expect(updated2.name).toBe(newName);
      expect(updated2.description).toBe('New description');
    });
  });

  describe('Assign and Remove Staff', () => {
    it('assigns staff to department and audits, prevents duplicate assignment', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const s = await makeStaff();

      const afterAssign = await service.assignStaffToDepartment(d.id, s.id, adminId);
      expect(afterAssign.staff?.some((st) => st.id === s.id)).toBe(true);

      // Audit for assignment
      const assignmentCall = mockAuditService.logActivity.mock.calls.find(
        (c) =>
          c[0]?.resource === 'department_staff' &&
          c[0]?.action === AuditAction.DATA_UPDATED &&
          c[0]?.details?.eventType === 'staff_department_assignment',
      );
      expect(assignmentCall).toBeTruthy();
      expect(assignmentCall?.[0]?.userId).toBe(adminId);

      // Duplicate assign should conflict
      await expect(service.assignStaffToDepartment(d.id, s.id, adminId)).rejects.toThrow(
        'Staff member is already assigned to this department',
      );
    });

    it('removes staff from department and audits', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.SECURITY, name: faker.company.buzzNoun() });
      const s = await makeStaff();

      await service.assignStaffToDepartment(d.id, s.id, adminId);
      const afterRemove = await service.removeStaffFromDepartment(d.id, s.id, adminId);
      expect(afterRemove.staff?.some((st) => st.id === s.id)).toBe(false);

      // Audit for removal
      const removalCall = mockAuditService.logActivity.mock.calls.find(
        (c) =>
          c[0]?.resource === 'department_staff' &&
          c[0]?.action === AuditAction.DATA_UPDATED &&
          c[0]?.details?.eventType === 'staff_department_removal',
      );
      expect(removalCall).toBeTruthy();
      expect(removalCall?.[0]?.userId).toBe(adminId);
    });

    it('throws NotFound when assigning/removing with unknown staff id', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.BOARDING, name: faker.company.buzzNoun() });

      await expect(service.assignStaffToDepartment(d.id, randomUUID(), adminId)).rejects.toThrow('Staff member with ID');
      await expect(service.removeStaffFromDepartment(d.id, randomUUID(), adminId)).rejects.toThrow('Staff member with ID');
    });

    it('handles multiple staff assignments to same department', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });

      const staff1 = await makeStaff();
      const staff2 = await makeStaff();
      const staff3 = await makeStaff();

      // Assign all staff
      await service.assignStaffToDepartment(d.id, staff1.id, adminId);
      await service.assignStaffToDepartment(d.id, staff2.id, adminId);
      await service.assignStaffToDepartment(d.id, staff3.id, adminId);

      const department = await service.getDepartmentById(d.id);
      expect(department.staff).toHaveLength(3);

      // Remove one staff
      await service.removeStaffFromDepartment(d.id, staff2.id, adminId);
      const updatedDepartment = await service.getDepartmentById(d.id);
      expect(updatedDepartment.staff).toHaveLength(2);
      expect(updatedDepartment.staff?.some(s => s.id === staff2.id)).toBe(false);
    });

    it('allows staff to be assigned to multiple departments', async () => {
      const adminId = randomUUID();
      const dept1 = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const dept2 = await makeDepartment({ type: EDepartmentType.ADMINISTRATION, name: faker.company.buzzNoun() });
      const staff = await makeStaff();

      // Assign staff to both departments
      await service.assignStaffToDepartment(dept1.id, staff.id, adminId);
      await service.assignStaffToDepartment(dept2.id, staff.id, adminId);

      const dept1Data = await service.getDepartmentById(dept1.id);
      const dept2Data = await service.getDepartmentById(dept2.id);

      expect(dept1Data.staff?.some(s => s.id === staff.id)).toBe(true);
      expect(dept2Data.staff?.some(s => s.id === staff.id)).toBe(true);
    });
  });

  describe('Delete Department', () => {
    it('prevents deletion when staff is assigned', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.MEDICAL, name: faker.company.buzzNoun() });
      const s = await makeStaff();
      await service.assignStaffToDepartment(d.id, s.id, adminId);

      await expect(service.deleteDepartment(d.id)).rejects.toThrow('Cannot delete department with assigned staff members');
    });

    it('deletes an empty department and audits the deletion', async () => {
      const d = await makeDepartment({ type: EDepartmentType.LIBRARY, name: faker.company.buzzNoun() });

      await service.deleteDepartment(d.id);

      await expect(service.getDepartmentById(d.id)).rejects.toThrow('Department with ID');

      const deletionCall = mockAuditService.logActivity.mock.calls.find(
        (c) =>
          c[0]?.resource === 'department' &&
          c[0]?.action === AuditAction.DATA_DELETED &&
          c[0]?.details?.eventType === 'department_deletion',
      );
      expect(deletionCall).toBeTruthy();
      expect(deletionCall?.[0]?.userId).toBe('system');
    });

    it('allows deletion after removing all staff', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.SECURITY, name: faker.company.buzzNoun() });
      const s1 = await makeStaff();
      const s2 = await makeStaff();

      // Assign staff
      await service.assignStaffToDepartment(d.id, s1.id, adminId);
      await service.assignStaffToDepartment(d.id, s2.id, adminId);

      // Try to delete - should fail
      await expect(service.deleteDepartment(d.id)).rejects.toThrow('Cannot delete department with assigned staff members');

      // Remove all staff
      await service.removeStaffFromDepartment(d.id, s1.id, adminId);
      await service.removeStaffFromDepartment(d.id, s2.id, adminId);

      // Now deletion should succeed
      await expect(service.deleteDepartment(d.id)).resolves.not.toThrow();
      await expect(service.getDepartmentById(d.id)).rejects.toThrow('Department with ID');
    });
  });

  describe('Statistics', () => {
    it('computes department statistics correctly', async () => {
      const adminId = randomUUID();

      const dTeach = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const dMed = await makeDepartment({ type: EDepartmentType.MEDICAL, name: faker.company.buzzNoun() });
      const dIT = await makeDepartment({ type: EDepartmentType.IT, name: faker.company.buzzNoun() });

      // Assign staff: Alpha -> 3, Clinic -> 1, ICT -> 0
      const s1 = await makeStaff(); await service.assignStaffToDepartment(dTeach.id, s1.id, adminId);
      const s2 = await makeStaff(); await service.assignStaffToDepartment(dTeach.id, s2.id, adminId);
      const s3 = await makeStaff(); await service.assignStaffToDepartment(dTeach.id, s3.id, adminId);
      const s4 = await makeStaff(); await service.assignStaffToDepartment(dMed.id, s4.id, adminId);

      const stats = await service.getDepartmentStatistics();

      expect(stats.totalDepartments).toBe(3);
      expect(stats.departmentsByType[EDepartmentType.TEACHING]).toBe(1);
      expect(stats.departmentsByType[EDepartmentType.MEDICAL]).toBe(1);
      expect(stats.departmentsByType[EDepartmentType.IT]).toBe(1);
      expect(stats.averageStaffPerDepartment).toBe(1.33);
      expect(stats.departmentsWithMostStaff[0].departmentId).toBe(dTeach.id);
      expect(stats.departmentsWithMostStaff[0].staffCount).toBe(3);
    });

    it('handles empty departments correctly', async () => {
      const stats = await service.getDepartmentStatistics();

      expect(stats.totalDepartments).toBe(0);
      expect(stats.averageStaffPerDepartment).toBe(0);
      expect(stats.departmentsWithMostStaff).toHaveLength(0);

      // All department types should be present with 0 count
      Object.values(EDepartmentType).forEach(type => {
        if (typeof type === 'string') {
          expect(stats.departmentsByType[type]).toBe(0);
        }
      });
    });

    it('calculates statistics with large dataset', async () => {
      const adminId = randomUUID();

      // Create departments of all types
      const departments = [];
      for (const type of Object.values(EDepartmentType)) {
        if (typeof type === 'string') {
          for (let i = 0; i < 3; i++) {
            const dept = await makeDepartment({ type: type as EDepartmentType, name: faker.company.buzzNoun() });
            departments.push(dept);
          }
        }
      }

      // Assign varying numbers of staff
      for (let i = 0; i < departments.length; i++) {
        const staffCount = (i % 4) + 1; // 1-4 staff per department
        for (let j = 0; j < staffCount; j++) {
          const staff = await makeStaff();
          await service.assignStaffToDepartment(departments[i].id, staff.id, adminId);
        }
      }

      const stats = await service.getDepartmentStatistics();

      // Should have all department types represented
      Object.values(EDepartmentType).forEach(type => {
        if (typeof type === 'string') {
          expect(stats.departmentsByType[type]).toBeGreaterThan(0);
        }
      });

      expect(stats.totalDepartments).toBe(departments.length);
      expect(stats.averageStaffPerDepartment).toBeGreaterThan(0);
      expect(stats.departmentsWithMostStaff).toHaveLength(Math.min(10, departments.length));
    });
  });

  describe('Pagination', () => {
    it('returns paginated results with correct metadata', async () => {
      const creatorId = randomUUID();

      // Create 15 departments
      for (let i = 0; i < 15; i++) {
        await service.createDepartment({
          type: EDepartmentType.TEACHING,
          name: `Department ${i.toString().padStart(2, '0')}`,
        }, creatorId);
      }

      const result = await service.getAllDepartmentsPaginated({ page: 2, limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('handles edge cases in pagination', async () => {
      const creatorId = randomUUID();

      // Create 7 departments
      for (let i = 0; i < 7; i++) {
        await service.createDepartment({
          type: EDepartmentType.TEACHING,
          name: `Department ${i}`,
        }, creatorId);
      }

      // Page beyond available data
      const result = await service.getAllDepartmentsPaginated({ page: 10, limit: 5 });
      expect(result.data).toHaveLength(0);
      expect(result.pagination.page).toBe(10);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);

      // First page
      const firstPage = await service.getAllDepartmentsPaginated({ page: 1, limit: 5 });
      expect(firstPage.pagination.hasPrev).toBe(false);
      expect(firstPage.pagination.hasNext).toBe(true);

      // Last page
      const lastPage = await service.getAllDepartmentsPaginated({ page: 2, limit: 5 });
      expect(lastPage.pagination.hasPrev).toBe(true);
      expect(lastPage.pagination.hasNext).toBe(false);
    });
  });

  describe('Concurrent Operations', () => {
    it('handles concurrent department creation without conflicts', async () => {
      const creatorId = randomUUID();
      const promises = [];

      // Create multiple departments with unique names simultaneously
      for (let i = 0; i < 10; i++) {
        promises.push(
          service.createDepartment({
            type: EDepartmentType.TEACHING,
            name: `Concurrent Department ${i}`,
            description: faker.lorem.sentence(),
          }, creatorId)
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);

      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.name).toMatch(/^Concurrent Department \d$/);
      });

      // Verify all were created
      const allDepts = await service.getAllDepartments();
      expect(allDepts).toHaveLength(10);
    });

    it('handles concurrent staff assignments correctly', async () => {
      const adminId = randomUUID();
      const department = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          (async () => {
            const staff = await makeStaff();
            return service.assignStaffToDepartment(department.id, staff.id, adminId);
          })()
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);

      const updatedDept = await service.getDepartmentById(department.id);
      expect(updatedDept.staff).toHaveLength(5);
    });
  });

  describe('Data Integrity', () => {
    it('maintains referential integrity when deleting staff', async () => {
      const adminId = randomUUID();
      const department = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const staff = await makeStaff();

      await service.assignStaffToDepartment(department.id, staff.id, adminId);

      // Delete staff directly from repository
      await staffRepository.remove(staff);

      // Department should still exist but staff array should be empty
      const deptAfterDeletion = await service.getDepartmentById(department.id);
      expect(deptAfterDeletion.staff).toHaveLength(0);
    });

    it('handles circular references correctly', async () => {
      const adminId = randomUUID();
      const dept1 = await makeDepartment({ type: EDepartmentType.TEACHING, name: faker.company.buzzNoun() });
      const dept2 = await makeDepartment({ type: EDepartmentType.ADMINISTRATION, name: faker.company.buzzNoun() });
      const staff = await makeStaff();

      // Assign staff to both departments
      await service.assignStaffToDepartment(dept1.id, staff.id, adminId);
      await service.assignStaffToDepartment(dept2.id, staff.id, adminId);

      // Verify staff appears in both departments
      const dept1Data = await service.getDepartmentById(dept1.id);
      const dept2Data = await service.getDepartmentById(dept2.id);

      expect(dept1Data.staff?.some(s => s.id === staff.id)).toBe(true);
      expect(dept2Data.staff?.some(s => s.id === staff.id)).toBe(true);

      // Remove from one department
      await service.removeStaffFromDepartment(dept1.id, staff.id, adminId);

      const dept1AfterRemoval = await service.getDepartmentById(dept1.id);
      const dept2AfterRemoval = await service.getDepartmentById(dept2.id);

      expect(dept1AfterRemoval.staff?.some(s => s.id === staff.id)).toBe(false);
      expect(dept2AfterRemoval.staff?.some(s => s.id === staff.id)).toBe(true);
    });
  });
});