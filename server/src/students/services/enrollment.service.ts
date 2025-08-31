import { Injectable, Inject, forwardRef, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Student, StudentStatus, EnrollmentType } from '../student.entity';
import { StudentTransfer } from '../entities/student-transfer.entity';
import { StudentDocument, DocumentStatus } from '../entities/student-document.entity';
import { StudentAuditLog } from '../entities/student-audit-log.entity';
import { AuditAction, AuditEntityType } from '../entities/student-audit-log.entity';

export interface AdmissionApplicationDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address: any;
  parents: any;
  medicalInfo?: any;
  preferences: any;
  documents: any[];
  academicYear: string;
  grade: string;
  enrollmentType: string;
  admissionNumber?: string;
}

export interface EnrollmentDto {
  studentId: string;
  academicYear: string;
  grade: string;
  section: string;
  rollNumber?: string;
  enrollmentDate: Date;
  feeCategory: string;
  transportationRequired?: boolean;
  hostelRequired?: boolean;
  specialNeeds?: boolean;
  notes?: string;
}

@Injectable()
export class StudentEnrollmentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentTransfer)
    private transferRepository: Repository<StudentTransfer>,
    @InjectRepository(StudentDocument)
    private documentRepository: Repository<StudentDocument>,
    @InjectRepository(StudentAuditLog)
    private auditLogRepository: Repository<StudentAuditLog>,
    private dataSource: DataSource,
  ) {}

  async createAdmission(admissionData: AdmissionApplicationDto, schoolId: string, userId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if admission number already exists
      if (admissionData.admissionNumber) {
        const existingStudent = await queryRunner.manager.findOne(Student, {
          where: { admissionNumber: admissionData.admissionNumber, schoolId },
        });
        if (existingStudent) {
          throw new ConflictException('Admission number already exists');
        }
      }

      // Create student record
      const student = queryRunner.manager.create(Student, {
        firstName: admissionData.firstName,
        lastName: admissionData.lastName,
        middleName: admissionData.middleName,
        dateOfBirth: admissionData.dateOfBirth,
        gender: admissionData.gender,
        email: admissionData.email,
        phone: admissionData.phone,
        address: admissionData.address,
        admissionNumber: admissionData.admissionNumber,
        currentGrade: admissionData.grade,
        enrollmentType: admissionData.enrollmentType as EnrollmentType,
        schoolId,
        status: StudentStatus.ACTIVE,
        parents: admissionData.parents,
        medicalInfo: admissionData.medicalInfo,
        preferences: admissionData.preferences,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedStudent = await queryRunner.manager.save(Student, student);

      // Create documents if provided
      if (admissionData.documents && admissionData.documents.length > 0) {
        const documents = admissionData.documents.map(doc =>
          queryRunner.manager.create(StudentDocument, {
            studentId: savedStudent.id,
            documentType: doc.type,
            documentName: doc.name,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSizeBytes: doc.fileSize,
            mimeType: doc.mimeType,
            uploadedBy: userId,
            uploadedByName: 'System', // TODO: Get actual user name
            status: DocumentStatus.SUBMITTED,
          })
        );
        await queryRunner.manager.save(StudentDocument, documents);
      }

      // Log audit event
      await this.logAuditEvent(
        queryRunner.manager,
        savedStudent.id,
        AuditAction.CREATE,
        AuditEntityType.STUDENT_PROFILE,
        { admissionData },
        userId,
        'Student admission created'
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        student: savedStudent,
        message: 'Student admission created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createBulkAdmission(bulkData: { applications: AdmissionApplicationDto[] }, schoolId: string, userId: string): Promise<any> {
    const results = {
      successful: [],
      failed: [],
      total: bulkData.applications.length,
    };

    for (const application of bulkData.applications) {
      try {
        const result = await this.createAdmission(application, schoolId, userId);
        results.successful.push(result);
      } catch (error) {
        results.failed.push({
          application,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      results,
      message: `Bulk admission completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
    };
  }

  async getAdmissionApplications(schoolId: string, query: any): Promise<any> {
    const { status, page = 1, limit = 10 } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .where('student.schoolId = :schoolId', { schoolId })
      .leftJoinAndSelect('student.documents', 'documents')
      .orderBy('student.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    const [students, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      applications: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdmissionApplication(applicationId: string, schoolId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: applicationId, schoolId },
      relations: ['documents'],
    });

    if (!student) {
      throw new NotFoundException('Admission application not found');
    }

    return student;
  }

  async reviewAdmissionApplication(applicationId: string, reviewData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: applicationId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Admission application not found');
    }

    // Update student with review data
    await this.studentRepository.update(applicationId, {
      ...reviewData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      applicationId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { reviewData },
      userId,
      'Admission application reviewed'
    );

    return {
      success: true,
      message: 'Admission application reviewed successfully',
    };
  }

  async approveAdmissionApplication(applicationId: string, approvalData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: applicationId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Admission application not found');
    }

    // Update student status to approved
    await this.studentRepository.update(applicationId, {
      status: StudentStatus.ACTIVE,
      admissionDate: approvalData.admissionDate || new Date(),
      ...approvalData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      applicationId,
      AuditAction.APPROVE,
      AuditEntityType.STUDENT_PROFILE,
      { approvalData },
      userId,
      'Admission application approved'
    );

    return {
      success: true,
      message: 'Admission application approved successfully',
    };
  }

  async rejectAdmissionApplication(applicationId: string, rejectionData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: applicationId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Admission application not found');
    }

    // Update student status to rejected
    await this.studentRepository.update(applicationId, {
      status: StudentStatus.INACTIVE,
      ...rejectionData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      applicationId,
      AuditAction.REJECT,
      AuditEntityType.STUDENT_PROFILE,
      { rejectionData },
      userId,
      'Admission application rejected'
    );

    return {
      success: true,
      message: 'Admission application rejected successfully',
    };
  }

  async enrollStudent(studentId: string, enrollmentData: EnrollmentDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Update student with enrollment data
    await this.studentRepository.update(studentId, {
      currentGrade: enrollmentData.grade,
      currentSection: enrollmentData.section,
      status: StudentStatus.ACTIVE,
      ...enrollmentData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_ENROLLMENT,
      { enrollmentData },
      userId,
      'Student enrolled successfully'
    );

    return {
      success: true,
      message: 'Student enrolled successfully',
    };
  }

  async getEnrollments(schoolId: string, query: any): Promise<any> {
    const { academicYear, grade, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .where('student.schoolId = :schoolId', { schoolId })
      .andWhere('student.status = :status', { status: StudentStatus.ACTIVE })
      .orderBy('student.admissionDate', 'DESC');

    if (academicYear) {
      // TODO: Add academic year filtering logic
    }

    if (grade) {
      queryBuilder.andWhere('student.currentGrade = :grade', { grade });
    }

    const [students, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      enrollments: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEnrollment(enrollmentId: string, schoolId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: enrollmentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Enrollment not found');
    }

    return student;
  }

  async updateEnrollment(enrollmentId: string, updateData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: enrollmentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.studentRepository.update(enrollmentId, {
      ...updateData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      enrollmentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_ENROLLMENT,
      { updateData },
      userId,
      'Enrollment updated'
    );

    return {
      success: true,
      message: 'Enrollment updated successfully',
    };
  }

  async cancelEnrollment(enrollmentId: string, cancellationData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: enrollmentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.studentRepository.update(enrollmentId, {
      status: StudentStatus.INACTIVE,
      ...cancellationData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      enrollmentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_ENROLLMENT,
      { cancellationData },
      userId,
      'Enrollment cancelled'
    );

    return {
      success: true,
      message: 'Enrollment cancelled successfully',
    };
  }

  async getEnrollmentStatistics(schoolId: string, academicYear?: string): Promise<any> {
    // TODO: Implement comprehensive enrollment statistics
    const totalStudents = await this.studentRepository.count({
      where: { schoolId, status: StudentStatus.ACTIVE },
    });

    const gradeDistribution = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.currentGrade', 'grade')
      .addSelect('COUNT(*)', 'count')
      .where('student.schoolId = :schoolId', { schoolId })
      .andWhere('student.status = :status', { status: StudentStatus.ACTIVE })
      .groupBy('student.currentGrade')
      .getRawMany();

    return {
      totalStudents,
      gradeDistribution,
      academicYear: academicYear || new Date().getFullYear().toString(),
    };
  }

  async addToWaitlist(waitlistData: any, schoolId: string, userId: string): Promise<any> {
    // TODO: Implement waitlist functionality
    // This would create a separate waitlist entity
    return {
      success: true,
      message: 'Student added to waitlist',
    };
  }

  async getWaitlist(schoolId: string, query: any): Promise<any> {
    // TODO: Implement waitlist retrieval
    return {
      waitlist: [],
      total: 0,
    };
  }

  async offerFromWaitlist(waitlistId: string, offerData: any, schoolId: string, userId: string): Promise<any> {
    // TODO: Implement waitlist offer functionality
    return {
      success: true,
      message: 'Admission offered from waitlist',
    };
  }

  private async logAuditEvent(
    entityManager: EntityManager,
    studentId: string,
    action: AuditAction,
    entityType: AuditEntityType,
    changes: any,
    userId: string,
    description: string,
  ): Promise<void> {
    const auditLog = entityManager.create(StudentAuditLog, {
      studentId,
      action,
      entityType,
      entityId: studentId,
      oldValues: changes.oldValues || {},
      newValues: changes.newValues || changes,
      changedFields: Object.keys(changes),
      changeDescription: description,
      userId,
      userName: 'System', // TODO: Get actual user name
      userRole: 'admin', // TODO: Get actual user role
    });

    await entityManager.save(StudentAuditLog, auditLog);
  }
}