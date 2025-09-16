// Academia Pro - Student Promotion Integration Tests
// Integration tests for student promotion service methods

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from '../../students.service';
import { Student, StudentStatus, EnrollmentType } from '../../student.entity';
import { StudentAuditService } from '../../services/student-audit.service';
import { DatabaseTestModule } from '../../../test/database-test.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TStudentStage } from '@academia-pro/types/student/student.types';

describe('StudentsService - Promotion Integration', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;
  let container: StartedPostgreSqlContainer;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // Start PostgreSQL container for testing
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    moduleFixture = await Test.createTestingModule({
      imports: [await DatabaseTestModule.forRoot()],
      providers: [
        StudentsService,
        StudentAuditService,
        {
          provide: getRepositoryToken(Student),
          useClass: Repository,
        },
      ],
    }).compile();

    service = moduleFixture.get<StudentsService>(StudentsService);
    studentRepository = moduleFixture.get<Repository<Student>>(getRepositoryToken(Student));
  }, 60000);

  afterAll(async () => {
    await moduleFixture.close();
    if (container) {
      await container.stop();
    }
  });

  beforeEach(async () => {
    // Clear all students before each test
    await studentRepository.clear();
  });

  describe('executePromotion', () => {
    it('should promote students by grade scope successfully', async () => {
      // Create test students in JSS3
      const student1 = await studentRepository.save({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2008-01-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3001',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const student2 = await studentRepository.save({
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('2008-02-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3002',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const promotionDto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'End of year promotion',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(2);
      expect(result.studentIds).toHaveLength(2);
      expect(result.studentIds).toContain(student1.id);
      expect(result.studentIds).toContain(student2.id);

      // Verify students were updated in database
      const updatedStudents = await studentRepository.findByIds(result.studentIds);
      updatedStudents.forEach(student => {
        expect(student.gradeCode).toBe('SSS1');
        expect(student.stage).toBe('SSS');
        expect(student.promotionHistory).toHaveLength(1);
        expect(student.promotionHistory[0].fromGrade).toBe('JSS3');
        expect(student.promotionHistory[0].toGrade).toBe('SSS1');
        expect(student.promotionHistory[0].academicYear).toBe('2025');
        expect(student.promotionHistory[0].reason).toBe('End of year promotion');
      });
    });

    it('should promote students by section scope successfully', async () => {
      // Create students in JSS3 section A and B
      await studentRepository.save({
        firstName: 'Alice',
        lastName: 'Brown',
        dateOfBirth: new Date('2008-03-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3003',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      await studentRepository.save({
        firstName: 'Bob',
        lastName: 'Wilson',
        dateOfBirth: new Date('2008-04-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3004',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'B',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const promotionDto = {
        scope: 'section' as const,
        gradeCode: 'JSS3',
        streamSection: 'A',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Section A promotion',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(1);

      // Verify only section A student was promoted
      const promotedStudent = await studentRepository.findOne({
        where: { admissionNumber: 'JSS3003' }
      });
      expect(promotedStudent?.gradeCode).toBe('SSS1');
      expect(promotedStudent?.stage).toBe('SSS');

      // Verify section B student was not promoted
      const notPromotedStudent = await studentRepository.findOne({
        where: { admissionNumber: 'JSS3004' }
      });
      expect(notPromotedStudent?.gradeCode).toBe('JSS3');
      expect(notPromotedStudent?.stage).toBe('JSS');
    });

    it('should promote specific students successfully', async () => {
      const student1 = await studentRepository.save({
        firstName: 'Charlie',
        lastName: 'Davis',
        dateOfBirth: new Date('2008-05-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3005',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const student2 = await studentRepository.save({
        firstName: 'Diana',
        lastName: 'Evans',
        dateOfBirth: new Date('2008-06-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3006',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const promotionDto = {
        scope: 'students' as const,
        studentIds: [student1.id],
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Selective promotion',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(1);
      expect(result.studentIds).toContain(student1.id);

      // Verify only selected student was promoted
      const promotedStudent = await studentRepository.findOne({
        where: { id: student1.id }
      });
      expect(promotedStudent?.gradeCode).toBe('SSS1');

      // Verify other student was not promoted
      const notPromotedStudent = await studentRepository.findOne({
        where: { id: student2.id }
      });
      expect(notPromotedStudent?.gradeCode).toBe('JSS3');
    });

    it('should exclude repeaters when includeRepeaters is false', async () => {
      const student1 = await studentRepository.save({
        firstName: 'Eve',
        lastName: 'Foster',
        dateOfBirth: new Date('2008-07-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3007',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
        academicStanding: { probation: true },
      });

      const student2 = await studentRepository.save({
        firstName: 'Frank',
        lastName: 'Garcia',
        dateOfBirth: new Date('2008-08-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3008',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
        academicStanding: { probation: false },
      });

      const promotionDto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Promotion excluding repeaters',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(1);

      // Verify only non-repeater was promoted
      const promotedStudent = await studentRepository.findOne({
        where: { admissionNumber: 'JSS3008' }
      });
      expect(promotedStudent?.gradeCode).toBe('SSS1');

      // Verify repeater was not promoted
      const notPromotedStudent = await studentRepository.findOne({
        where: { admissionNumber: 'JSS3007' }
      });
      expect(notPromotedStudent?.gradeCode).toBe('JSS3');
    });

    it('should include repeaters when includeRepeaters is true', async () => {
      const student1 = await studentRepository.save({
        firstName: 'Grace',
        lastName: 'Harris',
        dateOfBirth: new Date('2008-09-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3009',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
        academicStanding: { probation: true },
      });

      const student2 = await studentRepository.save({
        firstName: 'Henry',
        lastName: 'Irwin',
        dateOfBirth: new Date('2008-10-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3010',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
        academicStanding: { probation: false },
      });

      const promotionDto = {
        scope: 'grade' as const,
        gradeCode: 'JSS3',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Promotion including repeaters',
        includeRepeaters: true,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(2);

      // Verify both students were promoted
      const promotedStudents = await studentRepository.find({
        where: { gradeCode: 'SSS1' }
      });
      expect(promotedStudents).toHaveLength(2);
    });

    it('should handle empty result set', async () => {
      const promotionDto = {
        scope: 'grade' as const,
        gradeCode: 'NONEXISTENT',
        targetGradeCode: 'SSS1',
        academicYear: '2025',
        reason: 'Test empty promotion',
        includeRepeaters: false,
      };

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(0);
      expect(result.studentIds).toHaveLength(0);
    });
  });

  describe('assignClass', () => {
    it('should assign class and create promotion history for grade increase', async () => {
      const student = await studentRepository.save({
        firstName: 'Ivy',
        lastName: 'Johnson',
        dateOfBirth: new Date('2008-11-01'),
        gender: 'female' as const,
        admissionNumber: 'JSS3011',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS2',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const assignClassDto = {
        gradeCode: 'JSS3',
        streamSection: 'B',
        effectiveDate: new Date(),
        reason: 'Class assignment promotion',
      };

      const result = await service.assignClass(student.id, assignClassDto);

      expect(result.gradeCode).toBe('JSS3');
      expect(result.streamSection).toBe('B');

      // Verify promotion history was created
      const updatedStudent = await studentRepository.findOne({
        where: { id: student.id }
      });
      expect(updatedStudent?.promotionHistory).toHaveLength(1);
      expect(updatedStudent?.promotionHistory[0].fromGrade).toBe('JSS2');
      expect(updatedStudent?.promotionHistory[0].toGrade).toBe('JSS3');
      expect(updatedStudent?.promotionHistory[0].reason).toBe('Class assignment promotion');
    });

    it('should assign class without promotion history for same grade', async () => {
      const student = await studentRepository.save({
        firstName: 'Jack',
        lastName: 'King',
        dateOfBirth: new Date('2008-12-01'),
        gender: 'male' as const,
        admissionNumber: 'JSS3012',
        schoolId: 'test-school',
        stage: TStudentStage.JSS,
        gradeCode: 'JSS3',
        streamSection: 'A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        status: StudentStatus.ACTIVE,
      });

      const assignClassDto = {
        gradeCode: 'JSS3',
        streamSection: 'B',
        effectiveDate: new Date(),
        reason: 'Section change only',
      };

      const result = await service.assignClass(student.id, assignClassDto);

      expect(result.gradeCode).toBe('JSS3');
      expect(result.streamSection).toBe('B');

      // Verify no promotion history was created
      const updatedStudent = await studentRepository.findOne({
        where: { id: student.id }
      });
      expect(updatedStudent?.promotionHistory).toHaveLength(0);
    });

    it('should throw error for non-existent student', async () => {
      const assignClassDto = {
        gradeCode: 'JSS3',
        streamSection: 'A',
        effectiveDate: new Date(),
        reason: 'Test error',
      };

      await expect(service.assignClass('non-existent-id', assignClassDto))
        .rejects
        .toThrow('Student not found');
    });
  });
});