import { Controller, Get, Param, Query, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ParentPortalAcademicService, AcademicOverview, GradeBook, AttendanceRecord, AssignmentList, StudentTimetable } from '../services/academic.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';

@ApiTags('Parent Portal - Academic')
@Controller('parent-portal/academic')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalAcademicController {
  private readonly logger = new Logger(ParentPortalAcademicController.name);

  constructor(
    private readonly academicService: ParentPortalAcademicService,
  ) {}

  @Get('overview/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get academic overview for a student',
    description: 'Retrieve comprehensive academic overview including grades, attendance, subjects, and performance metrics.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get academic overview for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic overview retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        currentGrade: { type: 'string' },
        gpa: { type: 'number' },
        attendanceRate: { type: 'number' },
        totalSubjects: { type: 'number' },
        subjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subjectId: { type: 'string' },
              subjectName: { type: 'string' },
              teacherName: { type: 'string' },
              currentGrade: { type: 'string' },
              attendanceRate: { type: 'number' },
              assignmentsDue: { type: 'number' },
              recentGrades: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    assessment: { type: 'string' },
                    grade: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    weight: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        academicYear: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getAcademicOverview(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<AcademicOverview> {
    this.logger.log(`Getting academic overview for student: ${studentId}, parent: ${req.user.userId}`);

    const overview = await this.academicService.getAcademicOverview(req.user.parentPortalAccessId, studentId);

    this.logger.log(`Academic overview retrieved for student: ${studentId}, subjects: ${overview.totalSubjects}`);

    return overview;
  }

  @Get('grades/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get grade book for a student',
    description: 'Retrieve detailed grade book with assessments, grades, and performance statistics.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get grade book for',
    type: 'string',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by specific subject ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'gradingPeriod',
    required: false,
    description: 'Filter by grading period (e.g., Q1 2024, Semester 1)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Grade book retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        subjectId: { type: 'string' },
        subjectName: { type: 'string' },
        teacherName: { type: 'string' },
        gradingPeriod: { type: 'string' },
        overallGrade: { type: 'string' },
        grades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              assessmentId: { type: 'string' },
              assessmentName: { type: 'string' },
              assessmentType: { type: 'string' },
              grade: { type: 'string' },
              pointsEarned: { type: 'number' },
              pointsPossible: { type: 'number' },
              weight: { type: 'number' },
              date: { type: 'string', format: 'date-time' },
              comments: { type: 'string' },
            },
          },
        },
        statistics: {
          type: 'object',
          properties: {
            averageGrade: { type: 'number' },
            highestGrade: { type: 'number' },
            lowestGrade: { type: 'number' },
            totalAssessments: { type: 'number' },
            gradeDistribution: {
              type: 'object',
              additionalProperties: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getGradeBook(
    @Param('studentId') studentId: string,
    @Query() query: {
      subjectId?: string;
      gradingPeriod?: string;
    },
    @Request() req: any,
  ): Promise<GradeBook> {
    this.logger.log(`Getting grade book for student: ${studentId}, subject: ${query.subjectId}, period: ${query.gradingPeriod}`);

    const gradeBook = await this.academicService.getGradeBook(
      req.user.parentPortalAccessId,
      studentId,
      query.subjectId,
      query.gradingPeriod,
    );

    this.logger.log(`Grade book retrieved for student: ${studentId}, assessments: ${gradeBook.statistics.totalAssessments}`);

    return gradeBook;
  }

  @Get('attendance/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get attendance record for a student',
    description: 'Retrieve comprehensive attendance record with patterns, statistics, and recent attendance history.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get attendance record for',
    type: 'string',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year to filter attendance (e.g., 2024-2025)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        academicYear: { type: 'string' },
        totalDays: { type: 'number' },
        presentDays: { type: 'number' },
        absentDays: { type: 'number' },
        tardyDays: { type: 'number' },
        excusedDays: { type: 'number' },
        attendanceRate: { type: 'number' },
        monthlyBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              present: { type: 'number' },
              absent: { type: 'number' },
              tardy: { type: 'number' },
              excused: { type: 'number' },
              rate: { type: 'number' },
            },
          },
        },
        recentAttendance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['present', 'absent', 'tardy', 'excused'] },
              checkInTime: { type: 'string', format: 'date-time' },
              checkOutTime: { type: 'string', format: 'date-time' },
              reason: { type: 'string' },
            },
          },
        },
        patterns: {
          type: 'object',
          properties: {
            mostAbsentDay: { type: 'string' },
            averageArrivalTime: { type: 'string' },
            consecutiveAbsences: { type: 'number' },
            improvementTrend: { type: 'string', enum: ['improving', 'declining', 'stable'] },
          },
        },
      },
    },
  })
  async getAttendanceRecord(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
    @Request() req: any,
  ): Promise<AttendanceRecord> {
    this.logger.log(`Getting attendance record for student: ${studentId}, year: ${academicYear}`);

    const attendance = await this.academicService.getAttendanceRecord(
      req.user.parentPortalAccessId,
      studentId,
      academicYear,
    );

    this.logger.log(`Attendance record retrieved for student: ${studentId}, rate: ${attendance.attendanceRate}%`);

    return attendance;
  }

  @Get('assignments/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get assignments for a student',
    description: 'Retrieve assignments with filtering options for status, subject, and deadlines.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get assignments for',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by assignment status',
    enum: ['pending', 'overdue', 'completed', 'all'],
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filter by subject ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        assignments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              assignmentId: { type: 'string' },
              subjectName: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              assignedDate: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['not_started', 'in_progress', 'submitted', 'graded'] },
              grade: { type: 'string' },
              feedback: { type: 'string' },
              attachments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fileName: { type: 'string' },
                    fileSize: { type: 'number' },
                    uploadedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
              submissionDate: { type: 'string', format: 'date-time' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            totalAssignments: { type: 'number' },
            completedAssignments: { type: 'number' },
            overdueAssignments: { type: 'number' },
            upcomingDeadlines: { type: 'number' },
            averageGrade: { type: 'number' },
          },
        },
      },
    },
  })
  async getAssignments(
    @Param('studentId') studentId: string,
    @Query() query: {
      status?: 'pending' | 'overdue' | 'completed' | 'all';
      subjectId?: string;
    },
    @Request() req: any,
  ): Promise<AssignmentList> {
    this.logger.log(`Getting assignments for student: ${studentId}, status: ${query.status}, subject: ${query.subjectId}`);

    const assignments = await this.academicService.getAssignments(
      req.user.parentPortalAccessId,
      studentId,
      query.status,
      query.subjectId,
    );

    this.logger.log(`Assignments retrieved for student: ${studentId}, total: ${assignments.summary.totalAssignments}, overdue: ${assignments.summary.overdueAssignments}`);

    return assignments;
  }

  @Get('timetable/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get student timetable',
    description: 'Retrieve student timetable with current day schedule and next class information.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get timetable for',
    type: 'string',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Specific date to get timetable for (defaults to today)',
    type: 'string',
    format: 'date',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        academicYear: { type: 'string' },
        timetable: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dayOfWeek: { type: 'number', minimum: 0, maximum: 6 },
              period: { type: 'number' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              subjectName: { type: 'string' },
              subjectId: { type: 'string' },
              teacherName: { type: 'string' },
              roomNumber: { type: 'string' },
              classId: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
        },
        weeklySchedule: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { $ref: '#/properties/timetable/items' },
          },
        },
        todaySchedule: {
          type: 'array',
          items: { $ref: '#/properties/timetable/items' },
        },
        nextClass: {
          type: 'object',
          nullable: true,
          properties: {
            subjectName: { type: 'string' },
            startTime: { type: 'string' },
            roomNumber: { type: 'string' },
            teacherName: { type: 'string' },
          },
        },
      },
    },
  })
  async getTimetable(
    @Param('studentId') studentId: string,
    @Query('date') dateString: string,
    @Request() req: any,
  ): Promise<StudentTimetable> {
    this.logger.log(`Getting timetable for student: ${studentId}, date: ${dateString}`);

    const date = dateString ? new Date(dateString) : undefined;
    const timetable = await this.academicService.getTimetable(
      req.user.parentPortalAccessId,
      studentId,
      date,
    );

    this.logger.log(`Timetable retrieved for student: ${studentId}, today classes: ${timetable.todaySchedule.length}`);

    return timetable;
  }

  @Get('reports/:studentId/:reportType')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Generate academic report',
    description: 'Generate and download academic reports such as progress reports, transcripts, or certificates.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to generate report for',
    type: 'string',
  })
  @ApiParam({
    name: 'reportType',
    description: 'Type of report to generate',
    enum: ['progress', 'transcript', 'certificate'],
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    description: 'Academic year for the report (e.g., 2024-2025)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        reportId: { type: 'string' },
        reportType: { type: 'string' },
        generatedAt: { type: 'string', format: 'date-time' },
        academicYear: { type: 'string' },
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async generateReport(
    @Param('studentId') studentId: string,
    @Param('reportType') reportType: 'progress' | 'transcript' | 'certificate',
    @Query('academicYear') academicYear: string,
    @Request() req: any,
  ): Promise<{
    reportId: string;
    reportType: string;
    generatedAt: Date;
    academicYear: string;
    downloadUrl: string;
    expiresAt: Date;
  }> {
    this.logger.log(`Generating ${reportType} report for student: ${studentId}, year: ${academicYear}`);

    const report = await this.academicService.getAcademicReports(
      req.user.parentPortalAccessId,
      studentId,
      reportType,
      academicYear,
    );

    this.logger.log(`${reportType} report generated for student: ${studentId}, reportId: ${report.reportId}`);

    return report;
  }

  @Get('alerts/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get academic alerts for a student',
    description: 'Retrieve academic alerts and notifications for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get alerts for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic alerts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          alertId: { type: 'string' },
          type: { type: 'string', enum: ['academic', 'attendance', 'behavior', 'grade'] },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          title: { type: 'string' },
          message: { type: 'string' },
          actionRequired: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          acknowledgedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getAcademicAlerts(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<Array<{
    alertId: string;
    type: 'academic' | 'attendance' | 'behavior' | 'grade';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    actionRequired: boolean;
    createdAt: Date;
    acknowledgedAt?: Date;
  }>> {
    this.logger.log(`Getting academic alerts for student: ${studentId}`);

    const alerts = await this.academicService.getAcademicAlerts(
      req.user.parentPortalAccessId,
      studentId,
    );

    this.logger.log(`Academic alerts retrieved for student: ${studentId}, count: ${alerts.length}`);

    return alerts;
  }

  @Get('subjects/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get subjects for a student',
    description: 'Retrieve list of subjects and teachers for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get subjects for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subjectId: { type: 'string' },
          subjectName: { type: 'string' },
          teacherName: { type: 'string' },
          teacherEmail: { type: 'string' },
          roomNumber: { type: 'string' },
          schedule: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  })
  async getSubjects(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<Array<{
    subjectId: string;
    subjectName: string;
    teacherName: string;
    teacherEmail: string;
    roomNumber: string;
    schedule: string;
    description: string;
  }>> {
    this.logger.log(`Getting subjects for student: ${studentId}`);

    // Get academic overview which includes subjects
    const overview = await this.academicService.getAcademicOverview(
      req.user.parentPortalAccessId,
      studentId,
    );

    const subjects = overview.subjects.map(subject => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      teacherName: subject.teacherName,
      teacherEmail: `${subject.teacherName.toLowerCase().replace(' ', '.')}@school.com`,
      roomNumber: 'TBD', // Would come from timetable data
      schedule: 'TBD', // Would come from timetable data
      description: `${subject.subjectName} course taught by ${subject.teacherName}`,
    }));

    this.logger.log(`Subjects retrieved for student: ${studentId}, count: ${subjects.length}`);

    return subjects;
  }

  @Get('performance/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get performance analytics for a student',
    description: 'Retrieve performance analytics and trends for academic progress tracking.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get performance analytics for',
    type: 'string',
  })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    description: 'Timeframe for analytics (e.g., 30days, 90days, semester, year)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        timeframe: { type: 'string' },
        overallGPA: { type: 'number' },
        gradeTrend: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string' },
              gpa: { type: 'number' },
              trend: { type: 'string', enum: ['improving', 'declining', 'stable'] },
            },
          },
        },
        subjectPerformance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subjectName: { type: 'string' },
              currentGrade: { type: 'string' },
              gradeChange: { type: 'number' },
              attendanceRate: { type: 'number' },
              assignmentsCompleted: { type: 'number' },
              averageScore: { type: 'number' },
            },
          },
        },
        strengths: { type: 'array', items: { type: 'string' } },
        areasForImprovement: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getPerformanceAnalytics(
    @Param('studentId') studentId: string,
    @Query('timeframe') timeframe: string = 'semester',
    @Request() req: any,
  ): Promise<{
    studentId: string;
    timeframe: string;
    overallGPA: number;
    gradeTrend: Array<{
      period: string;
      gpa: number;
      trend: 'improving' | 'declining' | 'stable';
    }>;
    subjectPerformance: Array<{
      subjectName: string;
      currentGrade: string;
      gradeChange: number;
      attendanceRate: number;
      assignmentsCompleted: number;
      averageScore: number;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  }> {
    this.logger.log(`Getting performance analytics for student: ${studentId}, timeframe: ${timeframe}`);

    // Get academic overview for performance data
    const overview = await this.academicService.getAcademicOverview(
      req.user.parentPortalAccessId,
      studentId,
    );

    // Mock performance analytics based on overview data
    const analytics = {
      studentId,
      timeframe,
      overallGPA: overview.gpa,
      gradeTrend: [
        { period: 'Q1', gpa: 3.5, trend: 'improving' as const },
        { period: 'Q2', gpa: 3.6, trend: 'improving' as const },
        { period: 'Q3', gpa: overview.gpa, trend: 'stable' as const },
      ],
      subjectPerformance: overview.subjects.map(subject => ({
        subjectName: subject.subjectName,
        currentGrade: subject.currentGrade,
        gradeChange: 0.2, // Mock improvement
        attendanceRate: subject.attendanceRate,
        assignmentsCompleted: Math.floor(Math.random() * 10) + 5,
        averageScore: this.gradeToNumeric(subject.currentGrade),
      })),
      strengths: [
        'Consistent attendance',
        'Strong performance in core subjects',
        'Timely assignment submission',
      ],
      areasForImprovement: [
        'Could improve participation in class discussions',
        'Additional practice needed in advanced topics',
      ],
      recommendations: [
        'Consider joining study groups for challenging subjects',
        'Maintain current study habits for continued success',
        'Explore advanced topics in areas of interest',
      ],
    };

    this.logger.log(`Performance analytics retrieved for student: ${studentId}, GPA: ${analytics.overallGPA}`);

    return analytics;
  }

  // Helper method for grade conversion
  private gradeToNumeric(grade: string): number {
    const gradeMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };
    return gradeMap[grade] || 0;
  }
}