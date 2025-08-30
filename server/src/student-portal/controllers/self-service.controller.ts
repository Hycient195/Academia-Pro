import { Controller, Get, Post, Put, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';
import { StudentAccessGuard } from '../guards/student-access.guard';
import { StudentPortalSelfServiceService } from '../services/self-service.service';

@ApiTags('Student Portal - Self Service')
@Controller('student-portal/self-service')
@UseGuards(StudentPortalGuard, StudentAccessGuard)
export class StudentPortalSelfServiceController {
  private readonly logger = new Logger(StudentPortalSelfServiceController.name);

  constructor(
    private readonly selfService: StudentPortalSelfServiceService,
  ) {}

  // ==================== PROFILE MANAGEMENT ====================

  @Get(':studentId/profile')
  @ApiOperation({
    summary: 'Get student profile',
    description: 'Returns the student\'s profile information for self-service management.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getProfile(@Param('studentId') studentId: string) {
    this.logger.log(`Getting profile for student ${studentId}`);
    return this.selfService.getProfile(studentId);
  }

  @Put(':studentId/profile')
  @ApiOperation({
    summary: 'Update student profile',
    description: 'Update student profile information (limited fields for self-service).',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Profile update data',
    schema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          description: 'Phone number',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
          },
        },
        emergencyContact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            relationship: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        preferences: {
          type: 'object',
          properties: {
            language: { type: 'string' },
            timezone: { type: 'string' },
            notifications: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Param('studentId') studentId: string,
    @Body() profileData: any,
  ) {
    this.logger.log(`Updating profile for student ${studentId}`);
    return this.selfService.updateProfile(studentId, profileData);
  }

  // ==================== LEAVE MANAGEMENT ====================

  @Get(':studentId/leave-requests')
  @ApiOperation({
    summary: 'Get leave requests',
    description: 'Returns the student\'s leave request history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  async getLeaveRequests(@Param('studentId') studentId: string) {
    this.logger.log(`Getting leave requests for student ${studentId}`);
    return this.selfService.getLeaveRequests(studentId);
  }

  @Post(':studentId/leave-requests')
  @ApiOperation({
    summary: 'Submit leave request',
    description: 'Submit a new leave request for approval.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Leave request data',
    schema: {
      type: 'object',
      required: ['leaveType', 'startDate', 'endDate', 'reason'],
      properties: {
        leaveType: {
          type: 'string',
          enum: ['sick', 'personal', 'family', 'other'],
          description: 'Type of leave',
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Leave start date',
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Leave end date',
        },
        reason: {
          type: 'string',
          description: 'Reason for leave',
        },
        contactDuringLeave: {
          type: 'object',
          properties: {
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Supporting document URLs',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Leave request submitted successfully',
  })
  async submitLeaveRequest(
    @Param('studentId') studentId: string,
    @Body() leaveData: {
      leaveType: 'sick' | 'personal' | 'family' | 'other';
      startDate: Date;
      endDate: Date;
      reason: string;
      contactDuringLeave?: {
        phone?: string;
        address?: string;
      };
      attachments?: string[];
    },
  ) {
    this.logger.log(`Submitting leave request for student ${studentId}`);
    return this.selfService.submitLeaveRequest(studentId, leaveData);
  }

  @Get(':studentId/leave-requests/:requestId')
  @ApiOperation({
    summary: 'Get leave request details',
    description: 'Returns detailed information about a specific leave request.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'requestId',
    description: 'Unique identifier of the leave request',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request details retrieved successfully',
  })
  async getLeaveRequestDetails(
    @Param('studentId') studentId: string,
    @Param('requestId') requestId: string,
  ) {
    this.logger.log(`Getting leave request ${requestId} for student ${studentId}`);
    return this.selfService.getLeaveRequestDetails(studentId, requestId);
  }

  // ==================== DOCUMENT REQUESTS ====================

  @Get(':studentId/documents')
  @ApiOperation({
    summary: 'Get document requests',
    description: 'Returns the student\'s document request history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Document requests retrieved successfully',
  })
  async getDocumentRequests(@Param('studentId') studentId: string) {
    this.logger.log(`Getting document requests for student ${studentId}`);
    return this.selfService.getDocumentRequests(studentId);
  }

  @Post(':studentId/documents/request')
  @ApiOperation({
    summary: 'Request document',
    description: 'Request official documents like transcripts, certificates, etc.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Document request data',
    schema: {
      type: 'object',
      required: ['documentType', 'purpose'],
      properties: {
        documentType: {
          type: 'string',
          enum: ['transcript', 'certificate', 'marksheet', 'bonafide', 'other'],
          description: 'Type of document requested',
        },
        academicYear: {
          type: 'string',
          description: 'Academic year for the document',
        },
        purpose: {
          type: 'string',
          description: 'Purpose of requesting the document',
        },
        copies: {
          type: 'number',
          description: 'Number of copies required',
          default: 1,
        },
        deliveryMethod: {
          type: 'string',
          enum: ['pickup', 'email', 'postal'],
          description: 'Preferred delivery method',
        },
        urgent: {
          type: 'boolean',
          description: 'Mark as urgent request',
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document request submitted successfully',
  })
  async requestDocument(
    @Param('studentId') studentId: string,
    @Body() requestData: {
      documentType: 'transcript' | 'certificate' | 'marksheet' | 'bonafide' | 'other';
      academicYear?: string;
      purpose: string;
      copies?: number;
      deliveryMethod?: 'pickup' | 'email' | 'postal';
      urgent?: boolean;
    },
  ) {
    this.logger.log(`Requesting document for student ${studentId}`);
    return this.selfService.requestDocument(studentId, requestData);
  }

  // ==================== PASSWORD MANAGEMENT ====================

  @Post(':studentId/change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change the student\'s portal password.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Password change data',
    schema: {
      type: 'object',
      required: ['currentPassword', 'newPassword', 'confirmPassword'],
      properties: {
        currentPassword: {
          type: 'string',
          description: 'Current password',
        },
        newPassword: {
          type: 'string',
          description: 'New password',
          minLength: 8,
        },
        confirmPassword: {
          type: 'string',
          description: 'Confirm new password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Param('studentId') studentId: string,
    @Body() passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    this.logger.log(`Changing password for student ${studentId}`);
    return this.selfService.changePassword(studentId, passwordData);
  }

  // ==================== SERVICE REQUESTS ====================

  @Get(':studentId/service-requests')
  @ApiOperation({
    summary: 'Get service requests',
    description: 'Returns the student\'s service request history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Service requests retrieved successfully',
  })
  async getServiceRequests(@Param('studentId') studentId: string) {
    this.logger.log(`Getting service requests for student ${studentId}`);
    return this.selfService.getServiceRequests(studentId);
  }

  @Post(':studentId/service-requests')
  @ApiOperation({
    summary: 'Submit service request',
    description: 'Submit a general service request (IT support, facility issues, etc.).',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiBody({
    description: 'Service request data',
    schema: {
      type: 'object',
      required: ['category', 'subject', 'description'],
      properties: {
        category: {
          type: 'string',
          enum: ['it_support', 'facility', 'academic', 'administrative', 'other'],
          description: 'Service request category',
        },
        subject: {
          type: 'string',
          description: 'Request subject',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the request',
        },
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'urgent'],
          description: 'Request priority',
          default: 'normal',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Supporting file URLs',
        },
        preferredContactMethod: {
          type: 'string',
          enum: ['email', 'phone', 'portal'],
          description: 'Preferred contact method for updates',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service request submitted successfully',
  })
  async submitServiceRequest(
    @Param('studentId') studentId: string,
    @Body() requestData: {
      category: 'it_support' | 'facility' | 'academic' | 'administrative' | 'other';
      subject: string;
      description: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      attachments?: string[];
      preferredContactMethod?: 'email' | 'phone' | 'portal';
    },
  ) {
    this.logger.log(`Submitting service request for student ${studentId}`);
    return this.selfService.submitServiceRequest(studentId, requestData);
  }
}