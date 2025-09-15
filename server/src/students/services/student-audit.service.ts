import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAuditLog, AuditAction, AuditEntityType, AuditSeverity } from '../entities/student-audit-log.entity';
import { Student } from '../student.entity';
import { AuditConfigService } from '../../common/audit/audit.config';

export interface StudentAuditData {
  studentId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  userId: string;
  userName: string;
  userRole: string;
  userDepartment?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  changeDescription: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceInfo?: any;
  locationInfo?: any;
  academicYear?: string;
  gradeLevel?: string;
  section?: string;
  schoolId?: string;
  isConfidential?: boolean;
  requiresParentConsent?: boolean;
  parentConsentObtained?: boolean;
  gdprCompliant?: boolean;
  dataRetentionPeriod?: number;
  auditBatchId?: string;
  relatedAuditIds?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  internalNotes?: string;
  externalNotes?: string;
  correlationId?: string;
  responseTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  queryExecutionTime?: number;
  anomalyScore?: number;
  isAnomaly?: boolean;
  anomalyType?: string;
  anomalyReason?: string;
  complianceStatus?: string;
  dataRetentionPolicy?: string;
  businessRulesViolated?: string[];
  complianceIssues?: string[];
  riskAssessment?: {
    riskLevel: AuditSeverity;
    riskFactors: string[];
    mitigationActions: string[];
    reviewRequired: boolean;
  };
}

@Injectable()
export class StudentAuditService {
  private readonly logger = new Logger(StudentAuditService.name);

  constructor(
    @InjectRepository(StudentAuditLog)
    private readonly studentAuditLogRepository: Repository<StudentAuditLog>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly auditConfig: AuditConfigService,
  ) {}

  /**
   * Log a student audit event
   */
  async logStudentActivity(data: StudentAuditData): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedData = this.sanitizeAuditData(data);

      // Get student context if not provided
      const enrichedData = await this.enrichWithStudentContext(sanitizedData);

      // Create audit log entry
      const auditLog = this.studentAuditLogRepository.create({
        studentId: enrichedData.studentId,
        action: enrichedData.action,
        entityType: enrichedData.entityType,
        entityId: enrichedData.entityId,
        entityName: enrichedData.entityName,
        severity: this.determineSeverity(enrichedData),
        userId: enrichedData.userId,
        userName: enrichedData.userName,
        userRole: enrichedData.userRole,
        userDepartment: enrichedData.userDepartment,
        oldValues: enrichedData.oldValues,
        newValues: enrichedData.newValues,
        changedFields: enrichedData.changedFields,
        changeDescription: enrichedData.changeDescription,
        ipAddress: enrichedData.ipAddress,
        userAgent: enrichedData.userAgent,
        sessionId: enrichedData.sessionId,
        deviceInfo: enrichedData.deviceInfo,
        locationInfo: enrichedData.locationInfo,
        academicYear: enrichedData.academicYear,
        gradeLevel: enrichedData.gradeLevel,
        section: enrichedData.section,
        schoolId: enrichedData.schoolId,
        isConfidential: enrichedData.isConfidential,
        requiresParentConsent: enrichedData.requiresParentConsent,
        parentConsentObtained: enrichedData.parentConsentObtained,
        gdprCompliant: enrichedData.gdprCompliant ?? true,
        dataRetentionPeriod: enrichedData.dataRetentionPeriod,
        auditBatchId: enrichedData.auditBatchId,
        relatedAuditIds: enrichedData.relatedAuditIds,
        tags: enrichedData.tags,
        metadata: enrichedData.metadata,
        internalNotes: enrichedData.internalNotes,
        externalNotes: enrichedData.externalNotes,
        correlationId: enrichedData.correlationId,
        responseTime: enrichedData.responseTime,
        memoryUsage: enrichedData.memoryUsage,
        cpuUsage: enrichedData.cpuUsage,
        queryExecutionTime: enrichedData.queryExecutionTime,
        anomalyScore: enrichedData.anomalyScore,
        isAnomaly: enrichedData.isAnomaly,
        anomalyType: enrichedData.anomalyType,
        anomalyReason: enrichedData.anomalyReason,
        complianceStatus: enrichedData.complianceStatus,
        dataRetentionPolicy: enrichedData.dataRetentionPolicy,
        businessRulesViolated: enrichedData.businessRulesViolated,
        complianceIssues: enrichedData.complianceIssues,
        riskAssessment: enrichedData.riskAssessment,
      });

