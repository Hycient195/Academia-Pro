import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from '../students.service';
import { Student, StudentStatus, EnrollmentType, BloodGroup } from '../student.entity';
import { StudentAuditService } from '../services/student-audit.service';
import { QueueService } from '../../queue/queue.service';
import { TStudentStage, TGradeCode } from '@academia-pro/types/student';

describe('StudentsService - Unit Tests', () => {
  let service: StudentsService;
  let studentRepository: jest.Mocked<Repository<Student>>;
  let studentAuditService: jest.Mocked<StudentAuditService>;
  let queueService: jest.Mocked<QueueService>;

  const mockStudent = {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Michael',
    dateOfBirth: new Date('2005-01-01'),
    gender: 'male' as const,
    bloodGroup: 'O+' as BloodGroup,
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      postalCode: '62701',
    },
    admissionNumber: 'ADM20240001',
    schoolId: 'school-1',
    stage: 'SSS' as const,
    gradeCode: 'SSS1',
    streamSection: 'A',
    admissionDate: new Date('2024-08-01'),
    enrollmentType: EnrollmentType.REGULAR,
    status: StudentStatus.ACTIVE,
    isBoarding: false,
    gpa: 3.5,
    totalCredits: 120,
    academicStanding: {
      probation: false,
      disciplinaryStatus: 'clear',
    },
    parentInfo: {
      fatherFirstName: 'John',
      fatherLastName: 'Doe Sr.',
      fatherPhone: '+1234567891',
      fatherEmail: 'father@example.com',
      motherFirstName: 'Jane',
      motherLastName: 'Doe',
      motherPhone: '+1234567892',
      motherEmail: 'mother@example.com',
    },
    medicalInfo: {
      bloodGroup: 'O+',
      allergies: ['peanuts'],
      medications: ['none'],
      conditions: ['none'],
      emergencyContact: {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1234567892',
        relation: 'mother',
      },
    },
    promotionHistory: [],
    transferHistory: [],
    documents: [],
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        sms: true,
        push: true,
        parentCommunication: true,
      },
      extracurricular: [],
    },
    financialInfo: {
      feeCategory: 'standard',
      outstandingBalance: 0,
    },
    transportation: {},
    hostel: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockStudentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIds: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue([]),
        getOne: jest.fn().mockReturnValue(null),
        getCount: jest.fn().mockReturnValue(0),
        getRawMany: jest.fn().mockReturnValue([]),
        getRawOne: jest.fn().mockReturnValue(null),
      })),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const mockStudentAuditService = {
      logStudentCreated: jest.fn(),
      logStudentUpdated: jest.fn(),
      logStudentDeleted: jest.fn(),
      logStudentTransfer: jest.fn(),
      logStudentGraduated: jest.fn(),
      logMedicalInfoAccess: jest.fn(),
      logDocumentActivity: jest.fn(),
    };

    const mockQueueService = {
      addJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        },
        {
          provide: StudentAuditService,
          useValue: mockStudentAuditService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepository = module.get(getRepositoryToken(Student));
    studentAuditService = module.get(StudentAuditService);
    queueService = module.get(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new student successfully', async () => {
      const createStudentDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2005-01-01',
        gender: 'male' as const,
        stage: 'SSS' as TStudentStage,
        gradeCode: 'SSS1' as TGradeCode,
        streamSection: 'A',
        admissionDate: '2024-08-01',
        schoolId: 'school-1',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          country: 'USA',
          postalCode: '62701',
        },
        parentInfo: {
          fatherFirstName: 'John',
          fatherLastName: 'Doe Sr.',
          fatherPhone: '+1234567891',
          motherFirstName: 'Jane',
          motherLastName: 'Doe',
          motherPhone: '+1234567892',
        },
        medicalInfo: {
          bloodGroup: 'O+',
          allergies: ['peanuts'],
          emergencyContact: {
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+1234567892',
            relation: 'mother',
          },
        },
      };

      studentRepository.save.mockResolvedValue(mockStudent as any);
      studentRepository.findOne.mockResolvedValue(null); // No existing student

      const result = await service.create(createStudentDto);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(studentRepository.save).toHaveBeenCalled();
      expect(studentAuditService.logStudentCreated).toHaveBeenCalled();
    });

    it('should throw ConflictException if admission number already exists', async () => {
      const createStudentDto = {
        admissionNumber: 'ADM20240001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2005-01-01',
        gender: 'male' as const,
        stage: 'SSS' as TStudentStage,
        gradeCode: 'SSS1' as TGradeCode,
        streamSection: 'A',
        admissionDate: '2024-08-01',
        schoolId: 'school-1',
      };

      studentRepository.findOne.mockResolvedValue(mockStudent as any);

      await expect(service.create(createStudentDto)).rejects.toThrow(
        'Student with this admission number already exists'
      );
    });

    it('should generate admission number if not provided', async () => {
      const createStudentDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2005-01-01',
        gender: 'male' as const,
        stage: 'SSS' as TStudentStage,
        gradeCode: 'SSS1' as TGradeCode,
        streamSection: 'A',
        admissionDate: '2024-08-01',
        schoolId: 'school-1',
      };

      studentRepository.save.mockResolvedValue(mockStudent as any);
      studentRepository.findOne.mockResolvedValue(null);

      // Mock the query builder for admission number generation
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      studentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.create(createStudentDto);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('student.admissionNumber', 'DESC');
    });
  });

  describe('findAll', () => {
    it('should return paginated students list', async () => {
      const mockStudents = [mockStudent];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockStudents),
        getCount: jest.fn().mockResolvedValue(1),
        getRawMany: jest.fn().mockReturnValue([]),
      };

      studentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply search filter correctly', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
        getRawMany: jest.fn().mockReturnValue([]),
      };

      studentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ search: 'John' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.admissionNumber ILIKE :search)',
        { search: '%John%' }
      );
    });

    it('should apply stage filter correctly', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
        getRawMany: jest.fn().mockReturnValue([]),
      };

      studentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ stages: ['SSS', 'JSS'] });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('student.stage IN (:...stages)', { stages: ['SSS', 'JSS'] });
    });
  });

  describe('findOne', () => {
    it('should return a student by ID', async () => {
      studentRepository.findOne.mockResolvedValue({ ...mockStudent, gradeCode: 'SSS3' } as any);

      const result = await service.findOne('student-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('student-1');
      expect(result.firstName).toBe('John');
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow('Student not found');
    });
  });

  describe('update', () => {
    it('should update student successfully', async () => {
      const updateDto = {
        firstName: 'Jane',
        email: 'jane.doe@example.com',
      };

      studentRepository.findOne
        .mockResolvedValueOnce(mockStudent as any) // First call for finding the student
        .mockResolvedValueOnce(null); // Second call for email check - no existing email
      studentRepository.save.mockResolvedValue({ ...mockStudent, ...updateDto } as any);

      const result = await service.update('student-1', updateDto);

      expect(result.firstName).toBe('Jane');
      expect(result.email).toBe('jane.doe@example.com');
      expect(studentRepository.save).toHaveBeenCalled();
      expect(studentAuditService.logStudentUpdated).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists in school', async () => {
      const updateDto = {
        email: 'existing@example.com',
      };

      studentRepository.findOne
        .mockResolvedValueOnce(mockStudent as any) // First call for finding the student
        .mockResolvedValueOnce({ id: 'other-student' } as any); // Second call for email check

      await expect(service.update('student-1', updateDto)).rejects.toThrow(
        'Student with this email already exists in this school'
      );
    });
  });

  describe('bulkImport', () => {
    it('should process bulk import and return results', async () => {
      const bulkImportDto = {
        schoolId: 'school-1',
        data: [
          {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '2005-01-01',
            gender: 'male',
            gradeCode: 'SSS1',
            streamSection: 'A',
            fatherName: 'John Doe Sr.',
            motherName: 'Jane Doe',
          },
        ],
        userId: 'user-1',
      };

      studentRepository.save.mockResolvedValue(mockStudent as any);

      const result = await service.bulkImport(bulkImportDto);

      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.importedIds).toHaveLength(1);
    });
  });

  describe('executePromotion', () => {
    it('should process promotion and return results', async () => {
      const promotionDto = {
        studentIds: ['student-1'],
        targetGradeCode: 'SSS1',
        schoolId: 'school-1',
        userId: 'user-1',
      };

      studentRepository.findOne.mockResolvedValue(mockStudent as any);
      studentRepository.save.mockResolvedValue({ ...mockStudent, gradeCode: 'SSS1' } as any);

      const result = await service.executePromotion(promotionDto);

      expect(result.promotedStudents).toBe(1);
      expect(result.studentIds).toEqual(['student-1']);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('batchGraduate', () => {
    it('should process graduation and return results', async () => {
      const graduationDto = {
        schoolId: 'school-1',
        studentIds: ['student-5'],
        graduationYear: 2024,
        clearanceStatus: 'cleared' as 'cleared',
        userId: 'user-1',
      };

      const eligibleStudent = { ...mockStudent, id: 'student-5', gradeCode: 'SSS3', totalCredits: 160 };
      studentRepository.findOne.mockResolvedValue(eligibleStudent as any);
      studentRepository.save.mockResolvedValue({ ...mockStudent, status: StudentStatus.GRADUATED } as any);

      const result = await service.batchGraduate(graduationDto);

      expect(result.graduatedStudents).toBe(1);
      expect(result.studentIds).toEqual(['student-5']);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('batchTransfer', () => {
    it('should process transfer and return results', async () => {
      const transferDto = {
        studentIds: ['student-1'],
        targetSchoolId: 'school-2',
        transferReason: 'Transfer to another school',
        schoolId: 'school-1',
        userId: 'user-1',
      };

      studentRepository.findOne.mockResolvedValue(mockStudent as any);
      studentRepository.save.mockResolvedValue({ ...mockStudent, status: StudentStatus.TRANSFERRED } as any);

      const result = await service.batchTransfer(transferDto);

      expect(result.transferred).toBe(1);
      expect(result.studentIds).toEqual(['student-1']);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should soft delete student by setting status to inactive', async () => {
      studentRepository.findOne.mockResolvedValue(mockStudent as any);
      studentRepository.save.mockResolvedValue({ ...mockStudent, status: StudentStatus.INACTIVE } as any);

      await service.remove('student-1');

      expect(studentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StudentStatus.INACTIVE })
      );
    });
  });

  describe('getStatistics', () => {
    it('should return comprehensive statistics', async () => {
      const mockGradeCounts = [
        { grade: 'SSS1', count: '10' },
        { grade: 'SSS2', count: '8' },
        { grade: 'SSS3', count: '5' },
      ];

      const mockStatusCounts = [
        { status: 'active', count: '20' },
        { status: 'graduated', count: '3' },
      ];

      const mockEnrollmentCounts = [
        { enrollmentType: 'regular', count: '18' },
        { enrollmentType: 'special_needs', count: '2' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockGradeCounts)
          .mockResolvedValueOnce(mockStatusCounts)
          .mockResolvedValueOnce(mockEnrollmentCounts),
      };

      studentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      studentRepository.count.mockResolvedValue(23);

      const result = await service.getStatistics('school-1');

      expect(result.totalStudents).toBe(23);
      expect(result.activeStudents).toBe(23); // All students are active in our mock
      expect(result.studentsByGrade).toEqual({
        SSS1: 10,
        SSS2: 8,
        SSS3: 5,
      });
      expect(result.studentsByStatus.active).toBe(20);
      expect(result.studentsByStatus.graduated).toBe(3);
      expect(result.studentsByEnrollmentType.regular).toBe(18);
      expect(result.studentsByEnrollmentType.special_needs).toBe(2);
    });
  });

  describe('validateGraduationEligibility', () => {
    it('should return eligible for qualified student', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS3',
        status: StudentStatus.ACTIVE,
        gpa: 3.0,
        totalCredits: 160,
        academicStanding: {
          probation: false,
          disciplinaryStatus: 'clear',
        },
        financialInfo: {
          outstandingBalance: 0,
        },
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return ineligible for wrong grade', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS2',
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('final grade (SSS3)');
    });

    it('should return ineligible for low GPA', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS3' as TGradeCode,
        status: StudentStatus.ACTIVE,
        gpa: 1.5,
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('minimum GPA');
    });

    it('should return ineligible for insufficient credits', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS3' as TGradeCode,
        status: StudentStatus.ACTIVE,
        totalCredits: 100,
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('minimum 150 credits');
    });

    it('should return ineligible for academic probation', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS3' as TGradeCode,
        status: StudentStatus.ACTIVE,
        totalCredits: 160, // Sufficient credits
        academicStanding: {
          probation: true,
          disciplinaryStatus: 'clear',
        },
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('academic probation');
    });

    it('should return ineligible for outstanding balance', () => {
      const student = {
        ...mockStudent,
        gradeCode: 'SSS3' as TGradeCode,
        status: StudentStatus.ACTIVE,
        totalCredits: 160, // Sufficient credits
        financialInfo: {
          outstandingBalance: 500,
        },
      };

      const result = (service as any).validateGraduationEligibility(student);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('outstanding financial obligations');
    });
  });
});