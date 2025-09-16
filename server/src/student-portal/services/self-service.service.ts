import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentSelfServiceRequest } from '../entities/student-self-service-request.entity';
import { StudentActivityLog, StudentActivityType } from '../entities/student-activity-log.entity';

export interface ProfileDto {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phone?: string;
    email: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  academicInfo: {
    grade: string;
    section: string;
    rollNumber: string;
    admissionNumber: string;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}

export interface LeaveRequestDto {
  id: string;
  leaveType: 'sick' | 'personal' | 'family' | 'other';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  comments?: string;
  attachments?: string[];
}

export interface DocumentRequestDto {
  id: string;
  documentType: 'transcript' | 'certificate' | 'marksheet' | 'bonafide' | 'other';
  academicYear?: string;
  purpose: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedDate: Date;
  completedDate?: Date;
  copies: number;
  deliveryMethod: 'pickup' | 'email' | 'postal';
  urgent: boolean;
  fee?: number;
  downloadUrl?: string;
}

@Injectable()
export class StudentPortalSelfServiceService {
  private readonly logger = new Logger(StudentPortalSelfServiceService.name);

  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
    @InjectRepository(StudentSelfServiceRequest)
    private selfServiceRequestRepository: Repository<StudentSelfServiceRequest>,
    @InjectRepository(StudentActivityLog)
    private activityLogRepository: Repository<StudentActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getProfile(studentId: string): Promise<ProfileDto> {
    // Get portal access with student relation
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student profile not found');
    }

    const student = portalAccess.student;

    return {
      personalInfo: {
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        email: student.email,
      },
      address: {
        street: student.address?.street,
        city: student.address?.city,
        state: student.address?.state,
        zipCode: student.address?.postalCode,
        country: student.address?.country,
      },
      emergencyContact: {
        name: student.medicalInfo?.emergencyContact
          ? `${student.medicalInfo.emergencyContact.firstName} ${student.medicalInfo.emergencyContact.lastName}`
          : undefined,
        relationship: student.medicalInfo?.emergencyContact?.relation,
        phone: student.medicalInfo?.emergencyContact?.phone,
      },
      academicInfo: {
        grade: portalAccess.gradeLevel,
        section: portalAccess.section || '',
        rollNumber: portalAccess.rollNumber || '',
        admissionNumber: student.admissionNumber,
      },
      preferences: {
        language: 'en', // TODO: Get from student preferences
        timezone: 'UTC', // TODO: Get from student preferences
        notifications: true, // TODO: Get from student preferences
      },
    };
  }

  async updateProfile(studentId: string, profileData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student profile not found');
    }

    // TODO: Implement profile update logic
    // This would update the student entity with allowed fields

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.PROFILE_UPDATE,
      activityDescription: 'Updated student profile',
      resourceType: 'profile',
      metadata: { updatedFields: Object.keys(profileData) },
    } as any);

    return {
      success: true,
      message: 'Profile updated successfully',
      updatedAt: new Date(),
    };
  }

  async getLeaveRequests(studentId: string): Promise<LeaveRequestDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement leave request retrieval
    // This would query leave request entities
    return [
      {
        id: 'leave-001',
        leaveType: 'sick',
        startDate: new Date(),
        endDate: new Date(),
        reason: 'Medical appointment',
        status: 'approved',
        appliedDate: new Date(),
        approvedDate: new Date(),
        approvedBy: 'Principal',
      },
    ];
  }

  async submitLeaveRequest(studentId: string, leaveData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement leave request creation
    // This would create a leave request entity

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.SELF_SERVICE_REQUEST,
      activityDescription: `Submitted ${leaveData.leaveType} leave request`,
      resourceType: 'leave_request',
      metadata: {
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
      },
    } as any);

    return {
      id: 'leave-' + Date.now(),
      status: 'submitted',
      submittedAt: new Date(),
      message: 'Leave request submitted successfully',
    };
  }

  async getLeaveRequestDetails(studentId: string, requestId: string): Promise<LeaveRequestDto | null> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return null;
    }

    // TODO: Implement leave request details retrieval
    return {
      id: requestId,
      leaveType: 'sick',
      startDate: new Date(),
      endDate: new Date(),
      reason: 'Medical appointment',
      status: 'approved',
      appliedDate: new Date(),
      approvedDate: new Date(),
      approvedBy: 'Principal',
      comments: 'Approved for medical reasons',
    };
  }

  async getDocumentRequests(studentId: string): Promise<DocumentRequestDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement document request retrieval
    return [
      {
        id: 'doc-001',
        documentType: 'transcript',
        academicYear: '2024-2025',
        purpose: 'University application',
        status: 'completed',
        requestedDate: new Date(),
        completedDate: new Date(),
        copies: 2,
        deliveryMethod: 'email',
        urgent: false,
        downloadUrl: '/documents/transcript-001.pdf',
      },
    ];
  }

  async requestDocument(studentId: string, requestData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement document request creation
    // This would create a document request entity

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.SELF_SERVICE_REQUEST,
      activityDescription: `Requested ${requestData.documentType} document`,
      resourceType: 'document_request',
      metadata: {
        documentType: requestData.documentType,
        purpose: requestData.purpose,
        urgent: requestData.urgent,
      },
    } as any);

    return {
      id: 'doc-' + Date.now(),
      status: 'submitted',
      submittedAt: new Date(),
      message: 'Document request submitted successfully',
      estimatedCompletion: '3-5 business days',
    };
  }

  async changePassword(studentId: string, passwordData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement password change logic
    // This would validate current password and update to new password

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.PASSWORD_CHANGE,
      activityDescription: 'Changed portal password',
      resourceType: 'security',
      metadata: { success: true },
    } as any);

    return {
      success: true,
      message: 'Password changed successfully',
      changedAt: new Date(),
    };
  }

  async getServiceRequests(studentId: string): Promise<any[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // TODO: Implement service request retrieval
    return [
      {
        id: 'service-001',
        category: 'it_support',
        subject: 'WiFi connectivity issue',
        description: 'Unable to connect to school WiFi',
        status: 'resolved',
        submittedDate: new Date(),
        resolvedDate: new Date(),
        priority: 'normal',
      },
    ];
  }

  async submitServiceRequest(studentId: string, requestData: any): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement service request creation
    // This would create a service request entity

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.SELF_SERVICE_REQUEST,
      activityDescription: `Submitted ${requestData.category} service request`,
      resourceType: 'service_request',
      metadata: {
        category: requestData.category,
        subject: requestData.subject,
        priority: requestData.priority,
      },
    } as any);

    return {
      id: 'service-' + Date.now(),
      status: 'submitted',
      submittedAt: new Date(),
      message: 'Service request submitted successfully',
      estimatedResponse: '24-48 hours',
    };
  }
}