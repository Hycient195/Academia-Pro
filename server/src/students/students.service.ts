// Academia Pro - Students Service
// Business logic for student lifecycle management

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus, EnrollmentType, BloodGroup } from './student.entity';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentResponseDto,
  StudentsListResponseDto,
  StudentStatisticsResponseDto
} from './dtos/index';
import { StudentAuditService } from './services/student-audit.service';
import { AuditAction, AuditEntityType } from './entities/student-audit-log.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private readonly studentAuditService: StudentAuditService,
  ) {}

  /**
    * Create a new student
    */
  async create(createStudentDto: CreateStudentDto): Promise<StudentResponseDto> {
    const { admissionNumber, email, schoolId, ...studentData } = createStudentDto;

    // Check if student with same admission number already exists
    const existingStudent = await this.studentsRepository.findOne({
      where: { admissionNumber },
    });

    if (existingStudent) {
      throw new ConflictException('Student with this admission number already exists');
    }

    // Check if email is unique within the school
    if (email) {
      const existingEmail = await this.studentsRepository.findOne({
        where: { email, schoolId },
      });
      if (existingEmail) {
        throw new ConflictException('Student with this email already exists in this school');
      }
    }

    // Generate admission number if not provided
    const finalAdmissionNumber = admissionNumber || await this.generateAdmissionNumber(schoolId);

    // Create student
    const studentToSave = {
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      middleName: createStudentDto.middleName,
      dateOfBirth: new Date(createStudentDto.dateOfBirth),
      gender: createStudentDto.gender,
      ...(createStudentDto.bloodGroup && { bloodGroup: createStudentDto.bloodGroup as unknown as BloodGroup }),
      email: createStudentDto.email,
      phone: createStudentDto.phone,
      address: createStudentDto.address,
      admissionNumber: finalAdmissionNumber,
      currentGrade: createStudentDto.currentGrade,
      currentSection: createStudentDto.currentSection,
      admissionDate: new Date(createStudentDto.admissionDate),
      ...(createStudentDto.enrollmentType && { enrollmentType: createStudentDto.enrollmentType as unknown as EnrollmentType }),
      schoolId: createStudentDto.schoolId,
      userId: createStudentDto.userId,
      parents: createStudentDto.parents,
      medicalInfo: createStudentDto.medicalInfo,
      transportation: createStudentDto.transportation,
      hostel: createStudentDto.hostel,
      status: StudentStatus.ACTIVE,
    };

    const savedStudent = await this.studentsRepository.save(studentToSave as any);

    // Audit logging for student creation
    try {
      await this.studentAuditService.logStudentCreated(
        savedStudent.id,
        createStudentDto.userId || 'system',
        'System', // TODO: Get actual user name from context
        'admin', // TODO: Get actual user role from context
        {
          firstName: createStudentDto.firstName,
          lastName: createStudentDto.lastName,
          admissionNumber: finalAdmissionNumber,
          currentGrade: createStudentDto.currentGrade,
          currentSection: createStudentDto.currentSection,
          schoolId: createStudentDto.schoolId,
          enrollmentType: createStudentDto.enrollmentType,
        },
      );
    } catch (auditError) {
      // Log audit error but don't fail the operation
      console.error('Failed to log student creation audit:', auditError);
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
   * Get all students with pagination and filtering
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    schoolId?: string;
    grade?: string;
    section?: string;
    status?: StudentStatus;
    enrollmentType?: EnrollmentType;
    search?: string;
  }): Promise<StudentsListResponseDto> {
    const { page = 1, limit = 10, schoolId, grade, section, status, enrollmentType, search } = options || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    // Apply filters
    if (schoolId) {
      queryBuilder.andWhere('student.schoolId = :schoolId', { schoolId });
    }

    if (grade) {
      queryBuilder.andWhere('student.currentGrade = :grade', { grade });
    }

    if (section) {
      queryBuilder.andWhere('student.currentSection = :section', { section });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (enrollmentType) {
      queryBuilder.andWhere('student.enrollmentType = :enrollmentType', { enrollmentType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.admissionNumber ILIKE :search OR student.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('student.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [students, total] = await queryBuilder.getManyAndCount();

    const studentResponseDtos = students.map(student => StudentResponseDto.fromEntity(student));

    return new StudentsListResponseDto({
      students: studentResponseDtos,
      total,
      page,
      limit,
    });
  }

  /**
    * Get student by ID
    */
  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.studentsRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return StudentResponseDto.fromEntity(student);
  }

  /**
    * Get student by admission number
    */
  async findByAdmissionNumber(admissionNumber: string): Promise<StudentResponseDto> {
    const student = await this.studentsRepository.findOne({
      where: { admissionNumber },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return StudentResponseDto.fromEntity(student);
  }

  /**
    * Update student information
    */
  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    // Check for unique constraints if updating admission number or email
    if ((updateStudentDto as any).admissionNumber && (updateStudentDto as any).admissionNumber !== student.admissionNumber) {
      const existingStudent = await this.studentsRepository.findOne({
        where: { admissionNumber: (updateStudentDto as any).admissionNumber },
      });
      if (existingStudent) {
        throw new ConflictException('Student with this admission number already exists');
      }
    }

    if ((updateStudentDto as any).email && (updateStudentDto as any).email !== student.email) {
      const existingEmail = await this.studentsRepository.findOne({
        where: { email: (updateStudentDto as any).email, schoolId: student.schoolId },
      });
      if (existingEmail) {
        throw new ConflictException('Student with this email already exists in this school');
      }
    }

    // Capture old values for audit
    const oldValues = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      currentGrade: student.currentGrade,
      currentSection: student.currentSection,
      status: student.status,
    };

    // Update student
    Object.assign(student, updateStudentDto);

    const savedStudent = await this.studentsRepository.save(student);

    // Capture changed fields
    const changedFields = Object.keys(updateStudentDto).filter(key =>
      updateStudentDto[key] !== undefined && updateStudentDto[key] !== oldValues[key]
    );

    // Audit logging for student update
    if (changedFields.length > 0) {
      try {
        await this.studentAuditService.logStudentUpdated(
          id,
          updateStudentDto.userId || 'system',
          'System', // TODO: Get actual user name
          'admin', // TODO: Get actual user role
          oldValues,
          Object.keys(updateStudentDto).reduce((acc, key) => {
            if (updateStudentDto[key] !== undefined) {
              acc[key] = updateStudentDto[key];
            }
            return acc;
          }, {} as any),
          changedFields,
        );
      } catch (auditError) {
        console.error('Failed to log student update audit:', auditError);
      }
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Update student status
    */
  async updateStatus(id: string, status: StudentStatus, reason?: string): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    if (student.status === status) {
      throw new BadRequestException(`Student is already ${status}`);
    }

    student.status = status;

    // Log status change with reason if provided
    if (reason) {
      // TODO: Implement status change logging
      console.log(`Student ${student.admissionNumber} status changed to ${status}: ${reason}`);
    }

    const savedStudent = await this.studentsRepository.save(student);
    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Transfer student to different grade/section
    */
  async transferStudent(id: string, newGrade: string, newSection: string): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    if (student.currentGrade === newGrade && student.currentSection === newSection) {
      throw new BadRequestException('Student is already in the specified grade and section');
    }

    student.currentGrade = newGrade;
    student.currentSection = newSection;

    const savedStudent = await this.studentsRepository.save(student);

    // Audit logging for student transfer
    try {
      await this.studentAuditService.logStudentTransfer(
        id,
        'system', // TODO: Get actual user ID
        'System', // TODO: Get actual user name
        'admin', // TODO: Get actual user role
        student.currentGrade,
        student.currentSection,
        newGrade,
        newSection,
      );
    } catch (auditError) {
      console.error('Failed to log student transfer audit:', auditError);
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Graduate student
    */
  async graduateStudent(id: string, graduationDate?: Date): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    if (student.status === StudentStatus.GRADUATED) {
      throw new BadRequestException('Student is already graduated');
    }

    student.status = StudentStatus.GRADUATED;

    const savedStudent = await this.studentsRepository.save(student);

    // Audit logging for student graduation
    try {
      await this.studentAuditService.logStudentGraduated(
        id,
        'system', // TODO: Get actual user ID
        'System', // TODO: Get actual user name
        'admin', // TODO: Get actual user role
        graduationDate,
      );
    } catch (auditError) {
      console.error('Failed to log student graduation audit:', auditError);
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Update student medical information
    */
  async updateMedicalInfo(id: string, medicalInfo: any): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    student.updateMedicalInfo(medicalInfo);

    const savedStudent = await this.studentsRepository.save(student);

    // Audit logging for medical information update (sensitive data)
    try {
      await this.studentAuditService.logMedicalInfoAccess(
        id,
        'system', // TODO: Get actual user ID
        'System', // TODO: Get actual user name
        'admin', // TODO: Get actual user role
        'update',
        medicalInfo,
      );
    } catch (auditError) {
      console.error('Failed to log medical info update audit:', auditError);
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Update student financial information
    */
  async updateFinancialInfo(id: string, financialInfo: any): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    student.updateFinancialInfo(financialInfo);

    const savedStudent = await this.studentsRepository.save(student);
    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
    * Add document to student record
    */
  async addDocument(id: string, document: any): Promise<StudentResponseDto> {
    const student = await this.findStudentEntity(id);

    const documentData = {
      ...document,
      uploadedAt: new Date(),
      verified: false,
    };

    student.addDocument(documentData);

    const savedStudent = await this.studentsRepository.save(student);

    // Audit logging for document addition
    try {
      await this.studentAuditService.logDocumentActivity(
        id,
        'system', // TODO: Get actual user ID
        'System', // TODO: Get actual user name
        'admin', // TODO: Get actual user role
        'upload',
        documentData,
      );
    } catch (auditError) {
      console.error('Failed to log document addition audit:', auditError);
    }

    return StudentResponseDto.fromEntity(savedStudent);
  }

  /**
   * Get students by grade
   */
  async getStudentsByGrade(schoolId: string, grade: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { schoolId, currentGrade: grade, status: StudentStatus.ACTIVE },
      order: { firstName: 'ASC' },
    });
  }

  /**
   * Get students by section
   */
  async getStudentsBySection(schoolId: string, grade: string, section: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: {
        schoolId,
        currentGrade: grade,
        currentSection: section,
        status: StudentStatus.ACTIVE
      },
      order: { firstName: 'ASC' },
    });
  }

  /**
   * Search students
   */
  async search(query: string, schoolId?: string, options?: {
    grade?: string;
    section?: string;
    limit?: number;
  }): Promise<Student[]> {
    const { grade, section, limit = 20 } = options || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    // Search in multiple fields
    queryBuilder.where(
      '(student.firstName ILIKE :query OR student.lastName ILIKE :query OR student.admissionNumber ILIKE :query OR student.email ILIKE :query)',
      { query: `%${query}%` },
    );

    if (schoolId) {
      queryBuilder.andWhere('student.schoolId = :schoolId', { schoolId });
    }

    if (grade) {
      queryBuilder.andWhere('student.currentGrade = :grade', { grade });
    }

    if (section) {
      queryBuilder.andWhere('student.currentSection = :section', { section });
    }

    queryBuilder
      .andWhere('student.status = :status', { status: StudentStatus.ACTIVE })
      .orderBy('student.firstName', 'ASC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get student statistics
   */
  async getStatistics(schoolId?: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    studentsByGrade: Record<string, number>;
    studentsByStatus: Record<StudentStatus, number>;
    studentsByEnrollmentType: Record<EnrollmentType, number>;
  }> {
    let whereCondition = {};
    if (schoolId) {
      whereCondition = { schoolId };
    }

    const totalStudents = await this.studentsRepository.count({ where: whereCondition });
    const activeStudents = await this.studentsRepository.count({
      where: { ...whereCondition, status: StudentStatus.ACTIVE },
    });

    // Count students by grade
    const gradeCounts = await this.studentsRepository
      .createQueryBuilder('student')
      .select('student.currentGrade', 'grade')
      .addSelect('COUNT(*)', 'count')
      .where(whereCondition)
      .andWhere('student.status = :status', { status: StudentStatus.ACTIVE })
      .groupBy('student.currentGrade')
      .getRawMany();

    const studentsByGrade: Record<string, number> = {};
    gradeCounts.forEach(item => {
      studentsByGrade[item.grade] = parseInt(item.count);
    });

    // Count students by status
    const statusCounts = await this.studentsRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(whereCondition)
      .groupBy('student.status')
      .getRawMany();

    const studentsByStatus: Record<StudentStatus, number> = {
      [StudentStatus.ACTIVE]: 0,
      [StudentStatus.INACTIVE]: 0,
      [StudentStatus.GRADUATED]: 0,
      [StudentStatus.TRANSFERRED]: 0,
      [StudentStatus.WITHDRAWN]: 0,
      [StudentStatus.SUSPENDED]: 0,
    };

    statusCounts.forEach(item => {
      studentsByStatus[item.status as StudentStatus] = parseInt(item.count);
    });

    // Count students by enrollment type
    const enrollmentCounts = await this.studentsRepository
      .createQueryBuilder('student')
      .select('student.enrollmentType', 'enrollmentType')
      .addSelect('COUNT(*)', 'count')
      .where(whereCondition)
      .andWhere('student.status = :status', { status: StudentStatus.ACTIVE })
      .groupBy('student.enrollmentType')
      .getRawMany();

    const studentsByEnrollmentType: Record<EnrollmentType, number> = {
      [EnrollmentType.REGULAR]: 0,
      [EnrollmentType.SPECIAL_NEEDS]: 0,
      [EnrollmentType.GIFTED]: 0,
      [EnrollmentType.INTERNATIONAL]: 0,
      [EnrollmentType.TRANSFER]: 0,
    };

    enrollmentCounts.forEach(item => {
      studentsByEnrollmentType[item.enrollmentType as EnrollmentType] = parseInt(item.count);
    });

    return {
      totalStudents,
      activeStudents,
      studentsByGrade,
      studentsByStatus,
      studentsByEnrollmentType,
    };
  }

  /**
    * Remove student (soft delete by changing status)
    */
  async remove(id: string): Promise<void> {
    const student = await this.findStudentEntity(id);

    // Instead of hard delete, change status to inactive
    student.status = StudentStatus.INACTIVE;

    await this.studentsRepository.save(student);
  }

  // Private helper methods
  private async findStudentEntity(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  private async generateAdmissionNumber(schoolId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const schoolCode = schoolId.substring(0, 3).toUpperCase();

    // Get the next sequence number for this school and year
    const lastStudent = await this.studentsRepository
      .createQueryBuilder('student')
      .where('student.schoolId = :schoolId', { schoolId })
      .andWhere('student.admissionNumber LIKE :pattern', {
        pattern: `${schoolCode}${currentYear}%`
      })
      .orderBy('student.admissionNumber', 'DESC')
      .getOne();

    let sequenceNumber = 1;
    if (lastStudent) {
      const lastSequence = parseInt(lastStudent.admissionNumber.slice(-4));
      sequenceNumber = lastSequence + 1;
    }

    return `${schoolCode}${currentYear}${sequenceNumber.toString().padStart(4, '0')}`;
  }
}