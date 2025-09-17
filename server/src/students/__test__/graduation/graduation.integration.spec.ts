// Academia Pro - Student Graduation True Integration Tests
// Tests using real Postgres database with Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StudentsService } from '../../students.service';
import { Student, StudentStatus, EnrollmentType } from '../../student.entity';
import { StudentAuditService } from '../../services/student-audit.service';
import { StudentAuditLog, AuditAction, AuditEntityType } from '../../entities/student-audit-log.entity';
import { AuditConfigService } from '../../../common/audit/audit.config';
import { TStudentStage } from '@academia-pro/types/student/student.types';
import { School, SchoolStatus, SubscriptionPlan } from '../../../schools/school.entity';
import { TSchoolType } from '@academia-pro/types/schools';
import { IGraduationRequestDto } from '@academia-pro/types/school-admin';
import { randomUUID } from 'crypto';

describe('StudentsService - Graduation True Integration Tests (Battle-tested)', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;
  let schoolRepository: Repository<School>;
  let auditLogRepository: Repository<StudentAuditLog>;
  let moduleFixture: TestingModule;
  let postgresContainer: StartedPostgreSqlContainer;
  let testDataSource: DataSource;
  let testSchoolId: string;

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

    // Initialize test database
    await testDataSource.initialize();
  }, 60000);

  afterAll(async () => {
    // Clean up
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
    if (postgresContainer) {
      await postgresContainer.stop();
    }
  }, 30000);

  beforeEach(async () => {
    // Clear all data before each test
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

    // Create test school
    const testSchool = await schoolRepository.save({
      code: 'TEST001',
      name: 'Test School',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      maxStudents: 1000,
      currentStudents: 0,
      maxStaff: 100,
      currentStaff: 0,
      createdBy: 'system',
    });
    testSchoolId = testSchool.id;
  });

  afterEach(async () => {
    await moduleFixture.close();
  });

  // Helpers
  function stageFromGrade(gradeCode: string): TStudentStage {
    const code = gradeCode.toUpperCase();
    if (code.startsWith('PRY')) return 'PRY' as TStudentStage;
    if (code.startsWith('JSS')) return 'JSS' as TStudentStage;
    if (code.startsWith('SSS')) return 'SSS' as TStudentStage;
    return 'PRY' as TStudentStage;
  }

  async function makeStudent(overrides: Partial<Student> = {}): Promise<Student> {
    const baseNumber = Math.floor(Math.random() * 1000000);
    const grade = (overrides.gradeCode as string) || 'SSS3';
    const stage = (overrides.stage as TStudentStage) || stageFromGrade(grade);

    const student = await studentRepository.save({
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'Student',
      dateOfBirth: overrides.dateOfBirth || new Date('2006-01-01'),
      gender: overrides.gender || 'male',
      admissionNumber: overrides.admissionNumber || `ADM-${baseNumber}`,
      schoolId: overrides.schoolId || testSchoolId,
      stage,
      gradeCode: grade,
      streamSection: overrides.streamSection || 'A',
      admissionDate: overrides.admissionDate || new Date('2019-09-01'),
      enrollmentType: overrides.enrollmentType || EnrollmentType.REGULAR,
      status: overrides.status || StudentStatus.ACTIVE,
      promotionHistory: overrides.promotionHistory || [],
      transferHistory: overrides.transferHistory || [],
      currentGrade: overrides.currentGrade || grade,
      currentSection: overrides.currentSection || (overrides.streamSection || 'A'),
      isBoarding: overrides.isBoarding ?? false,
      email: overrides.email,
      phone: overrides.phone,
      medicalInfo: overrides.medicalInfo || {},
      parentInfo: overrides.parentInfo || {},
      transportation: overrides.transportation || {},
      hostel: overrides.hostel || {},
      financialInfo: overrides.financialInfo || { feeCategory: 'standard', outstandingBalance: 0 },
      documents: overrides.documents || [],
      preferences: overrides.preferences || {
        language: 'en',
        notifications: { email: true, sms: true, push: true, parentCommunication: true },
        extracurricular: [],
      },
      // Defaults chosen to be ELIGIBLE unless overridden
      gpa: overrides.gpa ?? 3.2,
      totalCredits: overrides.totalCredits ?? 160,
      academicStanding: overrides.academicStanding || { probation: false, academicWarning: false, disciplinaryStatus: 'clear' },
    } as any);

    return student;
  }

  describe('Service Instantiation', () => {
    it('should be defined and expose batchGraduate and graduateStudent', () => {
      expect(service).toBeDefined();
      expect(typeof service.batchGraduate).toBe('function');
      expect(typeof service.graduateStudent).toBe('function');
    });
  });

  describe('batchGraduate - all eligible SSS3 ACTIVE students', () => {
    it('graduates eligible students and writes audit logs (clearance: cleared)', async () => {
      const s1 = await makeStudent({ gradeCode: 'SSS3', gpa: 3.8, totalCredits: 180, academicStanding: { probation: false, disciplinaryStatus: 'clear' } });
      const s2 = await makeStudent({ gradeCode: 'SSS3', gpa: 3.2, totalCredits: 170, academicStanding: { probation: false, disciplinaryStatus: 'clear' } });
      const notFinal = await makeStudent({ gradeCode: 'SSS2' }); // not SSS3 -> should not graduate

      const dto: IGraduationRequestDto = { schoolId: testSchoolId, gradeCode: 'SSS3', graduationYear: 2025, clearanceStatus: 'cleared' };

      const result = await service.batchGraduate(dto);

      expect(result.graduatedStudents).toBe(2);
      expect(result.studentIds).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.studentIds).toEqual(expect.arrayContaining([s1.id, s2.id]));
      expect(result.studentIds).not.toContain(notFinal.id);

      const grads = await studentRepository.findByIds(result.studentIds);
      grads.forEach(student => {
        expect(student.status).toBe(StudentStatus.GRADUATED);
        expect(student.graduationYear).toBe(2025);
      });

      const auditLogs = await auditLogRepository.find({
        where: { entityType: AuditEntityType.STUDENT_PROFILE, action: AuditAction.GRADUATE }
      });
      expect(auditLogs.length).toBe(2);
      const loggedIds = auditLogs.map(l => l.entityId);
      expect(loggedIds).toEqual(expect.arrayContaining(result.studentIds));
    });

    it('returns no graduates when none eligible exist', async () => {
      await makeStudent({ gradeCode: 'SSS2' }); // ineligible due to grade
      await makeStudent({ gradeCode: 'JSS3' }); // ineligible due to stage
      await makeStudent({ gradeCode: 'SSS3', gpa: 1.9 }); // ineligible due to GPA

      const dto: IGraduationRequestDto = { schoolId: testSchoolId, gradeCode: 'SSS3', graduationYear: 2025, clearanceStatus: 'cleared' };
      const result = await service.batchGraduate(dto);

      expect(result.graduatedStudents).toBe(0);
      expect(result.studentIds).toHaveLength(0);
      // In full-scan path, service returns errors for ineligible SSS3 ACTIVE students encountered.
      // Here, one SSS3 student fails eligibility (low GPA), so errors length is 1.
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('batchGraduate - with specific studentIds selection', () => {
    it('graduates only selected eligible students and returns errors for ineligible ones', async () => {
      const eligible = await makeStudent({ gradeCode: 'SSS3', gpa: 3.4, totalCredits: 170, academicStanding: { probation: false, disciplinaryStatus: 'clear' } });
      const lowGpa = await makeStudent({ gradeCode: 'SSS3', gpa: 1.5, totalCredits: 180, academicStanding: { probation: false, disciplinaryStatus: 'clear' } });
      const probation = await makeStudent({ gradeCode: 'SSS3', gpa: 3.0, totalCredits: 180, academicStanding: { probation: true, disciplinaryStatus: 'clear' } });
      const notFinal = await makeStudent({ gradeCode: 'SSS2' });

      const dto: IGraduationRequestDto = {
        schoolId: testSchoolId,
        gradeCode: 'SSS3',
        studentIds: [eligible.id, lowGpa.id, probation.id, notFinal.id],
        graduationYear: 2026,
        clearanceStatus: 'cleared',
      };

      const result = await service.batchGraduate(dto);

      expect(result.graduatedStudents).toBe(1);
      expect(result.studentIds).toEqual([eligible.id]);
      expect(result.errors.length).toBe(3);

      const errorIds = result.errors.map(e => e.studentId);
      expect(errorIds).toEqual(expect.arrayContaining([lowGpa.id, probation.id, notFinal.id]));

      // Verify DB
      const dbEligible = await studentRepository.findOne({ where: { id: eligible.id } });
      const dbLowGpa = await studentRepository.findOne({ where: { id: lowGpa.id } });
      const dbProbation = await studentRepository.findOne({ where: { id: probation.id } });
      const dbNotFinal = await studentRepository.findOne({ where: { id: notFinal.id } });

      expect(dbEligible?.status).toBe(StudentStatus.GRADUATED);
      expect(dbEligible?.graduationYear).toBe(2026);
      expect(dbLowGpa?.status).toBe(StudentStatus.ACTIVE);
      expect(dbProbation?.status).toBe(StudentStatus.ACTIVE);
      expect(dbNotFinal?.status).toBe(StudentStatus.ACTIVE);

      // Verify audit
      const auditLogs = await auditLogRepository.find({
        where: { entityType: AuditEntityType.STUDENT_PROFILE, action: AuditAction.GRADUATE }
      });
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].entityId).toBe(eligible.id);
    });

    it('ignores INACTIVE students in selection', async () => {
      const active = await makeStudent({ gradeCode: 'SSS3' });
      const inactive = await makeStudent({ gradeCode: 'SSS3', status: StudentStatus.INACTIVE });

      const dto: IGraduationRequestDto = { schoolId: testSchoolId, gradeCode: 'SSS3', studentIds: [active.id, inactive.id], graduationYear: 2025, clearanceStatus: 'cleared' };
      const result = await service.batchGraduate(dto);

      expect(result.graduatedStudents).toBe(1);
      expect(result.studentIds).toEqual([active.id]);
      expect(result.errors.length).toBe(1); // inactive should be reported ineligible via status
      expect(result.errors.map(e => e.studentId)).toContain(inactive.id);
    });

    it('graduates students with waived clearance (pending status) even if additional clearances not met', async () => {
      // Create a student that would pass basic eligibility but fail additional clearance
      const student = await makeStudent({
        gradeCode: 'SSS3',
        gpa: 3.5,
        totalCredits: 180,
        academicStanding: { probation: false, disciplinaryStatus: 'clear' }
      });

      // Test with 'pending' clearance status - should waive additional clearance requirements
      const dto: IGraduationRequestDto = {
        schoolId: testSchoolId,
        gradeCode: 'SSS3',
        studentIds: [student.id],
        graduationYear: 2026,
        clearanceStatus: 'pending'
      };

      const result = await service.batchGraduate(dto);

      expect(result.graduatedStudents).toBe(1);
      expect(result.studentIds).toEqual([student.id]);
      expect(result.errors).toHaveLength(0); // No errors because clearance was waived

      // Verify the student was actually graduated
      const dbStudent = await studentRepository.findOne({ where: { id: student.id } });
      expect(dbStudent?.status).toBe(StudentStatus.GRADUATED);
      expect(dbStudent?.graduationYear).toBe(2026);
    });
  });

  describe('graduateStudent - single student path', () => {
    it('graduates an eligible SSS3 student with default year = current year', async () => {
      const s = await makeStudent({ gradeCode: 'SSS3', gpa: 3.8, totalCredits: 180, academicStanding: { probation: false, disciplinaryStatus: 'clear' } });

      const result = await service.graduateStudent(s.id);

      expect(result.status).toBe(StudentStatus.GRADUATED);
      expect(result.graduationYear).toBe(new Date().getFullYear());

      const dbStudent = await studentRepository.findOne({ where: { id: s.id } });
      expect(dbStudent?.status).toBe(StudentStatus.GRADUATED);
      expect(dbStudent?.graduationYear).toBe(new Date().getFullYear());

      // Audit log created
      const logs = await auditLogRepository.find({
        where: { entityType: AuditEntityType.STUDENT_PROFILE, action: AuditAction.GRADUATE, entityId: s.id }
      });
      expect(logs.length).toBe(1);
    });

    it('graduates with provided graduation date (sets graduationYear accordingly)', async () => {
      const s = await makeStudent({ gradeCode: 'SSS3', gpa: 3.2, totalCredits: 160 });
      const date = new Date(2024, 0, 1);

      const result = await service.graduateStudent(s.id, date);

      expect(result.status).toBe(StudentStatus.GRADUATED);
      expect(result.graduationYear).toBe(2024);

      const dbStudent = await studentRepository.findOne({ where: { id: s.id } });
      expect(dbStudent?.graduationYear).toBe(2024);
    });

    it('throws NotFoundException for non-existent valid UUID', async () => {
      const missingId = randomUUID();
      await expect(service.graduateStudent(missingId))
        .rejects
        .toThrow('Student not found');
    });

    it('throws BadRequestException when student already graduated', async () => {
      const s = await makeStudent({ gradeCode: 'SSS3', gpa: 3.5, totalCredits: 180 });
      await service.graduateStudent(s.id); // First graduation

      await expect(service.graduateStudent(s.id))
        .rejects
        .toThrow('Student is already graduated');
    });

    it('throws BadRequestException when student is ineligible (not SSS3)', async () => {
      const s = await makeStudent({ gradeCode: 'SSS2', gpa: 3.5, totalCredits: 180 });

      await expect(service.graduateStudent(s.id))
        .rejects
        .toThrow('Student must be in final grade (SSS3) to graduate');
    });

    it('throws BadRequestException when ineligible by GPA/credits/probation/discipline/finance', async () => {
      const lowGpa = await makeStudent({ gradeCode: 'SSS3', gpa: 1.0, totalCredits: 200 });
      const lowCredits = await makeStudent({ gradeCode: 'SSS3', gpa: 3.0, totalCredits: 120 });
      const probation = await makeStudent({ gradeCode: 'SSS3', gpa: 3.0, totalCredits: 180, academicStanding: { probation: true, disciplinaryStatus: 'clear' } });
      const discipline = await makeStudent({ gradeCode: 'SSS3', gpa: 3.0, totalCredits: 180, academicStanding: { probation: false, disciplinaryStatus: 'suspended' } });
      const owing = await makeStudent({ gradeCode: 'SSS3', gpa: 3.0, totalCredits: 180, financialInfo: { feeCategory: 'standard', outstandingBalance: 100 } });

      await expect(service.graduateStudent(lowGpa.id)).rejects.toThrow('Student must have minimum GPA of 2');
      await expect(service.graduateStudent(lowCredits.id)).rejects.toThrow('Student must have minimum 150 credits');
      await expect(service.graduateStudent(probation.id)).rejects.toThrow('Student on academic probation cannot graduate');
      await expect(service.graduateStudent(discipline.id)).rejects.toThrow('Student must have clear disciplinary record');
      await expect(service.graduateStudent(owing.id)).rejects.toThrow('Student must clear all outstanding financial obligations');
    });
  });
});
