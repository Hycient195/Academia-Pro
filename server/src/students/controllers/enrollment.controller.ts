import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentManagementGuard } from '../guards/student-management.guard';
import { StudentEnrollmentService } from '../services/enrollment.service';

@ApiTags('Student Management - Enrollment')
@ApiBearerAuth()
@Controller('students/enrollment')
@UseGuards(StudentManagementGuard)
export class StudentEnrollmentController {
  constructor(
    private readonly enrollmentService: StudentEnrollmentService,
  ) {}

  @Post('admission')
  @ApiOperation({ summary: 'Create new student admission' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Student admission created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid admission data' })
  async createAdmission(@Body() admissionData: any, @Request() req: any) {
    const { schoolId, userId } = req;
    return this.enrollmentService.createAdmission(admissionData, schoolId, userId);
  }

  @Post('bulk-admission')
  @ApiOperation({ summary: 'Create bulk student admissions' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Bulk admissions created successfully' })
  async createBulkAdmission(@Body() bulkData: any, @Request() req: any) {
    const { schoolId, userId } = req;
    return this.enrollmentService.createBulkAdmission(bulkData, schoolId, userId);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get admission applications' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getAdmissionApplications(
    @Request() req: any,
    @Query() query: any,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getAdmissionApplications(schoolId, query);
  }

  @Get('applications/:applicationId')
  @ApiOperation({ summary: 'Get admission application by ID' })
  @ApiParam({ name: 'applicationId', description: 'Admission application ID' })
  async getAdmissionApplication(
    @Param('applicationId') applicationId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getAdmissionApplication(applicationId, schoolId);
  }

  @Put('applications/:applicationId/review')
  @ApiOperation({ summary: 'Review admission application' })
  @ApiParam({ name: 'applicationId', description: 'Admission application ID' })
  async reviewAdmissionApplication(
    @Param('applicationId') applicationId: string,
    @Body() reviewData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.reviewAdmissionApplication(applicationId, reviewData, schoolId, userId);
  }

  @Post('applications/:applicationId/approve')
  @ApiOperation({ summary: 'Approve admission application' })
  @ApiParam({ name: 'applicationId', description: 'Admission application ID' })
  async approveAdmissionApplication(
    @Param('applicationId') applicationId: string,
    @Body() approvalData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.approveAdmissionApplication(applicationId, approvalData, schoolId, userId);
  }

  @Post('applications/:applicationId/reject')
  @ApiOperation({ summary: 'Reject admission application' })
  @ApiParam({ name: 'applicationId', description: 'Admission application ID' })
  async rejectAdmissionApplication(
    @Param('applicationId') applicationId: string,
    @Body() rejectionData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.rejectAdmissionApplication(applicationId, rejectionData, schoolId, userId);
  }

  @Post('enroll/:studentId')
  @ApiOperation({ summary: 'Enroll approved student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async enrollStudent(
    @Param('studentId') studentId: string,
    @Body() enrollmentData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.enrollStudent(studentId, enrollmentData, schoolId, userId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get student enrollments' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiQuery({ name: 'grade', required: false, description: 'Filter by grade' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by enrollment status' })
  async getEnrollments(
    @Request() req: any,
    @Query() query: any,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getEnrollments(schoolId, query);
  }

  @Get('enrollments/:enrollmentId')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  async getEnrollment(
    @Param('enrollmentId') enrollmentId: string,
    @Request() req: any,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getEnrollment(enrollmentId, schoolId);
  }

  @Put('enrollments/:enrollmentId')
  @ApiOperation({ summary: 'Update enrollment' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  async updateEnrollment(
    @Param('enrollmentId') enrollmentId: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.updateEnrollment(enrollmentId, updateData, schoolId, userId);
  }

  @Delete('enrollments/:enrollmentId')
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  async cancelEnrollment(
    @Param('enrollmentId') enrollmentId: string,
    @Body() cancellationData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.cancelEnrollment(enrollmentId, cancellationData, schoolId, userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get enrollment statistics' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Academic year for statistics' })
  async getEnrollmentStatistics(
    @Request() req: any,
    @Query('academicYear') academicYear?: string,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getEnrollmentStatistics(schoolId, academicYear);
  }

  @Post('waitlist')
  @ApiOperation({ summary: 'Add student to waitlist' })
  async addToWaitlist(@Body() waitlistData: any, @Request() req: any) {
    const { schoolId, userId } = req;
    return this.enrollmentService.addToWaitlist(waitlistData, schoolId, userId);
  }

  @Get('waitlist')
  @ApiOperation({ summary: 'Get waitlist' })
  @ApiQuery({ name: 'grade', required: false, description: 'Filter by grade' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  async getWaitlist(
    @Request() req: any,
    @Query() query: any,
  ) {
    const { schoolId } = req;
    return this.enrollmentService.getWaitlist(schoolId, query);
  }

  @Post('waitlist/:waitlistId/offer')
  @ApiOperation({ summary: 'Offer admission from waitlist' })
  @ApiParam({ name: 'waitlistId', description: 'Waitlist entry ID' })
  async offerFromWaitlist(
    @Param('waitlistId') waitlistId: string,
    @Body() offerData: any,
    @Request() req: any,
  ) {
    const { schoolId, userId } = req;
    return this.enrollmentService.offerFromWaitlist(waitlistId, offerData, schoolId, userId);
  }
}