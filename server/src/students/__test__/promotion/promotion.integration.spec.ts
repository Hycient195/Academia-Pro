// Academia Pro - Student Promotion True Integration Tests
// Tests using real Postgres database with Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StudentsService } from '../../students.service';
import { Student, StudentStatus, EnrollmentType } from '../../student.entity';
import { StudentAuditService } from '../../services/student-audit.service';
import { StudentAuditLog } from '../../entities/student-audit-log.entity';
import { AuditConfigService } from '../../../common/audit/audit.config';
import { School, SchoolStatus, SubscriptionPlan } from '../../../schools/school.entity';
import { TStudentStage } from '@academia-pro/types/student/student.types';
import { TSchoolType } from '@academia-pro/types/schools';

describe('StudentsService - Promotion True Integration Tests', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;
  let schoolRepository: Repository<School>;
  let auditLogRepository: Repository<StudentAuditLog>;
  let moduleFixture: TestingModule;
  let postgresContainer: StartedPostgreSqlContainer;
  let testDataSource: DataSource;
  let testSchoolId: string;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('test_academia_pro')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

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

    const school = await schoolRepository.save({
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
    testSchoolId = school.id;
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
    const grade = (overrides.gradeCode as string) || 'JSS3';
    const stage = (overrides.stage as TStudentStage) || stageFromGrade(grade);

    const student = await studentRepository.save({
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'Student',
      dateOfBirth: overrides.dateOfBirth || new Date('2008-01-01'),
      gender: overrides.gender || 'male',
      admissionNumber: overrides.admissionNumber || `ADM-${baseNumber}`,
      schoolId: overrides.schoolId || testSchoolId,
      stage,
      gradeCode: grade,
      streamSection: overrides.streamSection || 'A',
      admissionDate: overrides.admissionDate || new Date('2020-09-01'),
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
      gpa: overrides.gpa ?? 3.0,
      totalCredits: overrides.totalCredits ?? 100,
      academicStanding: overrides.academicStanding || { probation: false, disciplinaryStatus: 'clear' },
    } as any);

    return student;
  }

  describe('Service Instantiation', () => {
    it('should be defined and expose executePromotion', () => {
      expect(service).toBeDefined();
      expect(typeof service.executePromotion).toBe('function');
    });
  });

  describe('executePromotion - scope: grade', () => {
    it('promotes only ACTIVE students in the grade, excluding repeaters when includeRepeaters=false', async () => {
      const s1 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A', academicStanding: { probation: false } });
      const s2 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A', academicStanding: { probation: true } });
      const s3 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'B', academicStanding: { probation: false } });
      const inactive = await makeStudent({ gradeCode: 'JSS3', status: StudentStatus.INACTIVE, academicStanding: { probation: false }, admissionNumber: 'ADM-INACTIVE' });

      const dto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: false,
        reason: 'End of year promotion',
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(2);
      expect(result.studentIds).toEqual(expect.arrayContaining([s1.id, s3.id]));
      expect(result.studentIds).not.toContain(s2.id);
      expect(result.studentIds).not.toContain(inactive.id);

      const dbS1 = await studentRepository.findOne({ where: { id: s1.id } });
      const dbS2 = await studentRepository.findOne({ where: { id: s2.id } });
      const dbS3 = await studentRepository.findOne({ where: { id: s3.id } });
      const dbInactive = await studentRepository.findOne({ where: { id: inactive.id } });

      expect(dbS1?.gradeCode).toBe('SSS1');
      expect(dbS1?.stage).toBe('SSS');
      expect(dbS2?.gradeCode).toBe('JSS3');
      expect(dbS2?.stage).toBe('JSS');
      expect(dbS3?.gradeCode).toBe('SSS1');
      expect(dbS3?.stage).toBe('SSS');
      expect(dbInactive?.gradeCode).toBe('JSS3');
      expect(dbInactive?.stage).toBe('JSS');
    });

    it('includes repeaters when includeRepeaters=true', async () => {
      const r1 = await makeStudent({ gradeCode: 'JSS3', academicStanding: { probation: true } });
      const r2 = await makeStudent({ gradeCode: 'JSS3', academicStanding: { probation: false } });

      const dto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(2);

      const promoted = await studentRepository.find({ where: { gradeCode: 'SSS1' } });
      expect(promoted.map(s => s.id)).toEqual(expect.arrayContaining([r1.id, r2.id]));
    });

    it('updates streamSection for promoted students when streamSection provided', async () => {
      const s1 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A' });
      const s2 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'B' });

      const dto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
        streamSection: 'C',
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(2);

      const dbS1 = await studentRepository.findOne({ where: { id: s1.id } });
      const dbS2 = await studentRepository.findOne({ where: { id: s2.id } });
      expect(dbS1?.streamSection).toBe('C');
      expect(dbS2?.streamSection).toBe('C');
    });

    it('returns 0 when no students match the grade', async () => {
      const dto = {
        scope: 'grade' as const,
        gradeCode: 'NONEXISTENT',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(dto);
      expect(result.promotedStudents).toBe(0);
      expect(result.studentIds).toHaveLength(0);
    });
  });

  describe('executePromotion - scope: section', () => {
    it('promotes only students in specified section within grade', async () => {
      const a1 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A' });
      const a2 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A' });
      const b1 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'B' });

      const dto = {
        scope: 'section' as const,
        gradeCode: 'JSS3',
        streamSection: 'A',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(2);
      expect(result.studentIds).toEqual(expect.arrayContaining([a1.id, a2.id]));
      expect(result.studentIds).not.toContain(b1.id);

      const dbA1 = await studentRepository.findOne({ where: { id: a1.id } });
      const dbB1 = await studentRepository.findOne({ where: { id: b1.id } });

      expect(dbA1?.gradeCode).toBe('SSS1');
      expect(dbA1?.stage).toBe('SSS');
      expect(dbB1?.gradeCode).toBe('JSS3');
      expect(dbB1?.stage).toBe('JSS');
    });
  });

  describe('executePromotion - scope: students', () => {
    it('promotes only specified students and respects includeRepeaters=false', async () => {
      const s1 = await makeStudent({ gradeCode: 'JSS3', academicStanding: { probation: false } });
      const s2 = await makeStudent({ gradeCode: 'JSS3', academicStanding: { probation: true } });
      const s3 = await makeStudent({ gradeCode: 'JSS3', academicStanding: { probation: false } });

      const dto = {
        scope: 'students' as const,
        studentIds: [s1.id, s2.id],
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(1);
      expect(result.studentIds).toEqual(expect.arrayContaining([s1.id]));
      expect(result.studentIds).not.toContain(s2.id);
      expect(result.studentIds).not.toContain(s3.id);

      const dbS1 = await studentRepository.findOne({ where: { id: s1.id } });
      const dbS2 = await studentRepository.findOne({ where: { id: s2.id } });
      const dbS3 = await studentRepository.findOne({ where: { id: s3.id } });

      expect(dbS1?.gradeCode).toBe('SSS1');
      expect(dbS2?.gradeCode).toBe('JSS3');
      expect(dbS3?.gradeCode).toBe('JSS3');
    });

    it('preserves streamSection when not provided', async () => {
      const s1 = await makeStudent({ gradeCode: 'JSS3', streamSection: 'A' });

      const dto = {
        scope: 'students' as const,
        studentIds: [s1.id],
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
      };

      await service.executePromotion(dto);

      const dbS1 = await studentRepository.findOne({ where: { id: s1.id } });
      expect(dbS1?.streamSection).toBe('A');
    });
  });

  describe('executePromotion - scope: all', () => {
    it('promotes all ACTIVE students and ignores INACTIVE', async () => {
      const act1 = await makeStudent({ gradeCode: 'JSS2' });
      const act2 = await makeStudent({ gradeCode: 'PRY4' });
      const ina = await makeStudent({ gradeCode: 'JSS1', status: StudentStatus.INACTIVE, admissionNumber: 'ADM-INACT-2' });

      const dto = {
        scope: 'all' as const,
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
      };

      const result = await service.executePromotion(dto);

      expect(result.promotedStudents).toBe(2);
      expect(result.studentIds).toEqual(expect.arrayContaining([act1.id, act2.id]));
      expect(result.studentIds).not.toContain(ina.id);

      const dbAct1 = await studentRepository.findOne({ where: { id: act1.id } });
      const dbAct2 = await studentRepository.findOne({ where: { id: act2.id } });
      const dbIna = await studentRepository.findOne({ where: { id: ina.id } });

      expect(dbAct1?.gradeCode).toBe('SSS1');
      expect(dbAct1?.stage).toBe('SSS');
      expect(dbAct2?.gradeCode).toBe('SSS1');
      expect(dbAct2?.stage).toBe('SSS');
      expect(dbIna?.gradeCode).toBe('JSS1');
      expect(dbIna?.stage).toBe('JSS');
    });
  });

  describe('executePromotion - stage behavior', () => {
    it('keeps stage unchanged for intra-stage promotions (JSS1 -> JSS2)', async () => {
      const s = await makeStudent({ gradeCode: 'JSS1', stage: 'JSS' as TStudentStage });

      const dto = {
        scope: 'students' as const,
        studentIds: [s.id],
        targetGradeCode: 'JSS2',
        academicYear: '2025',
        includeRepeaters: true,
      };

      await service.executePromotion(dto);

      const dbS = await studentRepository.findOne({ where: { id: s.id } });
      expect(dbS?.gradeCode).toBe('JSS2');
      expect(dbS?.stage).toBe('JSS');
    });
  });

  describe('executePromotion - invalid scope', () => {
    it('returns zero changes for unsupported scope (service-level behavior)', async () => {
      const s = await makeStudent({ gradeCode: 'JSS3' });

      const dto: any = {
        scope: 'unsupported',
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        includeRepeaters: true,
      };

      const result = await service.executePromotion(dto);
      expect(result.promotedStudents).toBe(0);

      const dbS = await studentRepository.findOne({ where: { id: s.id } });
      expect(dbS?.gradeCode).toBe('JSS3');
      expect(dbS?.stage).toBe('JSS');
    });
  });
});