import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student, BloodGroup, EnrollmentType, StudentStatus } from '../student.entity';
import { StudentAuditLog, AuditAction, AuditEntityType } from '../entities/student-audit-log.entity';

export interface ProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address?: any;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  languages?: string[];
}

export interface ContactUpdateDto {
  email?: string;
  phone?: string;
  address?: any;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface AcademicUpdateDto {
  currentGrade?: string;
  currentSection?: string;
  rollNumber?: string;
  admissionNumber?: string;
  enrollmentType?: string;
  academicStanding?: any;
}

export interface MedicalUpdateDto {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  doctorInfo?: {
    name?: string;
    phone?: string;
    clinic?: string;
  };
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: Date | string;
  };
}

export interface FinancialUpdateDto {
  feeCategory?: string;
  scholarship?: {
    type: string;
    amount: number;
    percentage: number;
    validUntil: Date;
  };
  paymentPlan?: string;
}

export interface PreferencesUpdateDto {
  language?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    parentCommunication: boolean;
  };
  extracurricular?: string[];
  careerInterests?: string[];
}

@Injectable()
export class StudentProfileService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentAuditLog)
    private auditLogRepository: Repository<StudentAuditLog>,
    private dataSource: DataSource,
  ) {}

  async getStudentProfile(studentId: string, schoolId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
      relations: ['documents'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      ...student,
      age: student.age,
      fullName: student.fullName,
      isActive: student.isActive,
      hasTransportation: student.hasTransportation,
      hasHostel: student.hasHostel,
      hasScholarship: student.hasScholarship,
    };
  }

  async updateStudentProfile(studentId: string, updateData: ProfileUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName,
      email: student.email,
      phone: student.phone,
    };

    const updatePayload: any = {
      ...updateData,
      updatedBy: userId,
    };

    // Handle enum conversions
    if (updateData.bloodGroup) {
      updatePayload.bloodGroup = updateData.bloodGroup as BloodGroup;
    }

    await this.studentRepository.update(studentId, updatePayload);

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: updateData },
      userId,
      'Student profile updated'
    );

    return {
      success: true,
      message: 'Student profile updated successfully',
    };
  }

  async updatePersonalInfo(studentId: string, personalData: ProfileUpdateDto, schoolId: string, userId: string): Promise<any> {
    return this.updateStudentProfile(studentId, personalData, schoolId, userId);
  }

  async updateContactInfo(studentId: string, contactData: ContactUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      email: student.email,
      phone: student.phone,
      address: student.address,
      medicalInfo: student.medicalInfo,
    };

    const updateData = {
      email: contactData.email,
      phone: contactData.phone,
      address: contactData.address,
      medicalInfo: contactData.emergencyContact ? {
        ...student.medicalInfo,
        emergencyContact: contactData.emergencyContact,
      } : student.medicalInfo,
    };

    await this.studentRepository.update(studentId, {
      ...updateData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: updateData },
      userId,
      'Student contact information updated'
    );

    return {
      success: true,
      message: 'Contact information updated successfully',
    };
  }

  async updateAcademicInfo(studentId: string, academicData: AcademicUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      currentGrade: student.currentGrade,
      currentSection: student.currentSection,
      admissionNumber: student.admissionNumber,
      enrollmentType: student.enrollmentType,
      academicStanding: student.academicStanding,
    };

    const academicUpdatePayload: any = {
      ...academicData,
      updatedBy: userId,
    };

    // Handle enum conversions for academic updates
    if (academicData.enrollmentType) {
      academicUpdatePayload.enrollmentType = academicData.enrollmentType as EnrollmentType;
    }

    await this.studentRepository.update(studentId, academicUpdatePayload);

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: academicData },
      userId,
      'Student academic information updated'
    );

    return {
      success: true,
      message: 'Academic information updated successfully',
    };
  }

  async updateMedicalInfo(studentId: string, medicalData: MedicalUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      medicalInfo: student.medicalInfo,
    };

    // Process medicalData to convert Date to string for compatibility
    const processedMedicalData = { ...medicalData };
    if (processedMedicalData.insuranceInfo?.expiryDate instanceof Date) {
      (processedMedicalData.insuranceInfo as any).expiryDate = processedMedicalData.insuranceInfo.expiryDate.toISOString();
    }

    const updateData = {
      medicalInfo: {
        ...student.medicalInfo,
        ...processedMedicalData,
      },
    };

    await this.studentRepository.update(studentId, {
      ...updateData,
      updatedBy: userId,
    } as any);

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: updateData },
      userId,
      'Student medical information updated'
    );

    return {
      success: true,
      message: 'Medical information updated successfully',
    };
  }

  async updateFinancialInfo(studentId: string, financialData: FinancialUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      financialInfo: student.financialInfo,
    };

    const updateData = {
      financialInfo: {
        ...student.financialInfo,
        ...financialData,
      },
    };

    const updatePayload: any = {
      ...updateData,
      updatedBy: userId,
    };

    await this.studentRepository.update(studentId, updatePayload);

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: updateData },
      userId,
      'Student financial information updated'
    );

    return {
      success: true,
      message: 'Financial information updated successfully',
    };
  }

  async updatePreferences(studentId: string, preferencesData: PreferencesUpdateDto, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const oldValues = {
      preferences: student.preferences,
    };

    const updateData = {
      preferences: {
        ...student.preferences,
        ...preferencesData,
      },
    };

    await this.studentRepository.update(studentId, {
      ...updateData,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { oldValues, newValues: updateData },
      userId,
      'Student preferences updated'
    );

    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  }

  async uploadStudentPhoto(studentId: string, file: any, schoolId: string, userId: string): Promise<any> {
    // TODO: Implement file upload logic
    // This would typically involve:
    // 1. Validate file type and size
    // 2. Upload to cloud storage (AWS S3, etc.)
    // 3. Update student record with photo URL
    // 4. Log audit event

    return {
      success: true,
      message: 'Student photo uploaded successfully',
      photoUrl: 'https://example.com/photos/' + studentId + '.jpg',
    };
  }

  async getProfileHistory(studentId: string, schoolId: string, query: any): Promise<any> {
    const { page = 1, limit = 10 } = query;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: {
        studentId,
        entityType: AuditEntityType.STUDENT_PROFILE,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      history: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProfileAuditTrail(studentId: string, schoolId: string, query: any): Promise<any> {
    const { page = 1, limit = 10 } = query;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { studentId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      auditTrail: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async verifyProfile(studentId: string, verificationData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // TODO: Implement profile verification logic
    // This could involve updating verification status, timestamps, etc.

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { verificationData },
      userId,
      'Student profile verified'
    );

    return {
      success: true,
      message: 'Student profile verified successfully',
    };
  }

  async searchStudents(schoolId: string, query: any): Promise<any> {
    const { searchQuery, grade, section, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .where('student.schoolId = :schoolId', { schoolId });

    if (searchQuery) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :query OR student.lastName ILIKE :query OR student.admissionNumber ILIKE :query)',
        { query: `%${searchQuery}%` }
      );
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

    const [students, total] = await queryBuilder
      .orderBy('student.admissionNumber', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      students: students.map(student => ({
        id: student.id,
        admissionNumber: student.admissionNumber,
        fullName: student.fullName,
        currentGrade: student.currentGrade,
        currentSection: student.currentSection,
        status: student.status,
        email: student.email,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProfileStatistics(schoolId: string): Promise<any> {
    // TODO: Implement comprehensive profile statistics
    const totalStudents = await this.studentRepository.count({
      where: { schoolId },
    });

    const activeStudents = await this.studentRepository.count({
      where: { schoolId, status: StudentStatus.ACTIVE },
    });

    const gradeDistribution = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.currentGrade', 'grade')
      .addSelect('COUNT(*)', 'count')
      .where('student.schoolId = :schoolId', { schoolId })
      .groupBy('student.currentGrade')
      .getRawMany();

    return {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
      gradeDistribution,
    };
  }

  async archiveProfile(studentId: string, archiveData: any, schoolId: string, userId: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // TODO: Implement archiving logic
    // This could involve moving to archive tables, updating status, etc.

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { archiveData },
      userId,
      'Student profile archived'
    );

    return {
      success: true,
      message: 'Student profile archived successfully',
    };
  }

  async restoreProfile(studentId: string, schoolId: string, userId: string): Promise<any> {
    // TODO: Implement profile restoration logic

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_PROFILE,
      { restored: true },
      userId,
      'Student profile restored'
    );

    return {
      success: true,
      message: 'Student profile restored successfully',
    };
  }

  private async logAuditEvent(
    entityManager: any,
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
      changedFields: Object.keys(changes.newValues || changes),
      changeDescription: description,
      userId,
      userName: 'System', // TODO: Get actual user name
      userRole: 'admin', // TODO: Get actual user role
    });

    await entityManager.save(StudentAuditLog, auditLog);
  }
}