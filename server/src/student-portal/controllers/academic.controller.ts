import { Controller, Get, Post, Param, Query, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StudentPortalAcademicService } from '../services/academic.service';

@ApiTags('Student Portal - Academic')
@Controller('student-portal/academic')
export class StudentPortalAcademicController {
  private readonly logger = new Logger(StudentPortalAcademicController.name);

  constructor(
    private readonly academicService: StudentPortalAcademicService,
  ) {}

  // ==================== GRADE ENDPOINTS ====================

  @Get(':studentId/grades')
  @ApiOperation({
    summary: 'Get student grades',
    description: 'Returns comprehensive grade information for the specified student with optional filtering.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Filter by academic year (e.g., "2024-2025")',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'Filter by term (e.g., "Fall 2024")',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter grades from this date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter grades until this date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Grades retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid authentication',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient access level',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async getGrades(
    @Param('studentId') studentId: string,
    @Query() filters: {
      academicYear?: string;
      term?: string;
      subjectId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<any[]> {
    this.logger.log(`Getting grades for student ${studentId} with filters:`, filters);
    return this.academicService.getGrades(studentId, filters);
  }

  @Get(':studentId/grades/summary')
  @ApiOperation({
    summary: 'Get grade summary',
    description: 'Returns a comprehensive grade summary including GPA, credits, and grade distribution.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for the summary (e.g., "2024-2025")',
  })
  @ApiResponse({
    status: 200,
    description: 'Grade summary retrieved successfully',
  })
  async getGradeSummary(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    this.logger.log(`Getting grade summary for student ${studentId}, year: ${academicYear}`);
    return this.academicService.getGradeSummary(studentId, academicYear);
  }

  // ==================== ATTENDANCE ENDPOINTS ====================

  @Get(':studentId/attendance')
  @ApiOperation({
    summary: 'Get attendance records',
    description: 'Returns attendance records for the specified student with optional filtering.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter attendance from this date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter attendance until this date (ISO format)',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'includePatterns',
    required: false,
    type: Boolean,
    description: 'Include attendance pattern analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  async getAttendance(
    @Param('studentId') studentId: string,
    @Query() filters: {
      startDate?: Date;
      endDate?: Date;
      subjectId?: string;
      includePatterns?: boolean;
    },
  ): Promise<any[]> {
    this.logger.log(`Getting attendance for student ${studentId} with filters:`, filters);
    return this.academicService.getAttendance(studentId, filters);
  }

  @Get(':studentId/attendance/summary')
  @ApiOperation({
    summary: 'Get attendance summary',
    description: 'Returns a comprehensive attendance summary with statistics and patterns.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for the summary (e.g., "2024-2025")',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance summary retrieved successfully',
  })
  async getAttendanceSummary(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    this.logger.log(`Getting attendance summary for student ${studentId}, year: ${academicYear}`);
    return this.academicService.getAttendanceSummary(studentId, academicYear);
  }

  // ==================== ASSIGNMENT ENDPOINTS ====================

  @Get(':studentId/assignments')
  @ApiOperation({
    summary: 'Get assignments',
    description: 'Returns assignment information for the specified student with optional filtering.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'submitted', 'graded', 'overdue'],
    description: 'Filter by assignment status',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter assignments from this date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter assignments until this date (ISO format)',
  })
  @ApiQuery({
    name: 'includeSubmissions',
    required: false,
    type: Boolean,
    description: 'Include submission details',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
  })
  async getAssignments(
    @Param('studentId') studentId: string,
    @Query() filters: {
      status?: 'pending' | 'submitted' | 'graded' | 'overdue';
      subjectId?: string;
      startDate?: Date;
      endDate?: Date;
      includeSubmissions?: boolean;
    },
  ): Promise<any[]> {
    this.logger.log(`Getting assignments for student ${studentId} with filters:`, filters);
    return this.academicService.getAssignments(studentId, filters);
  }

  @Post(':studentId/assignments/:assignmentId/submit')
  @ApiOperation({
    summary: 'Submit assignment',
    description: 'Submit an assignment with content, attachments, and notes.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'Unique identifier of the assignment',
  })
  @ApiBody({
    description: 'Assignment submission data',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Assignment content or text submission',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of attachment file URLs or IDs',
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the submission',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid submission data',
  })
  async submitAssignment(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() submission: {
      content?: string;
      attachments?: string[];
      notes?: string;
    },
  ) {
    this.logger.log(`Submitting assignment ${assignmentId} for student ${studentId}`);
    return this.academicService.submitAssignment(studentId, assignmentId, submission);
  }

  // ==================== TIMETABLE ENDPOINTS ====================

  @Get(':studentId/timetable')
  @ApiOperation({
    summary: 'Get class timetable',
    description: 'Returns the class schedule and timetable for the specified student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'weekStart',
    required: false,
    description: 'Start date for the week (ISO format, defaults to current week)',
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include detailed class information',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for the timetable',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'Academic term for the timetable',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable retrieved successfully',
  })
  async getTimetable(
    @Param('studentId') studentId: string,
    @Query() filters: {
      weekStart?: Date;
      includeDetails?: boolean;
      academicYear?: string;
      term?: string;
    },
  ): Promise<any[]> {
    this.logger.log(`Getting timetable for student ${studentId} with filters:`, filters);
    return this.academicService.getTimetable(studentId, filters);
  }

  @Get(':studentId/timetable/today')
  @ApiOperation({
    summary: 'Get today\'s schedule',
    description: 'Returns today\'s class schedule for the specified student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Today\'s schedule retrieved successfully',
  })
  async getTodaysSchedule(@Param('studentId') studentId: string): Promise<any[]> {
    this.logger.log(`Getting today's schedule for student ${studentId}`);
    return this.academicService.getTodaysSchedule(studentId);
  }

  // ==================== ACADEMIC PROGRESS ENDPOINTS ====================

  @Get(':studentId/progress')
  @ApiOperation({
    summary: 'Get academic progress',
    description: 'Returns comprehensive academic progress information including goals and recommendations.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for progress analysis (e.g., "2024-2025")',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic progress retrieved successfully',
  })
  async getAcademicProgress(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    this.logger.log(`Getting academic progress for student ${studentId}, year: ${academicYear}`);
    return this.academicService.getAcademicProgress(studentId, academicYear);
  }

  // ==================== REPORTS ENDPOINTS ====================

  @Get(':studentId/reports')
  @ApiOperation({
    summary: 'Get academic reports',
    description: 'Returns academic reports and certificates for the specified student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Unique identifier of the student',
  })
  @ApiQuery({
    name: 'reportType',
    required: false,
    enum: ['progress', 'transcript', 'certificate', 'assessment'],
    description: 'Type of report to retrieve',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for the reports',
  })
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'Academic term for the reports',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic reports retrieved successfully',
  })
  async getAcademicReports(
    @Param('studentId') studentId: string,
    @Query() filters: {
      reportType?: 'progress' | 'transcript' | 'certificate' | 'assessment';
      academicYear?: string;
      term?: string;
    },
  ) {
    this.logger.log(`Getting academic reports for student ${studentId} with filters:`, filters);
    // This would integrate with the Reports module
    // For now, return mock data
    return {
      studentId,
      reports: [
        {
          id: 'report-001',
          type: 'progress',
          title: 'Academic Progress Report',
          academicYear: filters.academicYear || '2024-2025',
          term: filters.term || 'Fall 2024',
          generatedDate: new Date(),
          downloadUrl: `/reports/progress/${studentId}`,
        },
      ],
    };
  }
}