// Academia Pro - Bulk Import Students True Integration Tests (Super Admin Portal flow)
// Tests using real Postgres database with Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StudentsService } from '../../students.service';
import { Student, StudentStatus, EnrollmentType } from '../../student.entity';
import { StudentAuditService } from '../../services/student-audit.service';
import { StudentAuditLog, AuditAction, AuditEntityType } from '../../entities/student-audit-log.entity';
import { AuditConfigService } from '../../../common/audit/audit.config';
import { School, SchoolStatus, SubscriptionPlan } from '../../../schools/school.entity';
import { TSchoolType } from '@academia-pro/types/schools';

describe('StudentsService - Bulk Import True Integration Tests (Super Admin Portal)', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;
  let schoolRepository: Repository<School>;
  let auditLogRepository: Repository<StudentAuditLog>;
  let moduleFixture: TestingModule;
  let postgresContainer: StartedPostgreSqlContainer;
  let testDataSource: DataSource;
  let schoolAId: string;
  let schoolBId: string;

  beforeAll(async () => {
    // Start PostgreSQL container
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('test_academia_pro')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    // Create test DataSource
    testDataSource = new DataSource({
      type: 'postgres',
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      username: postgresContainer.getUsername(),
      password: postgresContainer.getPassword(),
      database: postgresContainer.getDatabase(),
      entities: [
        'src/users/**/*.entity{.ts,.js}',
        'src/schools/**/*.entity{.ts,.js}',
        'src/students/**/*.entity{.ts,.js}',
        'src/academic/**/*.entity{.ts,.js}',
        'src/attendance/**/*.entity{.ts,.js}',
        'src/examination/**/*.entity{.ts,.js}',
        'src/fee/**/*.entity{.ts,.js}',
        'src/library/**/*.entity{.ts,.js}',
        'src/hostel/**/*.entity{.ts,.js}',
        'src/transportation/**/*.entity{.ts,.js}',
        'src/inventory/**/*.entity{.ts,.js}',
        'src/communication/**/*.entity{.ts,.js}',
        'src/iam/**/*.entity{.ts,.js}',
        'src/common/**/*.entity{.ts,.js}',
        'src/auth/**/*.entity{.ts,.js}',
        'src/security/**/*.entity{.ts,.js}',
      ],
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
    // Reset DB
    await testDataSource.synchronize(true);

    const mockAuditConfigService = {
      sanitizeDetails: jest.fn().mockReturnValue({}),
    };

    moduleFixture = await Test.createTestingModule({
      providers: [
        StudentsService,
        StudentAuditService,
        {
          provide: AuditConfigService,
          useValue: mockAuditConfigService,
        },
        {
          provide: getRepositoryToken(Student),
          useFactory: () => testDataSource.getRepository(Student),
        },
        {
          provide: getRepositoryToken(StudentAuditLog),
          useFactory: () => testDataSource.getRepository(StudentAuditLog),
        },
        {
          provide: getRepositoryToken(School),
          useFactory: () => testDataSource.getRepository(School),
        },
      ],
    }).compile();

    service = moduleFixture.get<StudentsService>(StudentsService);
    studentRepository = moduleFixture.get<Repository<Student>>(getRepositoryToken(Student));
    schoolRepository = moduleFixture.get<Repository<School>>(getRepositoryToken(School));
    auditLogRepository = moduleFixture.get<Repository<StudentAuditLog>>(getRepositoryToken(StudentAuditLog));

    // Create two schools (to test email uniqueness within school scope)
    const schoolA = await schoolRepository.save({
      code: 'SCH-A',
      name: 'Alpha School',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      maxStudents: 5000,
      currentStudents: 0,
      maxStaff: 500,
      currentStaff: 0,
      createdBy: 'system',
    });
    schoolAId = schoolA.id;

    const schoolB = await schoolRepository.save({
      code: 'SCH-B',
      name: 'Beta School',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      maxStudents: 5000,
      currentStudents: 0,
      maxStaff: 500,
      currentStaff: 0,
      createdBy: 'system',
    });
    schoolBId = schoolB.id;
  });

  afterEach(async () => {
    await moduleFixture.close();
  });

  // Helpers
  let __seq = 1;
  function makeRow(overrides: Partial<Record<string, any>> = {}) {
    // Single student CSV row-like object
    const baseNumber = __seq++;
    return {
      FirstName: 'John',
      LastName: 'Doe',
      MiddleName: 'X',
      DateOfBirth: '2008-01-01',
      Gender: 'male',
      BloodGroup: 'A+',
      Email: `john${baseNumber}@example.com`,
      Phone: `+1000000${baseNumber}`,
      AdmissionNumber: `ADM-${baseNumber}`, // can be omitted to test auto-generation
      Stage: 'JSS',
      GradeCode: 'JSS2',
      StreamSection: 'A',
      AdmissionDate: '2020-09-01',
      EnrollmentType: EnrollmentType.REGULAR,
      AddressStreet: '123 Test St',
      AddressCity: 'Test City',
      AddressState: 'TS',
      AddressPostalCode: '12345',
      AddressCountry: 'NG',
      FatherName: 'Peter Doe',
      FatherPhone: '+234700000001',
      FatherEmail: 'peter.doe@example.com',
      MotherName: 'Mary Doe',
      MotherPhone: '+234700000002',
      MotherEmail: 'mary.doe@example.com',
      ...overrides,
    };
  }

  describe('Service Instantiation', () => {
    it('should be defined and expose bulkImport', () => {
      expect(service).toBeDefined();
      expect(typeof service.bulkImport).toBe('function');
    });
  });

  describe('bulkImport - success paths', () => {
    it('imports a batch of valid rows and writes audit logs', async () => {
      const rows = [
        makeRow({ GradeCode: 'JSS1', StreamSection: 'A' }),
        makeRow({ GradeCode: 'JSS2', StreamSection: 'B' }),
        makeRow({ GradeCode: 'SSS1', StreamSection: 'C' }),
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.total).toBe(rows.length);
      expect(result.successful).toBe(rows.length);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.importedIds).toHaveLength(rows.length);

      // Verify DB students created
      const created = await studentRepository.findByIds(result.importedIds);
      expect(created).toHaveLength(rows.length);
      created.forEach((st, idx) => {
        expect(st.schoolId).toBe(schoolAId);
        expect(st.firstName).toBe(rows[idx].FirstName);
        expect(st.lastName).toBe(rows[idx].LastName);
        expect(st.gradeCode).toBe(rows[idx].GradeCode);
        expect(st.streamSection).toBe(rows[idx].StreamSection);
        // admissionNumber is either provided or generated - ensure non-empty
        expect(st.admissionNumber && st.admissionNumber.length).toBeGreaterThan(0);
        // Status default active
        expect(st.status).toBe(StudentStatus.ACTIVE);
      });

      // Verify audit logs created (CREATE on STUDENT_PROFILE for each)
      const logs = await auditLogRepository.find({ where: { entityType: AuditEntityType.STUDENT_PROFILE, action: AuditAction.CREATE } });
      expect(logs.length).toBe(rows.length);
      const logStudentIds = logs.map(l => l.studentId);
      result.importedIds.forEach(id => expect(logStudentIds).toContain(id));
    });

    it('auto-generates admission number when missing and keeps uniqueness', async () => {
      const rows = [
        makeRow({ AdmissionNumber: undefined }), // missing
        makeRow({ AdmissionNumber: undefined }), // missing
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.successful).toBe(2);
      const students = await studentRepository.findByIds(result.importedIds);
      expect(students[0].admissionNumber).toBeTruthy();
      expect(students[1].admissionNumber).toBeTruthy();
      expect(students[0].admissionNumber).not.toBe(students[1].admissionNumber);
    });

    it('allows same email across different schools but not within same school', async () => {
      const sameEmail = 'duplicate@example.com';

      // In school A: first row should pass
      const resultA = await service.bulkImport({
        schoolId: schoolAId,
        data: [
          makeRow({ Email: sameEmail }),
          makeRow({ Email: sameEmail }), // duplicate within same school should fail
        ],
      });

      expect(resultA.total).toBe(2);
      expect(resultA.successful).toBe(1);
      expect(resultA.failed).toBe(1);
      expect(resultA.errors).toHaveLength(1);
      expect(String(resultA.errors[0].message || '')).toMatch(/email/i);

      // In school B: same email should be acceptable for a different school context
      const resultB = await service.bulkImport({
        schoolId: schoolBId,
        data: [
          makeRow({ Email: sameEmail }), // fresh for school B
        ],
      });

      expect(resultB.total).toBe(1);
      expect(resultB.successful).toBe(1);
      expect(resultB.failed).toBe(0);
    });
  });

  describe('bulkImport - failure paths and mixed results', () => {
    it('fails rows with duplicate admission numbers within same batch', async () => {
      const dupAdm = 'ADM-DUP-001';
      const rows = [
        makeRow({ AdmissionNumber: dupAdm, Email: 'first@dup.com' }),
        makeRow({ AdmissionNumber: dupAdm, Email: 'second@dup.com' }), // duplicate
        makeRow({ AdmissionNumber: 'ADM-OK-002', Email: 'ok@dup.com' }),
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2); // second row fails
      expect(String(result.errors[0].message || '')).toMatch(/admission number/i);

      // Verify that first and third students exist with expected admission numbers
      const present = await studentRepository.findByIds(result.importedIds);
      const adms = present.map(s => s.admissionNumber);
      expect(adms).toEqual(expect.arrayContaining([dupAdm, 'ADM-OK-002']));
    });

    it('fails rows missing required fields (e.g., DateOfBirth) and reports row numbers', async () => {
      const rows = [
        makeRow({ DateOfBirth: '2007-03-02' }),
        makeRow({ DateOfBirth: undefined }), // missing
        makeRow({ DateOfBirth: '2009-09-09' }),
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.total).toBe(3);
      // Depending on DB constraints, one missing date should fail
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(String(result.errors[0].message || '')).toMatch(/date|birth|invalid|null/i);
    });

    it('returns structured errors with row number, message, and original row data', async () => {
      const badEmail = 'not-an-email';
      const rows = [
        makeRow({ Email: 'ok1@example.com' }),
        makeRow({ Email: badEmail }), // will likely fail email uniqueness only if duplicate; but DB itself might accept any string
        // Manufacture a hard failure by omitting GradeCode so service may still save;
        // Use an extreme failure: undefined DateOfBirth which is not-null in entity
        makeRow({ DateOfBirth: undefined }),
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      // Only the third should fail on missing date; second might still pass because create() does not validate email format
      expect(result.total).toBe(3);
      expect(result.failed).toBe(1);
      expect(result.errors[0]).toHaveProperty('row', 3);
      expect(result.errors[0]).toHaveProperty('data');
      expect(result.errors[0]).toHaveProperty('message');
    });
  });

  describe('bulkImport - mapping and persistence', () => {
    it('persists enrollmentType, stage, gradeCode, and streamSection correctly', async () => {
      const rows = [
        makeRow({
          EnrollmentType: EnrollmentType.INTERNATIONAL,
          Stage: 'SSS',
          GradeCode: 'SSS2',
          StreamSection: 'Science',
        }),
      ];

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.successful).toBe(1);
      const student = await studentRepository.findOne({ where: { id: result.importedIds[0] } });
      expect(student).toBeTruthy();
      expect(student?.enrollmentType).toBe(EnrollmentType.INTERNATIONAL);
      expect(student?.stage).toBe('SSS');
      expect(student?.gradeCode).toBe('SSS2');
      expect(student?.streamSection).toBe('Science');
    });

    it('saves address fields under address jsonb and retains status ACTIVE by default', async () => {
      const row = makeRow({
        AddressStreet: '456 Another Rd',
        AddressCity: 'Mega City',
        AddressState: 'MC',
        AddressPostalCode: '55555',
        AddressCountry: 'NG',
      });

      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: [row],
      });

      const student = await studentRepository.findOne({ where: { id: result.importedIds[0] } });
      expect(student?.status).toBe(StudentStatus.ACTIVE);
      expect(student?.address?.street).toBe('456 Another Rd');
      expect(student?.address?.city).toBe('Mega City');
      expect(student?.address?.state).toBe('MC');
      expect(student?.address?.postalCode).toBe('55555');
      expect(student?.address?.country).toBe('NG');
    });
  });

  describe('bulkImport - scale and stability', () => {
    it('imports a moderate-size batch and maintains correct counts', async () => {
      const rows = Array.from({ length: 25 }).map(() => makeRow());
      const result = await service.bulkImport({
        schoolId: schoolAId,
        data: rows,
      });

      expect(result.total).toBe(25);
      expect(result.successful + result.failed).toBe(25);
      expect(result.importedIds.length + result.errors.length).toBe(25);

      // sanity check: at least 20 should pass under normal conditions
      expect(result.successful).toBeGreaterThanOrEqual(20);

      // confirm persistence count
      const persisted = await studentRepository.findByIds(result.importedIds);
      expect(persisted.length).toBe(result.importedIds.length);
    });
  });
});