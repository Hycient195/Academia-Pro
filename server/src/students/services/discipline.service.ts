// Academia Pro - Student Discipline Service
// Service for managing student discipline incidents and records

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student.entity';
import { StudentDiscipline, DisciplineType, DisciplineSeverity, DisciplineStatus, DisciplineAction } from '../entities/student-discipline.entity';
import { CreateDisciplineDto, UpdateDisciplineDto } from '../dtos/create-discipline.dto';

@Injectable()
export class StudentDisciplineService {
  private readonly logger = new Logger(StudentDisciplineService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentDiscipline)
    private readonly disciplineRepository: Repository<StudentDiscipline>,
  ) {}

  /**
   * Create a new discipline incident
   */
  async createDisciplineIncident(
    studentId: string,
    createDto: CreateDisciplineDto,
    createdBy: string,
  ): Promise<StudentDiscipline> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Create discipline incident
    const disciplineIncident = this.disciplineRepository.create({
      studentId,
      disciplineType: createDto.disciplineType,
      severity: createDto.severity || DisciplineSeverity.MINOR,
      status: DisciplineStatus.REPORTED,
      incidentDate: new Date(createDto.incidentDate),
      incidentTime: createDto.incidentTime,
      incidentLocation: createDto.incidentLocation,
      incidentDescription: createDto.incidentDescription,
      witnesses: createDto.witnesses || [],
      reportedBy: createDto.reportedBy,
      reportedByName: createDto.reportedByName,
      reportedByRole: createDto.reportedByRole,
      reportDetails: createDto.reportDetails,
      investigationRequired: createDto.investigationRequired || false,
      disciplineAction: createDto.disciplineAction,
      actionDescription: createDto.actionDescription,
      actionStartDate: createDto.actionStartDate ? new Date(createDto.actionStartDate) : undefined,
      actionEndDate: createDto.actionEndDate ? new Date(createDto.actionEndDate) : undefined,
      actionDurationDays: createDto.actionDurationDays,
      parentNotified: createDto.parentNotified || false,
      parentNotificationDate: createDto.parentNotificationDate ? new Date(createDto.parentNotificationDate) : undefined,
      followUpRequired: createDto.followUpRequired || false,
      followUpDate: createDto.followUpDate ? new Date(createDto.followUpDate) : undefined,
      followUpNotes: createDto.followUpNotes,
      supportingDocuments: createDto.supportingDocuments?.map(doc => ({
        documentType: doc.documentType,
        documentName: doc.documentName,
        documentUrl: doc.documentUrl,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
      })) || [],
      academicYear: createDto.academicYear,
      gradeLevel: createDto.gradeLevel,
      section: createDto.section,
      impactOnStudent: createDto.impactOnStudent,
      impactOnClass: createDto.impactOnClass,
      preventiveMeasures: createDto.preventiveMeasures,
      isRepeatedOffense: createDto.isRepeatedOffense || false,
      previousOffensesCount: createDto.previousOffensesCount || 0,
      confidential: createDto.confidential || false,
      metadata: createDto.metadata,
      internalNotes: createDto.internalNotes,
    });

    const savedIncident = await this.disciplineRepository.save(disciplineIncident);

    this.logger.log(`Created discipline incident ${savedIncident.id} for student ${studentId}`);
    return savedIncident;
  }

  /**
   * Get all discipline incidents for a student
   */
  async getStudentDisciplineIncidents(
    studentId: string,
    options?: {
      status?: string;
      type?: string;
      severity?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<StudentDiscipline[]> {
    const queryBuilder = this.disciplineRepository
      .createQueryBuilder('discipline')
      .where('discipline.studentId = :studentId', { studentId })
      .orderBy('discipline.incidentDate', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('discipline.status = :status', { status: options.status });
    }

    if (options?.type) {
      queryBuilder.andWhere('discipline.disciplineType = :type', { type: options.type });
    }

    if (options?.severity) {
      queryBuilder.andWhere('discipline.severity = :severity', { severity: options.severity });
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
   * Get a specific discipline incident
   */
  async getDisciplineIncident(incidentId: string): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
      relations: ['student'],
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    return incident;
  }

  /**
   * Update a discipline incident
   */
  async updateDisciplineIncident(
    incidentId: string,
    updateDto: UpdateDisciplineDto,
    updatedBy: string,
  ): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    // Prepare update data
    const updateData: Partial<StudentDiscipline> = {};

    if (updateDto.disciplineType) updateData.disciplineType = updateDto.disciplineType;
    if (updateDto.severity) updateData.severity = updateDto.severity;
    if (updateDto.status) updateData.status = updateDto.status as any;
    if (updateDto.incidentDate) updateData.incidentDate = new Date(updateDto.incidentDate);
    if (updateDto.incidentTime !== undefined) updateData.incidentTime = updateDto.incidentTime;
    if (updateDto.incidentLocation) updateData.incidentLocation = updateDto.incidentLocation;
    if (updateDto.incidentDescription) updateData.incidentDescription = updateDto.incidentDescription;
    if (updateDto.witnesses) updateData.witnesses = updateDto.witnesses;
    if (updateDto.reportDetails !== undefined) updateData.reportDetails = updateDto.reportDetails;
    if (updateDto.investigationRequired !== undefined) updateData.investigationRequired = updateDto.investigationRequired;
    if (updateDto.disciplineAction) updateData.disciplineAction = updateDto.disciplineAction;
    if (updateDto.actionDescription !== undefined) updateData.actionDescription = updateDto.actionDescription;
    if (updateDto.actionStartDate) updateData.actionStartDate = new Date(updateDto.actionStartDate);
    if (updateDto.actionEndDate) updateData.actionEndDate = new Date(updateDto.actionEndDate);
    if (updateDto.actionDurationDays !== undefined) updateData.actionDurationDays = updateDto.actionDurationDays;
    if (updateDto.parentNotified !== undefined) updateData.parentNotified = updateDto.parentNotified;
    if (updateDto.parentNotificationDate) updateData.parentNotificationDate = new Date(updateDto.parentNotificationDate);
    if (updateDto.followUpRequired !== undefined) updateData.followUpRequired = updateDto.followUpRequired;
    if (updateDto.followUpDate) updateData.followUpDate = new Date(updateDto.followUpDate);
    if (updateDto.followUpNotes !== undefined) updateData.followUpNotes = updateDto.followUpNotes;
    if (updateDto.supportingDocuments) {
      updateData.supportingDocuments = updateDto.supportingDocuments.map(doc => ({
        documentType: doc.documentType,
        documentName: doc.documentName,
        documentUrl: doc.documentUrl,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
      }));
    }
    if (updateDto.academicYear) updateData.academicYear = updateDto.academicYear;
    if (updateDto.gradeLevel) updateData.gradeLevel = updateDto.gradeLevel;
    if (updateDto.section !== undefined) updateData.section = updateDto.section;
    if (updateDto.impactOnStudent !== undefined) updateData.impactOnStudent = updateDto.impactOnStudent;
    if (updateDto.impactOnClass !== undefined) updateData.impactOnClass = updateDto.impactOnClass;
    if (updateDto.preventiveMeasures !== undefined) updateData.preventiveMeasures = updateDto.preventiveMeasures;
    if (updateDto.isRepeatedOffense !== undefined) updateData.isRepeatedOffense = updateDto.isRepeatedOffense;
    if (updateDto.previousOffensesCount !== undefined) updateData.previousOffensesCount = updateDto.previousOffensesCount;
    if (updateDto.confidential !== undefined) updateData.confidential = updateDto.confidential;
    if (updateDto.metadata) updateData.metadata = updateDto.metadata;
    if (updateDto.internalNotes !== undefined) updateData.internalNotes = updateDto.internalNotes;

    // Note: updatedBy and updatedByName fields are handled by TypeORM automatically

    await this.disciplineRepository.update(incidentId, updateData);

    const updatedIncident = await this.getDisciplineIncident(incidentId);
    this.logger.log(`Updated discipline incident ${incidentId}`);
    return updatedIncident;
  }

  /**
   * Delete a discipline incident
   */
  async deleteDisciplineIncident(incidentId: string): Promise<void> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    await this.disciplineRepository.remove(incident);
    this.logger.log(`Deleted discipline incident ${incidentId}`);
  }

  /**
   * Get discipline incidents by type
   */
  async getDisciplineIncidentsByType(
    studentId: string,
    disciplineType: string,
  ): Promise<StudentDiscipline[]> {
    return this.disciplineRepository.find({
      where: {
        studentId,
        disciplineType: disciplineType as any,
      },
      order: {
        incidentDate: 'DESC',
      },
    });
  }

  /**
   * Get discipline incidents by severity
   */
  async getDisciplineIncidentsBySeverity(
    studentId: string,
    severity: string,
  ): Promise<StudentDiscipline[]> {
    return this.disciplineRepository.find({
      where: {
        studentId,
        severity: severity as any,
      },
      order: {
        incidentDate: 'DESC',
      },
    });
  }

  /**
   * Get resolved discipline incidents
   */
  async getResolvedDisciplineIncidents(studentId: string): Promise<StudentDiscipline[]> {
    return this.disciplineRepository.find({
      where: {
        studentId,
        status: DisciplineStatus.RESOLVED,
      },
      order: {
        incidentDate: 'DESC',
      },
    });
  }

  /**
   * Get discipline incidents requiring follow-up
   */
  async getDisciplineIncidentsRequiringFollowUp(studentId: string): Promise<StudentDiscipline[]> {
    return this.disciplineRepository.find({
      where: {
        studentId,
        followUpRequired: true,
        status: DisciplineStatus.RESOLVED,
      },
      order: {
        followUpDate: 'ASC',
      },
    });
  }

  /**
   * Get discipline incidents under investigation
   */
  async getDisciplineIncidentsUnderInvestigation(studentId: string): Promise<StudentDiscipline[]> {
    return this.disciplineRepository.find({
      where: {
        studentId,
        status: DisciplineStatus.UNDER_INVESTIGATION,
      },
      order: {
        incidentDate: 'DESC',
      },
    });
  }

  /**
   * Search discipline incidents
   */
  async searchDisciplineIncidents(
    studentId: string,
    searchTerm: string,
  ): Promise<StudentDiscipline[]> {
    const queryBuilder = this.disciplineRepository
      .createQueryBuilder('discipline')
      .where('discipline.studentId = :studentId', { studentId })
      .andWhere(
        '(discipline.incidentDescription ILIKE :searchTerm OR discipline.incidentLocation ILIKE :searchTerm OR discipline.actionDescription ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('discipline.incidentDate', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Start investigation for a discipline incident
   */
  async startInvestigation(
    incidentId: string,
    investigatorId: string,
    investigatorName: string,
  ): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    if (incident.status !== DisciplineStatus.REPORTED) {
      throw new BadRequestException('Investigation can only be started for reported incidents');
    }

    await this.disciplineRepository.update(incidentId, {
      status: DisciplineStatus.UNDER_INVESTIGATION,
      investigatorId,
      investigatorName,
      investigationStartDate: new Date(),
    });

    const updatedIncident = await this.getDisciplineIncident(incidentId);
    this.logger.log(`Started investigation for discipline incident ${incidentId}`);
    return updatedIncident;
  }

  /**
   * Complete investigation for a discipline incident
   */
  async completeInvestigation(
    incidentId: string,
    findings: string,
    recommendedAction?: DisciplineAction,
  ): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    if (incident.status !== DisciplineStatus.UNDER_INVESTIGATION) {
      throw new BadRequestException('Only incidents under investigation can be completed');
    }

    await this.disciplineRepository.update(incidentId, {
      investigationFindings: findings,
      investigationEndDate: new Date(),
      disciplineAction: recommendedAction,
    });

    const updatedIncident = await this.getDisciplineIncident(incidentId);
    this.logger.log(`Completed investigation for discipline incident ${incidentId}`);
    return updatedIncident;
  }

  /**
   * Resolve a discipline incident
   */
  async resolveDisciplineIncident(
    incidentId: string,
    resolutionSummary: string,
    lessonsLearned?: string,
  ): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    await this.disciplineRepository.update(incidentId, {
      status: DisciplineStatus.RESOLVED,
      resolutionDate: new Date(),
      resolutionSummary,
      lessonsLearned,
    });

    const updatedIncident = await this.getDisciplineIncident(incidentId);
    this.logger.log(`Resolved discipline incident ${incidentId}`);
    return updatedIncident;
  }

  /**
   * Submit appeal for a discipline incident
   */
  async submitAppeal(
    incidentId: string,
    appealReason: string,
    appealHearingDate?: Date,
  ): Promise<StudentDiscipline> {
    const incident = await this.disciplineRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException(`Discipline incident with ID ${incidentId} not found`);
    }

    if (incident.status !== DisciplineStatus.RESOLVED) {
      throw new BadRequestException('Appeal can only be submitted for resolved incidents');
    }

    await this.disciplineRepository.update(incidentId, {
      status: DisciplineStatus.APPEALED,
      appealSubmitted: true,
      appealDate: new Date(),
      appealReason,
      appealHearingDate,
    });

    const updatedIncident = await this.getDisciplineIncident(incidentId);
    this.logger.log(`Submitted appeal for discipline incident ${incidentId}`);
    return updatedIncident;
  }

  /**
   * Get discipline statistics for a student
   */
  async getDisciplineStatistics(studentId: string): Promise<{
    totalIncidents: number;
    resolvedIncidents: number;
    pendingIncidents: number;
    underInvestigation: number;
    incidentsByType: Record<string, number>;
    incidentsBySeverity: Record<string, number>;
    recentIncidents: number;
    repeatedOffenses: number;
  }> {
    const [totalIncidents, resolvedIncidents, pendingIncidents, underInvestigation] = await Promise.all([
      this.disciplineRepository.count({ where: { studentId } }),
      this.disciplineRepository.count({
        where: { studentId, status: DisciplineStatus.RESOLVED },
      }),
      this.disciplineRepository.count({
        where: { studentId, status: DisciplineStatus.REPORTED },
      }),
      this.disciplineRepository.count({
        where: { studentId, status: DisciplineStatus.UNDER_INVESTIGATION },
      }),
    ]);

    // Get incidents by type
    const incidentsByType = await this.disciplineRepository
      .createQueryBuilder('discipline')
      .select('discipline.disciplineType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('discipline.studentId = :studentId', { studentId })
      .groupBy('discipline.disciplineType')
      .getRawMany();

    const typeStats = {};
    incidentsByType.forEach(item => {
      typeStats[item.type] = parseInt(item.count);
    });

    // Get incidents by severity
    const incidentsBySeverity = await this.disciplineRepository
      .createQueryBuilder('discipline')
      .select('discipline.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .where('discipline.studentId = :studentId', { studentId })
      .groupBy('discipline.severity')
      .getRawMany();

    const severityStats = {};
    incidentsBySeverity.forEach(item => {
      severityStats[item.severity] = parseInt(item.count);
    });

    // Get recent incidents (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentIncidents = await this.disciplineRepository.count({
      where: {
        studentId,
        incidentDate: sixMonthsAgo as any,
      },
    });

    // Get repeated offenses
    const repeatedOffenses = await this.disciplineRepository.count({
      where: {
        studentId,
        isRepeatedOffense: true,
      },
    });

    return {
      totalIncidents,
      resolvedIncidents,
      pendingIncidents,
      underInvestigation,
      incidentsByType: typeStats,
      incidentsBySeverity: severityStats,
      recentIncidents,
      repeatedOffenses,
    };
  }
}