// Academia Pro - Student Alumni Service
// Service for managing alumni records, career tracking, and engagement

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student.entity';
import { StudentAlumni, AlumniStatus, GraduationType } from '../entities/student-alumni.entity';
import { CreateAlumniDto, UpdateAlumniDto } from '../dtos/create-alumni.dto';

@Injectable()
export class StudentAlumniService {
  private readonly logger = new Logger(StudentAlumniService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentAlumni)
    private readonly alumniRepository: Repository<StudentAlumni>,
  ) {}

  /**
   * Create alumni record for a graduated student
   */
  async createAlumniRecord(
    studentId: string,
    createDto: CreateAlumniDto,
    createdBy: string,
  ): Promise<StudentAlumni> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Create alumni record
    const alumniRecord = this.alumniRepository.create({
      studentId,
      status: AlumniStatus.ACTIVE,
      graduationDate: new Date(createDto.graduationDate),
      graduationYear: createDto.graduationYear,
      graduationType: createDto.graduationType || GraduationType.REGULAR,
      graduationGPA: createDto.graduationGPA,
      graduationRank: createDto.graduationRank,
      classSize: createDto.classSize,
      academicHonors: createDto.academicHonors?.map(honor => ({
        honorType: honor.honorType,
        honorName: honor.honorName,
        awardDate: new Date(honor.awardDate),
        description: honor.description,
      })) || [],
      higherEducation: createDto.higherEducation?.map(education => ({
        institutionName: education.institutionName,
        program: education.program,
        degree: education.degree,
        startDate: new Date(education.startDate),
        endDate: education.endDate ? new Date(education.endDate) : undefined,
        gpa: education.gpa,
        status: education.status,
      })) || [],
      email: createDto.email,
      contactNumber: createDto.contactNumber,
      notableAlumni: createDto.notableAlumni || false,
      featuredInNewsletter: createDto.featuredInNewsletter || false,
      internalNotes: createDto.internalNotes,
    });

    const savedRecord = await this.alumniRepository.save(alumniRecord);

    this.logger.log(`Created alumni record ${savedRecord.id} for student ${studentId}`);
    return savedRecord;
  }

  /**
   * Get all alumni records
   */
  async getAlumniRecords(options?: {
    status?: string;
    graduationYear?: number;
    limit?: number;
    offset?: number;
  }): Promise<StudentAlumni[]> {
    const queryBuilder = this.alumniRepository
      .createQueryBuilder('alumni')
      .leftJoinAndSelect('alumni.student', 'student')
      .orderBy('alumni.graduationDate', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('alumni.status = :status', { status: options.status });
    }

    if (options?.graduationYear) {
      queryBuilder.andWhere('alumni.graduationYear = :graduationYear', {
        graduationYear: options.graduationYear,
      });
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
   * Get alumni record for a specific student
   */
  async getAlumniRecord(studentId: string): Promise<StudentAlumni> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    return alumniRecord;
  }

  /**
   * Update alumni record
   */
  async updateAlumniRecord(
    studentId: string,
    updateDto: UpdateAlumniDto,
  ): Promise<StudentAlumni> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    // Prepare update data - only use fields that exist in UpdateAlumniDto
    const updateData: Partial<StudentAlumni> = {};

    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.graduationDate) updateData.graduationDate = new Date(updateDto.graduationDate);
    if (updateDto.graduationYear !== undefined) updateData.graduationYear = updateDto.graduationYear;
    if (updateDto.graduationType) updateData.graduationType = updateDto.graduationType;
    if (updateDto.graduationGPA !== undefined) updateData.graduationGPA = updateDto.graduationGPA;
    if (updateDto.graduationRank !== undefined) updateData.graduationRank = updateDto.graduationRank;
    if (updateDto.classSize !== undefined) updateData.classSize = updateDto.classSize;
    if (updateDto.academicHonors) {
      updateData.academicHonors = updateDto.academicHonors.map(honor => ({
        honorType: honor.honorType,
        honorName: honor.honorName,
        awardDate: new Date(honor.awardDate),
        description: honor.description,
      }));
    }
    if (updateDto.higherEducation) {
      updateData.higherEducation = updateDto.higherEducation.map(education => ({
        institutionName: education.institutionName,
        program: education.program,
        degree: education.degree,
        startDate: new Date(education.startDate),
        endDate: education.endDate ? new Date(education.endDate) : undefined,
        gpa: education.gpa,
        status: education.status,
      }));
    }
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.contactNumber !== undefined) updateData.contactNumber = updateDto.contactNumber;
    if (updateDto.notableAlumni !== undefined) updateData.notableAlumni = updateDto.notableAlumni;
    if (updateDto.featuredInNewsletter !== undefined) updateData.featuredInNewsletter = updateDto.featuredInNewsletter;
    if (updateDto.internalNotes !== undefined) updateData.internalNotes = updateDto.internalNotes;

    await this.alumniRepository.update(alumniRecord.id, updateData);

    const updatedRecord = await this.getAlumniRecord(studentId);
    this.logger.log(`Updated alumni record for student ${studentId}`);
    return updatedRecord;
  }

  /**
   * Delete alumni record
   */
  async deleteAlumniRecord(studentId: string): Promise<void> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    await this.alumniRepository.remove(alumniRecord);
    this.logger.log(`Deleted alumni record for student ${studentId}`);
  }

  /**
   * Get alumni by graduation year
   */
  async getAlumniByGraduationYear(graduationYear: number): Promise<StudentAlumni[]> {
    return this.alumniRepository.find({
      where: { graduationYear },
      relations: ['student'],
      order: {
        graduationDate: 'DESC',
      },
    });
  }

  /**
   * Get notable alumni
   */
  async getNotableAlumni(): Promise<StudentAlumni[]> {
    return this.alumniRepository.find({
      where: { notableAlumni: true },
      relations: ['student'],
      order: {
        graduationDate: 'DESC',
      },
    });
  }

  /**
   * Get alumni by status
   */
  async getAlumniByStatus(status: string): Promise<StudentAlumni[]> {
    return this.alumniRepository.find({
      where: { status: status as any },
      relations: ['student'],
      order: {
        graduationDate: 'DESC',
      },
    });
  }

  /**
   * Search alumni
   */
  async searchAlumni(searchTerm: string): Promise<StudentAlumni[]> {
    const queryBuilder = this.alumniRepository
      .createQueryBuilder('alumni')
      .leftJoinAndSelect('alumni.student', 'student')
      .where(
        '(student.firstName ILIKE :searchTerm OR student.lastName ILIKE :searchTerm OR alumni.email ILIKE :searchTerm OR alumni.contactNumber ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('alumni.graduationDate', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Record contact with alumni
   */
  async recordContact(
    studentId: string,
    contactMethod: string,
    contactNotes?: string,
  ): Promise<StudentAlumni> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    await this.alumniRepository.update(alumniRecord.id, {
      lastContactDate: new Date(),
      lastContactMethod: contactMethod,
      lastContactNotes: contactNotes,
    });

    const updatedRecord = await this.getAlumniRecord(studentId);
    this.logger.log(`Recorded contact with alumni ${studentId}`);
    return updatedRecord;
  }

  /**
   * Add survey response
   */
  async addSurveyResponse(
    studentId: string,
    surveyName: string,
    responses: Record<string, any>,
  ): Promise<StudentAlumni> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    const surveyResponse = {
      surveyName,
      surveyDate: new Date(),
      responses,
    };

    const updatedSurveyResponses = [...(alumniRecord.surveyResponses || []), surveyResponse];

    await this.alumniRepository.update(alumniRecord.id, {
      surveyResponses: updatedSurveyResponses,
    });

    const updatedRecord = await this.getAlumniRecord(studentId);
    this.logger.log(`Added survey response for alumni ${studentId}`);
    return updatedRecord;
  }

  /**
   * Add feedback
   */
  async addFeedback(
    studentId: string,
    feedbackType: string,
    feedbackContent: string,
  ): Promise<StudentAlumni> {
    const alumniRecord = await this.alumniRepository.findOne({
      where: { studentId },
    });

    if (!alumniRecord) {
      throw new NotFoundException(`Alumni record not found for student ${studentId}`);
    }

    const feedback = {
      feedbackType,
      feedbackDate: new Date(),
      feedbackContent,
    };

    const updatedFeedback = [...(alumniRecord.feedbackProvided || []), feedback];

    await this.alumniRepository.update(alumniRecord.id, {
      feedbackProvided: updatedFeedback,
    });

    const updatedRecord = await this.getAlumniRecord(studentId);
    this.logger.log(`Added feedback for alumni ${studentId}`);
    return updatedRecord;
  }

  /**
   * Get alumni statistics
   */
  async getAlumniStatistics(): Promise<{
    totalAlumni: number;
    activeAlumni: number;
    notableAlumni: number;
    alumniByYear: Record<string, number>;
    alumniByStatus: Record<string, number>;
    recentGraduates: number;
  }> {
    const [totalAlumni, activeAlumni, notableAlumni] = await Promise.all([
      this.alumniRepository.count(),
      this.alumniRepository.count({ where: { status: AlumniStatus.ACTIVE } }),
      this.alumniRepository.count({ where: { notableAlumni: true } }),
    ]);

    // Get alumni by graduation year
    const alumniByYear = await this.alumniRepository
      .createQueryBuilder('alumni')
      .select('alumni.graduationYear', 'year')
      .addSelect('COUNT(*)', 'count')
      .groupBy('alumni.graduationYear')
      .orderBy('alumni.graduationYear', 'DESC')
      .limit(10)
      .getRawMany();

    const yearStats = {};
    alumniByYear.forEach(item => {
      yearStats[item.year] = parseInt(item.count);
    });

    // Get alumni by status
    const alumniByStatus = await this.alumniRepository
      .createQueryBuilder('alumni')
      .select('alumni.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('alumni.status')
      .getRawMany();

    const statusStats = {};
    alumniByStatus.forEach(item => {
      statusStats[item.status] = parseInt(item.count);
    });

    // Get recent graduates (last 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const recentGraduates = await this.alumniRepository.count({
      where: {
        graduationDate: fiveYearsAgo as any,
      },
    });

    return {
      totalAlumni,
      activeAlumni,
      notableAlumni,
      alumniByYear: yearStats,
      alumniByStatus: statusStats,
      recentGraduates,
    };
  }

  /**
   * Get alumni engagement metrics
   */
  async getEngagementMetrics(): Promise<{
    associationMembers: number;
    mentorshipParticipants: number;
    eventAttendees: number;
    donors: number;
    surveyParticipants: number;
  }> {
    const [
      associationMembers,
      mentorshipParticipants,
      eventAttendees,
      donors,
      surveyParticipants,
    ] = await Promise.all([
      this.alumniRepository.count({ where: { alumniAssociationMember: true } }),
      this.alumniRepository
        .createQueryBuilder('alumni')
        .where('JSONB_ARRAY_LENGTH(alumni.mentorshipPrograms) > 0')
        .getCount(),
      this.alumniRepository
        .createQueryBuilder('alumni')
        .where('JSONB_ARRAY_LENGTH(alumni.schoolEventsAttended) > 0')
        .getCount(),
      this.alumniRepository
        .createQueryBuilder('alumni')
        .where('JSONB_ARRAY_LENGTH(alumni.donationsMade) > 0')
        .getCount(),
      this.alumniRepository
        .createQueryBuilder('alumni')
        .where('JSONB_ARRAY_LENGTH(alumni.surveyResponses) > 0')
        .getCount(),
    ]);

    return {
      associationMembers,
      mentorshipParticipants,
      eventAttendees,
      donors,
      surveyParticipants,
    };
  }
}