import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from '../student.entity';
import { StudentTransfer, TransferType, TransferStatus, TransferReason } from '../entities/student-transfer.entity';
import { StudentDocument, DocumentStatus } from '../entities/student-document.entity';
import { StudentAuditLog, AuditAction, AuditEntityType } from '../entities/student-audit-log.entity';

export interface TransferRequestDto {
  studentId: string;
  transferType: TransferType;
  transferReason: TransferReason;
  reasonDetails?: string;
  toSchoolId?: string;
  toSchoolName?: string;
  toGrade?: string;
  toSection?: string;
  applicationDate: Date;
  transferDate: Date;
  documents: any[];
  specialConsiderations?: string;
  parentConsent?: boolean;
}

@Injectable()
export class StudentTransferService {
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

  async createTransferRequest(transferData: TransferRequestDto, schoolId: string, userId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify student exists and belongs to the school
      const student = await queryRunner.manager.findOne(Student, {
        where: { id: transferData.studentId, schoolId },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // Check if student already has a pending transfer
      const existingTransfer = await queryRunner.manager.findOne(StudentTransfer, {
        where: {
          studentId: transferData.studentId,
          status: TransferStatus.INITIATED,
        },
      });

      if (existingTransfer) {
        throw new ConflictException('Student already has a pending transfer request');
      }

      // Create transfer record
      const transfer = queryRunner.manager.create(StudentTransfer, {
        studentId: transferData.studentId,
        transferType: transferData.transferType,
        transferReason: transferData.transferReason,
        reasonDetails: transferData.reasonDetails,
        fromSchoolId: schoolId,
        fromSchoolName: 'Current School', // TODO: Get actual school name
        fromGrade: student.currentGrade,
        fromSection: student.currentSection,
        toSchoolId: transferData.toSchoolId,
        toSchoolName: transferData.toSchoolName,
        toGrade: transferData.toGrade,
        toSection: transferData.toSection,
        applicationDate: transferData.applicationDate,
        transferDate: transferData.transferDate,
        specialConsiderations: transferData.specialConsiderations,
        academicYear: new Date().getFullYear().toString(),
        initiatedBy: userId,
        initiatedByName: 'System', // TODO: Get actual user name
      });

      const savedTransfer = await queryRunner.manager.save(StudentTransfer, transfer);

      // Create supporting documents if provided
      if (transferData.documents && transferData.documents.length > 0) {
        const documents = transferData.documents.map(doc =>
          queryRunner.manager.create(StudentDocument, {
            studentId: transferData.studentId,
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
        transferData.studentId,
        AuditAction.CREATE,
        AuditEntityType.STUDENT_TRANSFER,
        { transferData },
        userId,
        'Transfer request created'
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        transfer: savedTransfer,
        message: 'Transfer request created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransferRequests(schoolId: string, query: any): Promise<any> {
    const { status, type, page = 1, limit = 10 } = query;

    const queryBuilder = this.transferRepository.createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.student', 'student')
      .where('transfer.fromSchoolId = :schoolId', { schoolId })
      .orderBy('transfer.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('transfer.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('transfer.transferType = :type', { type });
    }

    const [transfers, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      transfers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransferRequest(requestId: string, schoolId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
      relations: ['student'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    return transfer;
  }

  async reviewTransferRequest(requestId: string, reviewData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Update transfer with review data
    const updateData: any = { ...reviewData };
    await this.transferRepository.update(requestId, updateData);

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_TRANSFER,
      { reviewData },
      userId,
      'Transfer request reviewed'
    );

    return {
      success: true,
      message: 'Transfer request reviewed successfully',
    };
  }

  async approveTransferRequest(requestId: string, approvalData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
      relations: ['student'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Update transfer status
    await this.transferRepository.update(requestId, {
      status: TransferStatus.APPROVED,
      approvalDate: new Date(),
      approvalNotes: approvalData.notes,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      AuditAction.APPROVE,
      AuditEntityType.STUDENT_TRANSFER,
      { approvalData },
      userId,
      'Transfer request approved'
    );

    return {
      success: true,
      message: 'Transfer request approved successfully',
    };
  }

  async rejectTransferRequest(requestId: string, rejectionData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Update transfer status
    await this.transferRepository.update(requestId, {
      status: TransferStatus.REJECTED,
      rejectionReason: rejectionData.reason,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      AuditAction.REJECT,
      AuditEntityType.STUDENT_TRANSFER,
      { rejectionData },
      userId,
      'Transfer request rejected'
    );

    return {
      success: true,
      message: 'Transfer request rejected successfully',
    };
  }

  async submitTransferAppeal(requestId: string, appealData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    if (transfer.status !== TransferStatus.REJECTED) {
      throw new BadRequestException('Only rejected transfers can be appealed');
    }

    // Mark appeal as submitted
    await this.transferRepository.update(requestId, {
      appealSubmitted: true,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_TRANSFER,
      { appealData },
      userId,
      'Transfer appeal submitted'
    );

    return {
      success: true,
      message: 'Transfer appeal submitted successfully',
    };
  }

  async reviewTransferAppeal(requestId: string, appealReviewData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    if (!transfer.appealSubmitted) {
      throw new BadRequestException('No appeal submitted for this transfer');
    }

    // Update transfer with appeal review
    const decisionIsUpheld = appealReviewData.decision === 'upheld';
    await this.transferRepository.update(requestId, {
      appealDecision: appealReviewData.decision,
      appealDecisionDate: new Date(),
      appealNotes: appealReviewData.notes,
      status: decisionIsUpheld ? TransferStatus.APPROVED : TransferStatus.REJECTED,
      updatedBy: userId,
    });

    // Log audit event (use APPROVE when appeal upheld, REJECT when denied)
    const logAction = decisionIsUpheld ? AuditAction.APPROVE : AuditAction.REJECT;
    const description = decisionIsUpheld ? 'Transfer appeal reviewed - approved' : 'Transfer appeal reviewed - rejected';

    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      logAction,
      AuditEntityType.STUDENT_TRANSFER,
      { appealReviewData },
      userId,
      description
    );

    return {
      success: true,
      message: 'Transfer appeal reviewed successfully',
    };
  }

  async completeTransfer(requestId: string, completionData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
      relations: ['student'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException('Only approved transfers can be completed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer status
      await queryRunner.manager.update(StudentTransfer, requestId, {
        status: TransferStatus.COMPLETED,
        completionDate: new Date(),
        updatedBy: userId,
      });

      // Update student information if transferring to another school
      if (transfer.toSchoolId && transfer.toSchoolId !== schoolId) {
        await queryRunner.manager.update(Student, transfer.studentId, {
          schoolId: transfer.toSchoolId,
          currentGrade: transfer.toGrade,
          currentSection: transfer.toSection,
          updatedBy: userId,
        });
      }

      // Log audit event
      await this.logAuditEvent(
        queryRunner.manager,
        transfer.studentId,
        AuditAction.UPDATE,
        AuditEntityType.STUDENT_TRANSFER,
        { completionData },
        userId,
        'Transfer completed'
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Transfer completed successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransferStatistics(schoolId: string, academicYear?: string, month?: string): Promise<any> {
    // TODO: Implement comprehensive transfer statistics
    const totalTransfers = await this.transferRepository.count({
      where: { fromSchoolId: schoolId },
    });

    const approvedTransfers = await this.transferRepository.count({
      where: { fromSchoolId: schoolId, status: TransferStatus.APPROVED },
    });

    const rejectedTransfers = await this.transferRepository.count({
      where: { fromSchoolId: schoolId, status: TransferStatus.REJECTED },
    });

    const transferTypeStats = await this.transferRepository
      .createQueryBuilder('transfer')
      .select('transfer.transferType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('transfer.fromSchoolId = :schoolId', { schoolId })
      .groupBy('transfer.transferType')
      .getRawMany();

    return {
      totalTransfers,
      approvedTransfers,
      rejectedTransfers,
      pendingTransfers: totalTransfers - approvedTransfers - rejectedTransfers,
      transferTypeStats,
      academicYear: academicYear || new Date().getFullYear().toString(),
    };
  }

  async getTransferTypes(): Promise<any> {
    return {
      types: Object.values(TransferType),
      descriptions: {
        [TransferType.INTER_SCHOOL]: 'Transfer between schools',
        [TransferType.INTER_STATE]: 'Transfer between states',
        [TransferType.INTER_COUNTRY]: 'Transfer between countries',
        [TransferType.GRADE_PROMOTION]: 'Grade level promotion',
        [TransferType.STREAM_CHANGE]: 'Change of academic stream',
        [TransferType.BOARD_CHANGE]: 'Change of education board',
      },
    };
  }

  async getTransferReasons(): Promise<any> {
    return {
      reasons: Object.values(TransferReason),
      descriptions: {
        [TransferReason.PARENT_JOB_TRANSFER]: 'Parent job relocation',
        [TransferReason.FAMILY_RELOCATION]: 'Family relocation',
        [TransferReason.ACADEMIC_PERFORMANCE]: 'Academic performance reasons',
        [TransferReason.SCHOOL_FACILITIES]: 'School facilities',
        [TransferReason.FINANCIAL_REASONS]: 'Financial reasons',
        [TransferReason.HEALTH_CONCERNS]: 'Health concerns',
        [TransferReason.PERSONAL_REASONS]: 'Personal reasons',
        [TransferReason.OTHER]: 'Other reasons',
      },
    };
  }

  async bulkApproveTransfers(requestIds: string[], approvalData: any, schoolId: string, userId: string): Promise<any> {
    const results = {
      successful: [],
      failed: [],
      total: requestIds.length,
    };

    for (const requestId of requestIds) {
      try {
        const result = await this.approveTransferRequest(requestId, approvalData, schoolId, userId);
        results.successful.push({ requestId, result });
      } catch (error) {
        results.failed.push({
          requestId,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      results,
      message: `Bulk approval completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
    };
  }

  async getStudentTransferHistory(studentId: string, schoolId: string): Promise<any> {
    const transfers = await this.transferRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    return {
      studentId,
      transferHistory: transfers,
      totalTransfers: transfers.length,
    };
  }

  async uploadTransferDocuments(requestId: string, documentData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // TODO: Implement document upload logic
    // This would create StudentDocument records for transfer documents

    return {
      success: true,
      message: 'Transfer documents uploaded successfully',
    };
  }

  async getTransferDocuments(requestId: string, schoolId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // TODO: Implement document retrieval logic
    return {
      requestId,
      documents: [],
    };
  }

  async cancelTransferRequest(requestId: string, cancellationData: any, schoolId: string, userId: string): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { id: requestId, fromSchoolId: schoolId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed transfer');
    }

    await this.transferRepository.update(requestId, {
      status: TransferStatus.CANCELLED,
      updatedBy: userId,
    });

    // Log audit event
    await this.logAuditEvent(
      this.dataSource.manager,
      transfer.studentId,
      AuditAction.UPDATE,
      AuditEntityType.STUDENT_TRANSFER,
      { cancellationData },
      userId,
      'Transfer request cancelled'
    );

    return {
      success: true,
      message: 'Transfer request cancelled successfully',
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