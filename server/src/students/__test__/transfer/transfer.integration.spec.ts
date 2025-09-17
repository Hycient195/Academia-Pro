// Academia Pro - Student Transfer True Integration Tests
// Tests using real Postgres database with Testcontainers

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StudentTransferService } from '../../services/transfer.service';
import { Student, StudentStatus, EnrollmentType } from '../../student.entity';
import { StudentTransfer, TransferType, TransferStatus, TransferReason } from '../../entities/student-transfer.entity';
import { StudentDocument, DocumentStatus } from '../../entities/student-document.entity';
import { StudentAuditLog, AuditAction, AuditEntityType } from '../../entities/student-audit-log.entity';
import { School, SchoolStatus, SubscriptionPlan } from '../../../schools/school.entity';
import { TSchoolType } from '@academia-pro/types/schools';
import { TStudentStage } from '@academia-pro/types/student/student.types';
import { randomUUID } from 'crypto';

describe('StudentTransferService - True Integration Tests', () => {
  let service: StudentTransferService;
  let studentRepository: Repository<Student>;
  let transferRepository: Repository<StudentTransfer>;
  let documentRepository: Repository<StudentDocument>;
  let auditLogRepository: Repository<StudentAuditLog>;
  let schoolRepository: Repository<School>;
  let moduleFixture: TestingModule;
  let postgresContainer: StartedPostgreSqlContainer;
  let testDataSource: DataSource;
  let testSchoolId: string;
  let targetSchoolId: string;

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

    moduleFixture = await Test.createTestingModule({
      providers: [
        StudentTransferService,
        { provide: DataSource, useValue: testDataSource },
        {
          provide: getRepositoryToken(Student),
          useFactory: () => testDataSource.getRepository(Student),
        },
        {
          provide: getRepositoryToken(StudentTransfer),
          useFactory: () => testDataSource.getRepository(StudentTransfer),
        },
        {
          provide: getRepositoryToken(StudentDocument),
          useFactory: () => testDataSource.getRepository(StudentDocument),
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

    service = moduleFixture.get<StudentTransferService>(StudentTransferService);
    studentRepository = moduleFixture.get<Repository<Student>>(getRepositoryToken(Student));
    transferRepository = moduleFixture.get<Repository<StudentTransfer>>(getRepositoryToken(StudentTransfer));
    documentRepository = moduleFixture.get<Repository<StudentDocument>>(getRepositoryToken(StudentDocument));
    auditLogRepository = moduleFixture.get<Repository<StudentAuditLog>>(getRepositoryToken(StudentAuditLog));
    schoolRepository = moduleFixture.get<Repository<School>>(getRepositoryToken(School));

    // Create current and target schools
    const currentSchool = await schoolRepository.save({
      code: 'SCH-CURR',
      name: 'Current School',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      maxStudents: 2000,
      currentStudents: 0,
      maxStaff: 200,
      currentStaff: 0,
      createdBy: 'system',
    });
    testSchoolId = currentSchool.id;

    const targetSchool = await schoolRepository.save({
      code: 'SCH-TGT',
      name: 'Target School',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      maxStudents: 2000,
      currentStudents: 0,
      maxStaff: 200,
      currentStaff: 0,
      createdBy: 'system',
    });
    targetSchoolId = targetSchool.id;
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

  function buildTransferRequest(studentId: string, overrides: Partial<any> = {}) {
    const now = new Date();
    const transferDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      studentId,
      transferType: overrides.transferType || TransferType.INTER_SCHOOL,
      transferReason: overrides.transferReason || TransferReason.FAMILY_RELOCATION,
      reasonDetails: overrides.reasonDetails || 'Family moving to new city',
      toSchoolId: overrides.toSchoolId ?? targetSchoolId,
      toSchoolName: overrides.toSchoolName || 'Target School',
      toGrade: overrides.toGrade || 'SSS1',
      toSection: overrides.toSection || 'B',
      applicationDate: overrides.applicationDate || now,
      transferDate: overrides.transferDate || transferDate,
      documents: overrides.documents || [], // Avoid creating documents due to entity constraints
      specialConsiderations: overrides.specialConsiderations,
      parentConsent: overrides.parentConsent ?? true,
    };
  }

  describe('Service Instantiation', () => {
    it('should be defined and expose core methods', () => {
      expect(service).toBeDefined();
      expect(typeof service.createTransferRequest).toBe('function');
      expect(typeof service.approveTransferRequest).toBe('function');
      expect(typeof service.rejectTransferRequest).toBe('function');
      expect(typeof service.completeTransfer).toBe('function');
      expect(typeof service.cancelTransferRequest).toBe('function');
    });
  });

  describe('createTransferRequest', () => {
    it('creates a transfer request and logs audit', async () => {
      const student = await makeStudent({ gradeCode: 'JSS3', currentGrade: 'JSS3', currentSection: 'A' });
      const dto = buildTransferRequest(student.id);

      const result = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      expect(result.success).toBe(true);
      expect(result.transfer).toBeDefined();
      expect(result.transfer.status).toBe(TransferStatus.INITIATED);

      const saved = await transferRepository.findOne({ where: { id: result.transfer.id } });
      expect(saved).toBeDefined();
      expect(saved?.fromSchoolId).toBe(testSchoolId);
      expect(saved?.toSchoolId).toBe(targetSchoolId);
      expect(saved?.fromGrade).toBe('JSS3');
      expect(saved?.toGrade).toBe('SSS1');

      const logs = await auditLogRepository.find({ where: { studentId: student.id, entityType: AuditEntityType.STUDENT_TRANSFER, action: AuditAction.CREATE } });
      expect(logs.length).toBe(1);
      expect(logs[0].changeDescription).toContain('Transfer request created');
    });

    it('throws NotFound when student not in provided school', async () => {
      const otherSchool = await schoolRepository.save({
        code: 'SCH-OTHER',
        name: 'Other School',
        type: [TSchoolType.SECONDARY],
        status: SchoolStatus.ACTIVE,
        subscriptionPlan: SubscriptionPlan.STANDARD,
        maxStudents: 1000,
        currentStudents: 0,
        maxStaff: 100,
        currentStaff: 0,
        createdBy: 'system',
      });
      const student = await makeStudent({ schoolId: otherSchool.id });
      const dto = buildTransferRequest(student.id);

      await expect(service.createTransferRequest(dto as any, testSchoolId, randomUUID()))
        .rejects
        .toThrow('Student not found');
    });

    it('prevents duplicate pending transfer', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      await expect(service.createTransferRequest(dto as any, testSchoolId, randomUUID()))
        .rejects
        .toThrow('Student already has a pending transfer request');
    });
  });

  describe('approve/reject/appeal flow', () => {
    it('approves a request and logs audit', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      const res = await service.approveTransferRequest(transfer.id, { notes: 'Approved' }, testSchoolId, randomUUID());
      expect(res.success).toBe(true);

      const saved = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(saved?.status).toBe(TransferStatus.APPROVED);
      expect(saved?.approvalNotes).toBe('Approved');
      expect(saved?.approvalDate).toBeTruthy();

      const logs = await auditLogRepository.find({ where: { studentId: student.id, action: AuditAction.APPROVE, entityType: AuditEntityType.STUDENT_TRANSFER } });
      expect(logs.length).toBe(1);
    });

    it('rejects a request and allows appeal, then review appeal to approve', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      const rej = await service.rejectTransferRequest(transfer.id, { reason: 'Incomplete info' }, testSchoolId, randomUUID());
      expect(rej.success).toBe(true);

      let saved = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(saved?.status).toBe(TransferStatus.REJECTED);
      expect(saved?.rejectionReason).toBe('Incomplete info');

      await expect(service.submitTransferAppeal(transfer.id, { details: 'Please reconsider' }, testSchoolId, randomUUID())).resolves.toBeDefined();

      saved = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(saved?.appealSubmitted).toBe(true);

      await service.reviewTransferAppeal(transfer.id, { decision: 'upheld', notes: 'Meets criteria now' }, testSchoolId, randomUUID());

      saved = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(saved?.status).toBe(TransferStatus.APPROVED);
      expect(saved?.appealDecision).toBe('upheld');

      const logs = await auditLogRepository.find({ where: { studentId: student.id, entityType: AuditEntityType.STUDENT_TRANSFER } });
      // Should have CREATE, REJECT, UPDATE(appeal submit), UPDATE(appeal review), APPROVE
      expect(logs.map(l => l.action)).toEqual(expect.arrayContaining([AuditAction.REJECT, AuditAction.UPDATE, AuditAction.APPROVE]));
    });

    it('disallows appeal when not rejected', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      await expect(service.submitTransferAppeal(transfer.id, { details: 'X' }, testSchoolId, randomUUID()))
        .rejects
        .toThrow('Only rejected transfers can be appealed');
    });
  });

  describe('completeTransfer', () => {
    it('completes an approved transfer and updates student school/grade/section', async () => {
      const student = await makeStudent({ gradeCode: 'JSS3', currentGrade: 'JSS3', currentSection: 'A' });
      const dto = buildTransferRequest(student.id, { toGrade: 'SSS1', toSection: 'C' });
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());
      await service.approveTransferRequest(transfer.id, { notes: 'Ok' }, testSchoolId, randomUUID());

      const res = await service.completeTransfer(transfer.id, { handoverNotes: 'All good' }, testSchoolId, randomUUID());
      expect(res.success).toBe(true);

      const savedTransfer = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(savedTransfer?.status).toBe(TransferStatus.COMPLETED);
      expect(savedTransfer?.completionDate).toBeTruthy();

      const dbStudent = await studentRepository.findOne({ where: { id: student.id } });
      expect(dbStudent?.schoolId).toBe(targetSchoolId);
      expect(dbStudent?.currentGrade).toBe('SSS1');
      expect(dbStudent?.currentSection).toBe('C');

      const logs = await auditLogRepository.find({ where: { studentId: student.id, action: AuditAction.UPDATE, entityType: AuditEntityType.STUDENT_TRANSFER } });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.changeDescription.includes('Transfer completed'))).toBe(true);
    });

    it('throws when completing a non-approved transfer', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      await expect(service.completeTransfer(transfer.id, {}, testSchoolId, randomUUID()))
        .rejects
        .toThrow('Only approved transfers can be completed');
    });
  });

  describe('cancelTransferRequest', () => {
    it('cancels an initiated transfer', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());

      const res = await service.cancelTransferRequest(transfer.id, { reason: 'No longer needed' }, testSchoolId, randomUUID());
      expect(res.success).toBe(true);

      const saved = await transferRepository.findOne({ where: { id: transfer.id } });
      expect(saved?.status).toBe(TransferStatus.CANCELLED);

      const logs = await auditLogRepository.find({ where: { studentId: student.id, action: AuditAction.UPDATE, entityType: AuditEntityType.STUDENT_TRANSFER } });
      expect(logs.some(l => l.changeDescription.includes('Transfer request cancelled'))).toBe(true);
    });

    it('disallows cancelling a completed transfer', async () => {
      const student = await makeStudent();
      const dto = buildTransferRequest(student.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());
      await service.approveTransferRequest(transfer.id, { notes: 'Ok' }, testSchoolId, randomUUID());
      await service.completeTransfer(transfer.id, {}, testSchoolId, randomUUID());

      await expect(service.cancelTransferRequest(transfer.id, { reason: 'Too late' }, testSchoolId, randomUUID()))
        .rejects
        .toThrow('Cannot cancel a completed transfer');
    });
  });

  describe('listing, history and statistics', () => {
    it('lists transfer requests with filters and pagination', async () => {
      // Create many transfers across distinct students
      const ids: string[] = [];
      for (let i = 0; i < 12; i++) {
        const s = await makeStudent();
        const dto = buildTransferRequest(s.id, { transferType: i % 3 === 0 ? TransferType.INTER_SCHOOL : TransferType.INTER_STATE });
        const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());
        if (i % 4 === 0) {
          await service.approveTransferRequest(transfer.id, { notes: 'Ok' }, testSchoolId, randomUUID());
        }
        ids.push(transfer.id);
      }

      const page1 = await service.getTransferRequests(testSchoolId, { page: 1, limit: 10, type: TransferType.INTER_SCHOOL });
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(10);
      expect(page1.total).toBeGreaterThan(0);
      expect(page1.transfers.every(t => t.transferType === TransferType.INTER_SCHOOL)).toBe(true);

      const page2 = await service.getTransferRequests(testSchoolId, { page: 2, limit: 10 });
      expect(page2.page).toBe(2);
      expect(page2.transfers.length).toBeLessThanOrEqual(10);
    });

    it('returns student transfer history', async () => {
      const student = await makeStudent();
      const dto1 = buildTransferRequest(student.id);
      const dto2 = buildTransferRequest(student.id, { transferReason: TransferReason.PERSONAL_REASONS, toGrade: 'JSS3', toSection: 'A' });
      const t1 = await service.createTransferRequest(dto1 as any, testSchoolId, randomUUID());
      await service.approveTransferRequest(t1.transfer.id, { notes: 'Ok' }, testSchoolId, randomUUID());
      const t2 = await service.createTransferRequest(dto2 as any, testSchoolId, randomUUID());

      const history = await service.getStudentTransferHistory(student.id, testSchoolId);
      expect(history.studentId).toBe(student.id);
      expect(history.totalTransfers).toBe(2);
      expect(history.transferHistory.map((t: any) => t.id)).toEqual(expect.arrayContaining([t1.transfer.id, t2.transfer.id]));
    });

    it('returns basic transfer statistics', async () => {
      // Ensure we have some data
      const s = await makeStudent();
      const dto = buildTransferRequest(s.id);
      const { transfer } = await service.createTransferRequest(dto as any, testSchoolId, randomUUID());
      await service.approveTransferRequest(transfer.id, { notes: 'Ok' }, testSchoolId, randomUUID());

      const stats = await service.getTransferStatistics(testSchoolId);
      expect(stats.totalTransfers).toBeGreaterThan(0);
      expect(stats.approvedTransfers).toBeGreaterThanOrEqual(0);
      expect(stats.rejectedTransfers).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.transferTypeStats)).toBe(true);
      expect(stats.academicYear).toBeDefined();
    });
  });
});