      await this.studentAuditLogRepository.save(auditLog);

      this.logger.debug(`Student audit logged: ${enrichedData.action} on ${enrichedData.entityType} by ${enrichedData.userName}`);

    } catch (error) {
      this.logger.error(`Failed to log student audit event: ${error.message}`, error.stack);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log student creation
   */
  async logStudentCreated(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    studentData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logStudentActivity({
      studentId,
      action: AuditAction.CREATE,
      entityType: AuditEntityType.STUDENT_PROFILE,
      entityId: studentId,
      entityName: `${studentData.firstName} ${studentData.lastName}`,
      userId,
      userName,
      userRole,
      newValues: studentData,
      changeDescription: 'Student profile created',
      ipAddress,
      userAgent,
      academicYear: studentData.academicYear,
      gradeLevel: studentData.currentGrade,
      section: studentData.currentSection,
      schoolId: studentData.schoolId,
      isConfidential: false,
      requiresParentConsent: false,
      gdprCompliant: true,
      tags: ['student_creation', 'enrollment'],
      metadata: {
        enrollmentType: studentData.enrollmentType,
        admissionDate: studentData.admissionDate,
      },
    });
  }

  /**
    * Log student profile update
    */
   async logStudentUpdated(
     studentId: string,
     userId: string,
     userName: string,
     userRole: string,
     oldValues: Record<string, any>,
     newValues: Record<string, any>,
     changedFields: string[],
     reason?: string,
     ipAddress?: string,
     userAgent?: string,
   ): Promise<void> {
     const isSensitive = this.containsSensitiveFields(changedFields);

     await this.logStudentActivity({
       studentId,
       action: AuditAction.UPDATE,
       entityType: AuditEntityType.STUDENT_PROFILE,
       entityId: studentId,
       userId,
       userName,
       userRole,
       oldValues,
       newValues,
       changedFields,
       changeDescription: `Student profile updated: ${changedFields.join(', ')}`,
       ipAddress,
       userAgent,
       isConfidential: isSensitive,
       requiresParentConsent: isSensitive,
       gdprCompliant: true,
       tags: ['student_update', ...(isSensitive ? ['sensitive_data'] : [])],
       metadata: {
         fieldCount: changedFields.length,
         hasSensitiveData: isSensitive,
         updateReason: reason,
       },
     });
   }

  /**
   * Log student transfer
   */
  async logStudentTransfer(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    oldGrade: string,
    oldSection: string,
    newGrade: string,
    newSection: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logStudentActivity({
      studentId,
      action: AuditAction.TRANSFER,
      entityType: AuditEntityType.STUDENT_TRANSFER,
      entityId: studentId,
      userId,
      userName,
      userRole,
      oldValues: { currentGrade: oldGrade, currentSection: oldSection },
      newValues: { currentGrade: newGrade, currentSection: newSection },
      changedFields: ['currentGrade', 'currentSection'],
      changeDescription: `Student transferred from ${oldGrade}-${oldSection} to ${newGrade}-${newSection}`,
      ipAddress,
      userAgent,
      gradeLevel: newGrade,
      section: newSection,
      tags: ['student_transfer', 'academic_change'],
      metadata: {
        transferReason: reason,
        oldGrade,
        oldSection,
        newGrade,
        newSection,
      },
    });
  }

  /**
   * Log student graduation
   */
  async logStudentGraduated(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    graduationDate?: Date,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logStudentActivity({
      studentId,
      action: AuditAction.GRADUATE,
      entityType: AuditEntityType.STUDENT_PROFILE,
      entityId: studentId,
      userId,
      userName,
      userRole,
      oldValues: { status: 'active' },
      newValues: { status: 'graduated', graduationDate },
      changedFields: ['status', 'graduationDate'],
      changeDescription: 'Student graduated',
      ipAddress,
      userAgent,
      tags: ['graduation', 'status_change'],
      metadata: {
        graduationDate: graduationDate?.toISOString(),
      },
    });
  }

  /**
   * Log medical information access/update
   */
  async logMedicalInfoAccess(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'view' | 'update',
    medicalData?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logStudentActivity({
      studentId,
      action: action === 'view' ? AuditAction.VIEW : AuditAction.UPDATE,
      entityType: AuditEntityType.STUDENT_MEDICAL_RECORD,
      entityId: studentId,
      userId,
      userName,
      userRole,
      newValues: action === 'update' ? medicalData : undefined,
      changeDescription: `Medical information ${action}ed`,
      ipAddress,
      userAgent,
      isConfidential: true,
      requiresParentConsent: true,
      gdprCompliant: true,
      tags: ['medical_info', 'sensitive_data', 'health_record'],
      metadata: {
        accessType: action,
        hasMedicalData: !!medicalData,
      },
    });
  }

  /**
   * Log disciplinary action
   */
  async logDisciplinaryAction(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'create' | 'update' | 'resolve',
    disciplineData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditAction = action === 'create' ? AuditAction.CREATE :
                      action === 'update' ? AuditAction.UPDATE : AuditAction.UPDATE;

    await this.logStudentActivity({
      studentId,
      action: auditAction,
      entityType: AuditEntityType.STUDENT_DISCIPLINE,
      entityId: disciplineData.id || studentId,
      userId,
      userName,
      userRole,
      newValues: disciplineData,
      changeDescription: `Disciplinary ${action}: ${disciplineData.type || 'action'}`,
      ipAddress,
      userAgent,
      isConfidential: true,
      requiresParentConsent: true,
      gdprCompliant: true,
      tags: ['discipline', 'behavior', 'incident'],
      metadata: {
        disciplineType: disciplineData.type,
        severity: disciplineData.severity,
        action,
      },
    });
  }

  /**
   * Log document access/upload
   */
  async logDocumentActivity(
    studentId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'upload' | 'view' | 'download' | 'delete',
    documentData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditAction = action === 'upload' ? AuditAction.CREATE :
                      action === 'delete' ? AuditAction.DELETE :
                      AuditAction.VIEW;

    await this.logStudentActivity({
      studentId,
      action: auditAction,
      entityType: AuditEntityType.STUDENT_DOCUMENT,
      entityId: documentData.id || studentId,
      entityName: documentData.name || documentData.filename,
      userId,
      userName,
      userRole,
      newValues: action === 'upload' ? documentData : undefined,
      changeDescription: `Document ${action}: ${documentData.name || documentData.filename}`,
      ipAddress,
      userAgent,
      isConfidential: documentData.isConfidential || false,
      gdprCompliant: true,
      tags: ['document', action],
      metadata: {
        documentType: documentData.type,
        fileSize: documentData.size,
        mimeType: documentData.mimeType,
        action,
      },
    });
  }

  /**
   * Log bulk operations
   */
  async logBulkOperation(
    userId: string,
    userName: string,
    userRole: string,
    operation: string,
    affectedStudents: string[],
    operationData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const batchId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log summary entry
    await this.logStudentActivity({
      studentId: affectedStudents[0], // Use first student as reference
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.STUDENT_PROFILE,
      entityId: batchId,
      userId,
      userName,
      userRole,
      changeDescription: `Bulk operation: ${operation} - ${affectedStudents.length} students affected`,
      ipAddress,
      userAgent,
      auditBatchId: batchId,
      tags: ['bulk_operation', operation.toLowerCase()],
      metadata: {
        operation,
        affectedCount: affectedStudents.length,
        affectedStudents,
        ...operationData,
      },
    });

    // Log individual entries for each affected student
    for (const studentId of affectedStudents.slice(0, 10)) { // Limit to first 10 for performance
      await this.logStudentActivity({
        studentId,
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.STUDENT_PROFILE,
        entityId: studentId,
        userId,
        userName,
        userRole,
        changeDescription: `Part of bulk operation: ${operation}`,
        ipAddress,
        userAgent,
        auditBatchId: batchId,
        relatedAuditIds: [batchId],
        tags: ['bulk_operation', operation.toLowerCase()],
        metadata: {
          operation,
          isBulkOperation: true,
        },
      });
    }
  }

  /**
   * Get audit trail for a student
   */
  async getStudentAuditTrail(
    studentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      action?: AuditAction;
      entityType?: AuditEntityType;
      limit?: number;
      offset?: number;
    },
  ): Promise<[StudentAuditLog[], number]> {
    const queryBuilder = this.studentAuditLogRepository.createQueryBuilder('audit')
      .where('audit.studentId = :studentId', { studentId });

    if (options?.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options?.action) {
      queryBuilder.andWhere('audit.action = :action', { action: options.action });
    }

    if (options?.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType: options.entityType });
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * Sanitize sensitive audit data
   */
  private sanitizeAuditData(data: StudentAuditData): StudentAuditData {
    const sanitized = { ...data };

    // Sanitize old values
    if (sanitized.oldValues) {
      sanitized.oldValues = this.auditConfig.sanitizeDetails(sanitized.oldValues);
    }

    // Sanitize new values
    if (sanitized.newValues) {
      sanitized.newValues = this.auditConfig.sanitizeDetails(sanitized.newValues);
    }

    // Sanitize metadata
    if (sanitized.metadata) {
      sanitized.metadata = this.auditConfig.sanitizeDetails(sanitized.metadata);
    }

    return sanitized;
  }

  /**
   * Enrich audit data with student context
   */
  private async enrichWithStudentContext(data: StudentAuditData): Promise<StudentAuditData> {
    if (data.academicYear && data.gradeLevel && data.section && data.schoolId) {
      return data; // Already has context
    }

    try {
      const student = await this.studentRepository.findOne({
        where: { id: data.studentId },
        select: ['currentGrade', 'currentSection', 'schoolId'],
      });

      if (student) {
        return {
          ...data,
          gradeLevel: data.gradeLevel || student.currentGrade,
          section: data.section || student.currentSection,
          schoolId: data.schoolId || student.schoolId,
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to enrich audit data with student context: ${error.message}`);
    }

    return data;
  }

  /**
   * Determine audit severity based on data
   */
  private determineSeverity(data: StudentAuditData): AuditSeverity {
    // High severity for sensitive operations
    if (data.isConfidential || data.entityType === AuditEntityType.STUDENT_MEDICAL_RECORD) {
      return AuditSeverity.HIGH;
    }

    // Medium severity for profile changes
    if (data.entityType === AuditEntityType.STUDENT_PROFILE && data.action === AuditAction.UPDATE) {
      return AuditSeverity.MEDIUM;
    }

    // High severity for deletions
    if (data.action === AuditAction.DELETE) {
      return AuditSeverity.HIGH;
    }

    return AuditSeverity.LOW;
  }

  /**
   * Check if changed fields contain sensitive information
   */
  private containsSensitiveFields(fields: string[]): boolean {
    const sensitiveFields = [
      'medicalInfo',
      'emergencyContact',
      'parentContact',
      'address',
      'phone',
      'email',
      'dateOfBirth',
      'bloodGroup',
      'discipline',
      'disciplinaryRecords',
    ];

    return fields.some(field =>
      sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive.toLowerCase()))
    );
  }
}