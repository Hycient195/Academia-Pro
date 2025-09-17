// Academia Pro - Department True Integration Tests (Service-level with real Postgres, mocked Audit)
// Mirrors the Students true integration tests approach using Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { randomUUID } from 'crypto';

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
      description: overrides.description ?? undefined,
    };
    return service.createDepartment(dto, creator);
  }

  async function makeStaff(overrides: Partial<Staff> = {}): Promise<Staff> {
    const seq = Math.floor(Math.random() * 1_000_000);
    const salary = overrides.basicSalary ?? 1000;
    const gross = overrides.grossSalary ?? salary; // keep simple
    const net = overrides.netSalary ?? gross;

    // Generate employeeId within 20 character limit
    const employeeId = overrides.employeeId ?? `EMP${seq.toString().padStart(6, '0')}`;

    const staff = await staffRepository.save({
      schoolId: overrides.schoolId ?? randomUUID(),
      employeeId,
      firstName: overrides.firstName ?? 'John',
      lastName: overrides.lastName ?? `Doe${seq}`,
      middleName: overrides.middleName,
      gender: overrides.gender ?? Gender.MALE,
      dateOfBirth: overrides.dateOfBirth ?? new Date('1990-01-01'),
      maritalStatus: overrides.maritalStatus ?? MaritalStatus.SINGLE,
      bloodGroup: overrides.bloodGroup ?? BloodGroup.O_POSITIVE,
      email: overrides.email ?? `john${seq}@example.com`,
      phone: overrides.phone ?? `+2348000${seq}`,
      alternatePhone: overrides.alternatePhone,
      emergencyContactName: overrides.emergencyContactName ?? 'Jane Doe',
      emergencyContactPhone: overrides.emergencyContactPhone ?? `+2349000${seq}`,
      emergencyContactRelation: overrides.emergencyContactRelation ?? 'Spouse',
      currentAddress: overrides.currentAddress ?? {
        street: '1 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '100001',
        country: 'NG',
      },
      permanentAddress: overrides.permanentAddress,
      staffType: overrides.staffType ?? StaffType.TEACHING,
      departments: overrides.departments, // leave undefined initially
      designation: overrides.designation ?? 'Teacher',
      reportingTo: overrides.reportingTo,
      employmentType: overrides.employmentType ?? EmploymentType.FULL_TIME,
      joiningDate: overrides.joiningDate ?? new Date('2020-01-01'),
      probationEndDate: overrides.probationEndDate,
      contractEndDate: overrides.contractEndDate,
      status: overrides.status, // defaults handled by entity
      basicSalary: salary,
      salaryCurrency: overrides.salaryCurrency ?? 'USD',
      houseAllowance: overrides.houseAllowance ?? 0,
      transportAllowance: overrides.transportAllowance ?? 0,
      medicalAllowance: overrides.medicalAllowance ?? 0,
      otherAllowances: overrides.otherAllowances ?? 0,
      grossSalary: gross,
      taxDeductible: overrides.taxDeductible ?? 0,
      providentFund: overrides.providentFund ?? 0,
      otherDeductions: overrides.otherDeductions ?? 0,
      netSalary: net,
      paymentMethod: overrides.paymentMethod ?? 'bank_transfer',
      bankName: overrides.bankName,
      bankAccountNumber: overrides.bankAccountNumber,
      bankBranch: overrides.bankBranch,
      ifscCode: overrides.ifscCode,
      qualifications: overrides.qualifications ?? [],
      certifications: overrides.certifications ?? [],
      previousExperience: overrides.previousExperience ?? [],
      totalExperienceYears: overrides.totalExperienceYears ?? 0,
      performanceRating: overrides.performanceRating,
      lastPerformanceReview: overrides.lastPerformanceReview,
      nextPerformanceReview: overrides.nextPerformanceReview,
      performanceNotes: overrides.performanceNotes,
      annualLeaveBalance: overrides.annualLeaveBalance ?? 30,
      sickLeaveBalance: overrides.sickLeaveBalance ?? 12,
      maternityLeaveBalance: overrides.maternityLeaveBalance ?? 0,
      paternityLeaveBalance: overrides.paternityLeaveBalance ?? 0,
      casualLeaveBalance: overrides.casualLeaveBalance ?? 12,
      workingHoursPerWeek: overrides.workingHoursPerWeek ?? 40,
      workingDaysPerWeek: overrides.workingDaysPerWeek ?? 5,
      shiftStartTime: overrides.shiftStartTime ?? '08:00',
      shiftEndTime: overrides.shiftEndTime ?? '17:00',
      medicalInfo: overrides.medicalInfo,
      documents: overrides.documents ?? [],
      userId: overrides.userId,
      biometricId: overrides.biometricId,
      rfidCardNumber: overrides.rfidCardNumber,
      communicationPreferences: overrides.communicationPreferences ?? {},
      tags: overrides.tags ?? [],
      metadata: overrides.metadata,
      internalNotes: overrides.internalNotes,
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
        { type: EDepartmentType.TEACHING, name: 'Mathematics', description: 'Math Dept' },
        creatorId,
      );

      expect(dept).toBeDefined();
      expect(dept.id).toBeDefined();
      expect(dept.type).toBe(EDepartmentType.TEACHING);
      expect(dept.name).toBe('Mathematics');
      expect(mockAuditService.logActivity).toHaveBeenCalled();

      // Assert audit payload basics
      const call = mockAuditService.logActivity.mock.calls.find(
        (c) => c[0]?.action === AuditAction.DATA_CREATED && c[0]?.resource === 'department',
      );
      expect(call).toBeTruthy();
      expect(call?.[0]?.details?.eventType).toBe('department_creation');
      expect(call?.[0]?.userId).toBe(creatorId);
    });

    it('throws ConflictException when type+name already exists', async () => {
      const creatorId = randomUUID();
      await service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Mathematics' }, creatorId);

      await expect(
        service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Mathematics' }, creatorId),
      ).rejects.toThrow('Department with this type and name already exists');
    });
  });

  describe('Get Department(s)', () => {
    it('gets department by id and fails for unknown id', async () => {
      const d = await makeDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic' });
      const fetched = await service.getDepartmentById(d.id);
      expect(fetched.id).toBe(d.id);
      expect(fetched.name).toBe('Clinic');
      expect(Array.isArray(fetched.staff)).toBe(true);

      await expect(service.getDepartmentById(randomUUID())).rejects.toThrow('Department with ID');
    });

    it('lists all with filters: search, type, limit & offset (ordered by name ASC)', async () => {
      const creatorId = randomUUID();
      const a = await service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Mathematics' }, creatorId);
      const b = await service.createDepartment({ type: EDepartmentType.TEACHING, name: 'Physics' }, creatorId);
      const c = await service.createDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic' }, creatorId);

      // Assign a staff to Physics to verify relation loads
      const staff = await makeStaff();
      await service.assignStaffToDepartment(b.id, staff.id, creatorId);

      const all = await service.getAllDepartments();
      expect(all.map((d) => d.name)).toEqual(['Clinic', 'Mathematics', 'Physics']); // alphabetical

      const teachingOnly = await service.getAllDepartments({ type: EDepartmentType.TEACHING });
      expect(teachingOnly.map((d) => d.name)).toEqual(['Mathematics', 'Physics']);

      const searchMath = await service.getAllDepartments({ search: 'math' });
      expect(searchMath.map((d) => d.name)).toEqual(['Mathematics']);

      const paged = await service.getAllDepartments({ limit: 1, offset: 1 });
      expect(paged.map((d) => d.name)).toEqual(['Mathematics']); // second in sorted order
    });

    it('gets departments by type sorted by name', async () => {
      await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Alpha' });
      await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Beta' });
      await makeDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic' });

      const teaching = await service.getDepartmentsByType(EDepartmentType.TEACHING);
      expect(teaching.map((d) => d.name)).toEqual(['Alpha', 'Beta']);
    });
  });

  describe('Update Department', () => {
    it('updates department fields and audits', async () => {
      const userId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.IT, name: 'ICT' });

      const updated = await service.updateDepartment(d.id, { description: 'Information Tech' }, userId);
      expect(updated.description).toBe('Information Tech');
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
      const d1 = await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Mathematics' });
      const d2 = await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Physics' });

      await expect(
        service.updateDepartment(d2.id, { name: 'Mathematics' }, userId),
      ).rejects.toThrow('Department with this type and name already exists');
    });
  });

  describe('Assign and Remove Staff', () => {
    it('assigns staff to department and audits, prevents duplicate assignment', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Mathematics' });
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
      const d = await makeDepartment({ type: EDepartmentType.SECURITY, name: 'Security' });
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
      const d = await makeDepartment({ type: EDepartmentType.BOARDING, name: 'Hostel' });

      await expect(service.assignStaffToDepartment(d.id, randomUUID(), adminId)).rejects.toThrow('Staff member with ID');
      await expect(service.removeStaffFromDepartment(d.id, randomUUID(), adminId)).rejects.toThrow('Staff member with ID');
    });
  });

  describe('Delete Department', () => {
    it('prevents deletion when staff is assigned', async () => {
      const adminId = randomUUID();
      const d = await makeDepartment({ type: EDepartmentType.MEDICAL, name: 'Nursing' });
      const s = await makeStaff();
      await service.assignStaffToDepartment(d.id, s.id, adminId);

      await expect(service.deleteDepartment(d.id)).rejects.toThrow('Cannot delete department with assigned staff members');
    });

    it('deletes an empty department and audits the deletion', async () => {
      const d = await makeDepartment({ type: EDepartmentType.LIBRARY, name: 'Library' });

      await service.deleteDepartment(d.id);

      await expect(service.getDepartmentById(d.id)).rejects.toThrow('Department with ID');

      const deletionCall = mockAuditService.logActivity.mock.calls.find(
        (c) =>
          c[0]?.resource === 'department' &&
          c[0]?.action === AuditAction.DATA_DELETED &&
          c[0]?.details?.eventType === 'department_deletion',
      );
      expect(deletionCall).toBeTruthy();
      // userId is 'system' in the service for deletion audit
      expect(deletionCall?.[0]?.userId).toBe('system');
    });
  });

  describe('Statistics', () => {
    it('computes department statistics correctly', async () => {
      const adminId = randomUUID();

      const dTeach = await makeDepartment({ type: EDepartmentType.TEACHING, name: 'Alpha' });
      const dMed = await makeDepartment({ type: EDepartmentType.MEDICAL, name: 'Clinic' });
      const dIT = await makeDepartment({ type: EDepartmentType.IT, name: 'ICT' });

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
      expect(stats.averageStaffPerDepartment).toBe(1.33); // (3+1+0)/3 = 1.333... rounded to 1.33

      const top = stats.departmentsWithMostStaff[0];
      expect(top.departmentId).toBe(dTeach.id);
      expect(top.departmentName).toBe('Alpha');
      expect(top.staffCount).toBe(3);
    });
  });
});