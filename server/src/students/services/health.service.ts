// Academia Pro - Student Health Service
// Service for managing student health records and medical information

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Student } from '../student.entity';
import { StudentMedicalRecord, MedicalStatus, MedicalRecordType } from '../entities/student-medical-record.entity';
import { CreateHealthRecordDto, UpdateHealthRecordDto } from '../dtos/create-health-record.dto';

@Injectable()
export class StudentHealthService {
  private readonly logger = new Logger(StudentHealthService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentMedicalRecord)
    private readonly medicalRecordRepository: Repository<StudentMedicalRecord>,
  ) {}

  /**
   * Get student's basic health information
   */
  async getStudentHealthInfo(studentId: string): Promise<Student['medicalInfo'] | null> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'medicalInfo'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return student.medicalInfo || null;
  }

  /**
   * Update student's basic health information
   */
  async updateStudentHealthInfo(
    studentId: string,
    updateDto: UpdateHealthRecordDto,
    updatedBy: string,
  ): Promise<Student['medicalInfo'] | null> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Update medical info
    const currentMedicalInfo = student.medicalInfo || {};
    const updatedMedicalInfo = {
      ...currentMedicalInfo,
      ...updateDto,
    };

    // Update the student record
    await this.studentRepository.update(studentId, {
      medicalInfo: updatedMedicalInfo,
      updatedBy,
    });

    this.logger.log(`Updated health information for student ${studentId}`);
    return updatedMedicalInfo;
  }

  /**
   * Create a new medical record for a student
   */
  async createMedicalRecord(
    studentId: string,
    createDto: CreateHealthRecordDto,
    createdBy: string,
  ): Promise<StudentMedicalRecord> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Create medical record
    const medicalRecord = this.medicalRecordRepository.create({
      studentId,
      recordType: MedicalRecordType.OTHER, // Default type, can be updated based on content
      recordTitle: 'Health Record Update',
      recordDescription: `Health information update for ${student.firstName} ${student.lastName}`,
      recordDate: new Date(),
      healthcareProviderName: createDto.doctorInfo?.firstName && createDto.doctorInfo?.lastName
        ? `${createDto.doctorInfo.firstName} ${createDto.doctorInfo.lastName}`
        : 'School Health Service',
      healthcareProviderType: 'school_health',
      status: MedicalStatus.ACTIVE,
      academicYear: new Date().getFullYear().toString(),
      gradeLevel: student.currentGrade,
      createdBy,
      createdByName: 'System', // This should be passed from the controller
      metadata: {
        category: 'health_update',
        priority: 'normal' as any,
        tags: ['health', 'update'],
      },
    });

    const savedRecord = await this.medicalRecordRepository.save(medicalRecord);

    // Also update the student's basic medical info
    await this.updateStudentHealthInfo(studentId, createDto, createdBy);

    this.logger.log(`Created medical record ${savedRecord.id} for student ${studentId}`);
    return savedRecord;
  }

  /**
   * Get all medical records for a student
   */
  async getStudentMedicalRecords(
    studentId: string,
    options?: {
      status?: string;
      recordType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<StudentMedicalRecord[]> {
    const queryBuilder = this.medicalRecordRepository
      .createQueryBuilder('record')
      .where('record.studentId = :studentId', { studentId })
      .orderBy('record.recordDate', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('record.status = :status', { status: options.status });
    }

    if (options?.recordType) {
      queryBuilder.andWhere('record.recordType = :recordType', { recordType: options.recordType });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get a specific medical record
   */
  async getMedicalRecord(recordId: string): Promise<StudentMedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id: recordId },
      relations: ['student'],
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${recordId} not found`);
    }

    return record;
  }

  /**
   * Update a medical record
   */
  async updateMedicalRecord(
    recordId: string,
    updateData: Partial<StudentMedicalRecord>,
    updatedBy: string,
  ): Promise<StudentMedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${recordId} not found`);
    }

    await this.medicalRecordRepository.update(recordId, {
      ...updateData,
      updatedBy,
      updatedByName: 'System', // This should be passed from the controller
    });

    const updatedRecord = await this.getMedicalRecord(recordId);
    this.logger.log(`Updated medical record ${recordId}`);
    return updatedRecord;
  }

  /**
   * Delete a medical record
   */
  async deleteMedicalRecord(recordId: string): Promise<void> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${recordId} not found`);
    }

    await this.medicalRecordRepository.remove(record);
    this.logger.log(`Deleted medical record ${recordId}`);
  }

  /**
   * Get medical records by type
   */
  async getMedicalRecordsByType(
    studentId: string,
    recordType: string,
  ): Promise<StudentMedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: {
        studentId,
        recordType: recordType as any,
      },
      order: {
        recordDate: 'DESC',
      },
    });
  }

  /**
   * Get active medical conditions for a student
   */
  async getActiveMedicalConditions(studentId: string): Promise<StudentMedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: {
        studentId,
        status: MedicalStatus.ACTIVE,
      },
      order: {
        recordDate: 'DESC',
      },
    });
  }

  /**
   * Get medical records requiring follow-up
   */
  async getMedicalRecordsRequiringFollowUp(studentId: string): Promise<StudentMedicalRecord[]> {
    return this.medicalRecordRepository.find({
      where: {
        studentId,
        followUpRequired: true,
        status: MedicalStatus.ACTIVE,
      },
      order: {
        followUpDate: 'ASC',
      },
    });
  }

  /**
   * Search medical records
   */
  async searchMedicalRecords(
    studentId: string,
    searchTerm: string,
  ): Promise<StudentMedicalRecord[]> {
    const queryBuilder = this.medicalRecordRepository
      .createQueryBuilder('record')
      .where('record.studentId = :studentId', { studentId })
      .andWhere(
        '(record.recordTitle ILIKE :searchTerm OR record.recordDescription ILIKE :searchTerm OR record.diagnosis ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('record.recordDate', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Get medical statistics for a student
   */
  async getMedicalStatistics(studentId: string): Promise<{
    totalRecords: number;
    activeConditions: number;
    followUpRequired: number;
    recentVisits: number;
    allergies: string[];
    medications: string[];
  }> {
    const [totalRecords, activeConditions, followUpRequired] = await Promise.all([
      this.medicalRecordRepository.count({ where: { studentId } }),
      this.medicalRecordRepository.count({
        where: { studentId, status: MedicalStatus.ACTIVE },
      }),
      this.medicalRecordRepository.count({
        where: { studentId, followUpRequired: true, status: MedicalStatus.ACTIVE },
      }),
    ]);

    // Get recent visits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentVisits = await this.medicalRecordRepository.count({
      where: {
        studentId,
        recordDate: MoreThan(thirtyDaysAgo),
      },
    });

    // Get student health info for allergies and medications
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'medicalInfo'],
    });

    const allergies = student?.medicalInfo?.allergies || [];
    const medications = student?.medicalInfo?.medications || [];

    return {
      totalRecords,
      activeConditions,
      followUpRequired,
      recentVisits,
      allergies,
      medications,
    };
  }
}