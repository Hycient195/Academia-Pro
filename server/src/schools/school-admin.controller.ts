// Academia Pro - School Admin Controller
// Handles school-specific administration and management

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger, Inject, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SchoolContextService, SchoolContext } from './school-context.service';
import { School } from './school.entity';
import { SchoolContextGuard } from '../common/guards/school-context.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StudentsService } from '../students/students.service';
import { StaffService } from '../staff/staff.service';
import { UsersService } from '../users/users.service';
// import { FeeService } from '../fee/fee.service';
// import { AttendanceService } from '../attendance/attendance.service';
// import { CommunicationService } from '../communication/communication.service';
import { CreateStudentDto } from '../students/dtos/create-student.dto';
import { UpdateStudentDto } from '../students/dtos/update-student.dto';
import { CreateStaffDto } from '../staff/dtos/create-staff.dto';
import { UpdateStaffDto } from '../staff/dtos/update-staff.dto';
import { EUserRole } from '@academia-pro/types/users';
import { DelegatedSchoolAdminService } from '../iam/services/delegated-school-admin.service';
import { CreateDelegatedSchoolAdminDto } from '../iam/dtos/create-delegated-school-admin.dto';
import { UpdateDelegatedSchoolAdminDto } from '../iam/dtos/update-delegated-school-admin.dto';

// Audit imports
import { Auditable, SampleAudit } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';
import { AddDocumentDto } from '../students/dtos';

@ApiTags('School Admin - School Management')
@Controller('school-admin')
@UseGuards(SchoolContextGuard, RolesGuard)
@Roles(EUserRole.SCHOOL_ADMIN)
export class SchoolAdminController {
  private readonly logger = new Logger(SchoolAdminController.name);

  constructor(
    private readonly schoolContextService: SchoolContextService,
    private readonly studentsService: StudentsService,
    // private readonly staffService: StaffService,
    private readonly usersService: UsersService,
    private readonly delegatedSchoolAdminService: DelegatedSchoolAdminService,
    // private readonly feeService: FeeService,
    // private readonly attendanceService: AttendanceService,
    // private readonly communicationService: CommunicationService,
  ) {}

  // ==================== SCHOOL PROFILE ====================

  @Get('profile')
  @ApiOperation({
    summary: 'Get school profile',
    description: 'Returns the profile information for the current school.',
  })
  @ApiResponse({
    status: 200,
    description: 'School profile retrieved successfully',
  })
  async getSchoolProfile(@Req() request: any): Promise<School> {
    this.logger.log('Getting school profile');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const schools = await this.schoolContextService.getAllSchools();
    const school = schools.find(s => s.id === schoolId);

    if (!school) {
      throw new Error('School not found');
    }

    return school;
  }

  @Put('profile')
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'school',
    customAction: 'school_profile_updated',
    severity: AuditSeverity.HIGH,
    metadata: { profileUpdate: true }
  })
  @ApiOperation({
    summary: 'Update school profile',
    description: 'Updates the profile information for the current school.',
  })
  @ApiBody({
    description: 'School profile update data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'School name' },
        description: { type: 'string', description: 'School description' },
        address: { type: 'string', description: 'School address' },
        phone: { type: 'string', description: 'Contact phone' },
        email: { type: 'string', description: 'Contact email' },
        website: { type: 'string', description: 'School website' },
        openingTime: { type: 'string', format: 'time', description: 'Opening time' },
        closingTime: { type: 'string', format: 'time', description: 'Closing time' },
        timezone: { type: 'string', description: 'Timezone' },
        currency: { type: 'string', description: 'Currency code' },
        language: { type: 'string', description: 'Primary language' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'School profile updated successfully',
  })
  async updateSchoolProfile(
    @Req() request: any,
    @Body() updates: Partial<School>,
  ): Promise<School> {
    this.logger.log('Updating school profile');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const updatedBy = request.user?.id || 'system'; // Extract from JWT

    return this.schoolContextService.updateSchoolContext(schoolId, updates, updatedBy);
  }

  // ==================== SCHOOL STATISTICS ====================

  @Get('statistics')
  @ApiOperation({
    summary: 'Get school statistics',
    description: 'Returns comprehensive statistics for the current school.',
  })
  @ApiResponse({
    status: 200,
    description: 'School statistics retrieved successfully',
  })
  async getSchoolStatistics(@Req() request: any): Promise<any> {
    this.logger.log('Getting school statistics');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const statistics = await this.schoolContextService.getSchoolStatistics(schoolId);
    const schools = await this.schoolContextService.getAllSchools();
    const school = schools.find(s => s.id === schoolId);

    return {
      school: {
        id: school?.id,
        name: school?.name,
        type: school?.type,
        status: school?.status,
      },
      statistics,
      health: {
        subscriptionActive: school?.isSubscriptionActive,
        daysUntilExpiry: school?.daysUntilSubscriptionExpiry,
        occupancyRate: school?.occupancyRate,
      },
    };
  }

  // ==================== SCHOOL SETTINGS ====================

  @Get('settings')
  @ApiOperation({
    summary: 'Get school settings',
    description: 'Returns the configuration settings for the current school.',
  })
  @ApiResponse({
    status: 200,
    description: 'School settings retrieved successfully',
  })
  async getSchoolSettings(@Req() request: any): Promise<any> {
    this.logger.log('Getting school settings');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const schools = await this.schoolContextService.getAllSchools();
    const school = schools.find(s => s.id === schoolId);

    return {
      features: school?.settings?.features || [],
      modules: school?.settings?.modules || [],
      notifications: school?.settings?.notifications || {},
      security: school?.settings?.security || {},
      academic: school?.settings?.academic || {},
      branding: school?.branding || {},
    };
  }

  @Put('settings')
  @Auditable({
    action: AuditAction.SYSTEM_CONFIG_CHANGED,
    resource: 'school',
    customAction: 'school_settings_updated',
    severity: AuditSeverity.HIGH,
    metadata: { settingsUpdate: true, systemConfig: true }
  })
  @ApiOperation({
    summary: 'Update school settings',
    description: 'Updates the configuration settings for the current school.',
  })
  @ApiBody({
    description: 'School settings update data',
    schema: {
      type: 'object',
      properties: {
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Enabled features'
        },
        modules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Enabled modules'
        },
        notifications: {
          type: 'object',
          description: 'Notification preferences'
        },
        security: {
          type: 'object',
          description: 'Security settings'
        },
        academic: {
          type: 'object',
          description: 'Academic settings'
        },
        branding: {
          type: 'object',
          description: 'Branding settings'
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'School settings updated successfully',
  })
  async updateSchoolSettings(
    @Req() request: any,
    @Body() settings: any,
  ): Promise<School> {
    this.logger.log('Updating school settings');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const updatedBy = request.user?.id || 'system'; // Extract from JWT

    return this.schoolContextService.updateSchoolContext(
      schoolId,
      { settings },
      updatedBy
    );
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  @ApiOperation({
    summary: 'Get school users',
    description: 'Returns all users associated with the current school.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['staff', 'student', 'parent'],
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    description: 'Filter by user status',
  })
  @ApiResponse({
    status: 200,
    description: 'School users retrieved successfully',
  })
  async getSchoolUsers(
    @Req() request: any,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    this.logger.log('Getting school users');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    // Use the UsersService to get users for this school
    const result = await this.usersService.findAll({
      schoolId,
      roles: role ? [role as EUserRole] : undefined,
      status: status as any,
    });
    const users = result.data;

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
      createdAt: user.createdAt,
    }));

    return {
      data: formattedUsers,
      pagination: result.pagination,
    };
  }

  @Post('users')
  @ApiOperation({
    summary: 'Create school user',
    description: 'Creates a new user for the current school.',
  })
  @ApiBody({
    description: 'User creation data',
    schema: {
      type: 'object',
      required: ['email', 'firstName', 'lastName', 'role'],
      properties: {
        email: { type: 'string', description: 'User email' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        role: {
          type: 'string',
          enum: ['staff', 'student', 'parent'],
          description: 'User role'
        },
        phone: { type: 'string', description: 'Phone number' },
        dateOfBirth: { type: 'string', format: 'date', description: 'Date of birth' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async createSchoolUser(
    @Req() request: any,
    @Body() userData: any
  ): Promise<any> {
    this.logger.log(`Creating school user: ${userData.email}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    // This would integrate with the Users module
    // For now, return mock response
    return {
      id: 'new-user-id',
      ...userData,
      schoolId,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  // ==================== STUDENT MANAGEMENT ====================

  @Get('students')
  @ApiOperation({
    summary: 'Get school students',
    description: 'Returns paginated list of students enrolled in the current school.',
  })
  @ApiQuery({ name: 'stage', required: false, enum: ['EY', 'PRY', 'JSS', 'SSS'], description: 'Filter by academic stage' })
  @ApiQuery({ name: 'gradeCode', required: false, description: 'Filter by canonical grade code' })
  @ApiQuery({ name: 'streamSection', required: false, description: 'Filter by stream or section' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'graduated', 'transferred', 'withdrawn', 'suspended'],
    description: 'Filter by student status',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, admission number or email' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'School students retrieved successfully',
  })
  async getSchoolStudents(
    @Req() request: any,
    @Query('stage') stage?: string,
    @Query('gradeCode') gradeCode?: string,
    @Query('streamSection') streamSection?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    this.logger.log('Getting school students');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const result = await this.studentsService.findAll({
      schoolId,
      stages: stage ? [stage] : undefined,
      gradeCodes: gradeCode ? [gradeCode] : undefined,
      streamSections: streamSection ? [streamSection] : undefined,
      statuses: status ? [status] : undefined,
      search,
      page: Number(page),
      limit: Number(limit),
    });

    const students = result.data.map(student => ({
      id: student.id,
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      stage: student.stage,
      gradeCode: student.gradeCode,
      streamSection: student.streamSection,
      status: student.status,
      enrollmentDate: student.admissionDate,
      email: student.email,
      phone: student.phone,
    }));

    return {
      data: students,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.page < Math.ceil(result.total / result.limit),
        hasPrev: result.page > 1,
      },
    };
  }

  @Post('students')
  @ApiOperation({
    summary: 'Create student admission',
    description: 'Creates a new student record for the current school.',
  })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Admission number or email already exists' })
  async createSchoolStudent(
    @Req() request: any,
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<any> {
    this.logger.log('Creating school student');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const studentData = { ...createStudentDto, schoolId };

    return this.studentsService.create(studentData);
  }

  @Get('students/:id')
  @ApiOperation({
    summary: 'Get student profile',
    description: 'Returns detailed profile for a student in the current school.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getSchoolStudentById(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<any> {
    this.logger.log(`Getting student profile for ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const student = await this.studentsService.findOne(id);

    if (student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found in this school');
    }

    return student;
  }

  @Put('students/:id')
  @ApiOperation({
    summary: 'Update student profile',
    description: 'Updates student information for the current school.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async updateSchoolStudent(
    @Req() request: any,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<any> {
    this.logger.log(`Updating student profile for ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const student = await this.studentsService.findOne(id);

    if (student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found in this school');
    }

    return this.studentsService.update(id, updateStudentDto);
  }

  @Post('students/:id/documents')
  @ApiOperation({
    summary: 'Upload student document',
    description: 'Uploads a document to the student record.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: AddDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async uploadSchoolStudentDocument(
    @Req() request: any,
    @Param('id') id: string,
    @Body() addDocumentDto: AddDocumentDto,
  ): Promise<any> {
    this.logger.log(`Uploading document for student ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const student = await this.studentsService.findOne(id);

    if (student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found in this school');
    }

    return this.studentsService.addDocument(id, addDocumentDto);
  }

  @Delete('students/:id')
  @Auditable({
    action: AuditAction.DATA_DELETED,
    resource: 'student',
    customAction: 'student_deleted_by_school_admin',
    severity: AuditSeverity.HIGH,
    metadata: { deletionType: 'school_admin', requiresConfirmation: true }
  })
  @ApiOperation({
    summary: 'Delete student',
    description: 'Deletes a student record from the current school. Requires confirmation with full student name.',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({
    description: 'Deletion confirmation data',
    schema: {
      type: 'object',
      required: ['confirmationName', 'reason'],
      properties: {
        confirmationName: {
          type: 'string',
          description: 'Full name of the student to confirm deletion'
        },
        reason: {
          type: 'string',
          description: 'Reason for deletion'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Student deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Invalid confirmation name' })
  async deleteSchoolStudent(
    @Req() request: any,
    @Param('id') id: string,
    @Body() deleteData: { confirmationName: string; reason: string },
  ): Promise<any> {
    this.logger.log(`Deleting student ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const student = await this.studentsService.findOne(id);

    if (student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found in this school');
    }

    // Verify confirmation name matches
    const fullName = `${student.firstName} ${student.lastName}`.trim();
    if (deleteData.confirmationName !== fullName) {
      throw new BadRequestException('Confirmation name does not match student name');
    }

    return this.studentsService.delete(id, deleteData.reason);
  }

  // ==================== SCHOOL REPORTS ====================

  @Get('reports/academic')
  @SampleAudit(0.2) // Sample 20% of academic report requests
  @Auditable({
    action: AuditAction.DATA_ACCESSED,
    resource: 'school',
    customAction: 'academic_report_generated',
    severity: AuditSeverity.LOW,
    metadata: { reportType: 'academic' }
  })
  @ApiOperation({
    summary: 'Get academic reports',
    description: 'Returns academic performance reports for the current school.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['weekly', 'monthly', 'quarterly', 'annual'],
    description: 'Reporting period',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic reports retrieved successfully',
  })
  async getAcademicReports(
    @Req() request: any,
    @Query('period') period: string = 'monthly'
  ): Promise<any> {
    this.logger.log(`Getting academic reports for period: ${period}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    // Get real student data from StudentsService
    const studentsResult = await this.studentsService.findAll({
      schoolId,
      limit: 1000, // Get more students for better statistics
    });

    const totalStudents = studentsResult.total || 0;
    const students = studentsResult.data || [];

    // Calculate basic statistics from real data
    const activeStudents = students.filter(s => s.status === 'active').length;

    return {
      period,
      schoolId,
      summary: {
        totalStudents,
        activeStudents,
        // These would come from actual academic records
        averageGPA: 3.2,
        passRate: 85,
        topPerformers: Math.floor(activeStudents * 0.1), // 10% top performers
      },
      gradeDistribution: {
        'A': Math.floor(activeStudents * 0.24), // 24%
        'B': Math.floor(activeStudents * 0.3),  // 30%
        'C': Math.floor(activeStudents * 0.26), // 26%
        'D': Math.floor(activeStudents * 0.16), // 16%
        'F': Math.floor(activeStudents * 0.04), // 4%
      },
      subjectPerformance: [
        { subject: 'Mathematics', averageScore: 78, passRate: 82 },
        { subject: 'English', averageScore: 82, passRate: 88 },
        { subject: 'Science', averageScore: 75, passRate: 79 },
      ],
      generatedAt: new Date(),
    };
  }

  @Get('reports/financial')
  @ApiOperation({
    summary: 'Get financial reports',
    description: 'Returns financial reports for the current school.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['monthly', 'quarterly', 'annual'],
    description: 'Reporting period',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial reports retrieved successfully',
  })
  async getFinancialReports(
    @Req() request: any,
    @Query('period') period: string = 'monthly'
  ): Promise<any> {
    this.logger.log(`Getting financial reports for period: ${period}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    // Get real student data to base financial calculations on
    const studentsResult = await this.studentsService.findAll({
      schoolId,
      limit: 1000,
    });

    const totalStudents = studentsResult.total || 0;
    const activeStudents = studentsResult.data?.filter(s => s.status === 'active').length || 0;

    // Calculate financial metrics based on student count
    const estimatedRevenue = activeStudents * 2000; // Rough estimate per student
    const estimatedExpenses = estimatedRevenue * 0.8; // 80% of revenue
    const netIncome = estimatedRevenue - estimatedExpenses;
    const outstandingFees = Math.floor(estimatedRevenue * 0.1); // 10% outstanding

    return {
      period,
      schoolId,
      summary: {
        totalRevenue: estimatedRevenue,
        totalExpenses: estimatedExpenses,
        netIncome,
        outstandingFees,
      },
      feeCollection: {
        collected: estimatedRevenue - outstandingFees,
        pending: Math.floor(outstandingFees * 0.7),
        overdue: Math.floor(outstandingFees * 0.3),
      },
      expenses: {
        staffSalaries: Math.floor(estimatedExpenses * 0.67), // 67% salaries
        utilities: Math.floor(estimatedExpenses * 0.125),   // 12.5% utilities
        maintenance: Math.floor(estimatedExpenses * 0.083), // 8.3% maintenance
        supplies: Math.floor(estimatedExpenses * 0.125),    // 12.5% supplies
      },
      generatedAt: new Date(),
    };
  }

  @Get('reports/attendance')
  @ApiOperation({
    summary: 'Get attendance reports',
    description: 'Returns attendance reports for the current school.',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['weekly', 'monthly', 'quarterly'],
    description: 'Reporting period',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance reports retrieved successfully',
  })
  async getAttendanceReports(
    @Req() request: any,
    @Query('period') period: string = 'monthly'
  ): Promise<any> {
    this.logger.log(`Getting attendance reports for period: ${period}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    // Get real student data from StudentsService
    const studentsResult = await this.studentsService.findAll({
      schoolId,
      limit: 1000,
    });

    const totalStudents = studentsResult.total || 0;
    const students = studentsResult.data || [];
    const activeStudents = students.filter(s => s.status === 'active').length;

    // Calculate attendance statistics based on real student count
    const averageAttendance = 92; // This would come from actual attendance records
    const estimatedPresent = Math.floor(activeStudents * (averageAttendance / 100));
    const estimatedAbsent = activeStudents - estimatedPresent;

    return {
      period,
      schoolId,
      summary: {
        totalStudents: activeStudents,
        averageAttendance,
        totalPresent: estimatedPresent,
        totalAbsent: estimatedAbsent,
      },
      dailyBreakdown: [
        { date: new Date().toISOString().split('T')[0], present: estimatedPresent, absent: estimatedAbsent },
        // Additional days would come from actual attendance data
      ],
      gradeWise: [
        { grade: 'Grade 1', attendanceRate: 95 },
        { grade: 'Grade 2', attendanceRate: 93 },
        { grade: 'Grade 3', attendanceRate: 91 },
      ],
      generatedAt: new Date(),
    };
  }

  // ==================== SYSTEM HEALTH ====================

  @Get('health')
  @ApiOperation({
    summary: 'Get school system health',
    description: 'Returns the health status of systems for the current school.',
  })
  @ApiResponse({
    status: 200,
    description: 'School system health retrieved successfully',
  })
  async getSchoolHealth(@Req() request: any): Promise<any> {
    this.logger.log('Getting school system health');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const statistics = await this.schoolContextService.getSchoolStatistics(schoolId);

    return {
      overallHealth: 'healthy', // This would be calculated based on various metrics
      components: {
        database: { status: 'healthy', responseTime: '45ms' },
        api: { status: 'healthy', uptime: '99.9%' },
        storage: { status: 'healthy', usage: '65%' },
        users: { status: 'healthy', activeUsers: statistics.userCount },
        students: { status: 'healthy', activeStudents: statistics.studentCount },
      },
      alerts: [], // Any system alerts or warnings
      lastChecked: new Date(),
    };
  }

  // ==================== DELEGATED SCHOOL ADMIN MANAGEMENT ====================

  @Get('delegated-admins')
  @ApiOperation({
    summary: 'Get delegated school admins',
    description: 'Returns all delegated school admin accounts for the current school.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delegated school admins retrieved successfully',
  })
  async getDelegatedSchoolAdmins(@Req() request: any): Promise<any> {
    this.logger.log('Getting delegated school admins');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    const delegatedAdmins = await this.delegatedSchoolAdminService.getDelegatedSchoolAdmins(schoolId);

    return {
      data: delegatedAdmins,
      total: delegatedAdmins.length,
    };
  }

  @Post('delegated-admins')
  @Auditable({
    action: AuditAction.USER_CREATED,
    resource: 'delegated_school_admin',
    customAction: 'delegated_school_admin_created',
    severity: AuditSeverity.HIGH,
    metadata: { accountType: 'delegated_school_admin' }
  })
  @ApiOperation({
    summary: 'Create delegated school admin',
    description: 'Creates a new delegated school admin account for the current school.',
  })
  @ApiBody({ type: CreateDelegatedSchoolAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Delegated school admin created successfully',
  })
  async createDelegatedSchoolAdmin(
    @Req() request: any,
    @Body() createDto: CreateDelegatedSchoolAdminDto,
  ): Promise<any> {
    this.logger.log('Creating delegated school admin');

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const createdBy = request.user?.id || 'system';

    // Ensure the schoolId matches the current school context
    if (createDto.schoolId !== schoolId) {
      throw new BadRequestException('Cannot create delegated admin for different school');
    }

    return this.delegatedSchoolAdminService.createDelegatedSchoolAdmin(createDto, createdBy);
  }

  @Get('delegated-admins/:id')
  @ApiOperation({
    summary: 'Get delegated school admin by ID',
    description: 'Returns a specific delegated school admin account.',
  })
  @ApiParam({ name: 'id', description: 'Delegated school admin ID' })
  @ApiResponse({
    status: 200,
    description: 'Delegated school admin retrieved successfully',
  })
  async getDelegatedSchoolAdminById(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<any> {
    this.logger.log(`Getting delegated school admin by ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    return this.delegatedSchoolAdminService.getDelegatedSchoolAdminById(id, schoolId);
  }

  @Put('delegated-admins/:id')
  @Auditable({
    action: AuditAction.USER_UPDATED,
    resource: 'delegated_school_admin',
    customAction: 'delegated_school_admin_updated',
    severity: AuditSeverity.MEDIUM,
    metadata: { accountType: 'delegated_school_admin' }
  })
  @ApiOperation({
    summary: 'Update delegated school admin',
    description: 'Updates a delegated school admin account.',
  })
  @ApiParam({ name: 'id', description: 'Delegated school admin ID' })
  @ApiBody({ type: UpdateDelegatedSchoolAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Delegated school admin updated successfully',
  })
  async updateDelegatedSchoolAdmin(
    @Req() request: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDelegatedSchoolAdminDto,
  ): Promise<any> {
    this.logger.log(`Updating delegated school admin ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const updatedBy = request.user?.id || 'system';

    return this.delegatedSchoolAdminService.updateDelegatedSchoolAdmin(id, schoolId, updateDto, updatedBy);
  }

  @Post('delegated-admins/:id/revoke')
  @Auditable({
    action: AuditAction.USER_BLOCKED,
    resource: 'delegated_school_admin',
    customAction: 'delegated_school_admin_revoked',
    severity: AuditSeverity.HIGH,
    metadata: { accountType: 'delegated_school_admin', action: 'revoke' }
  })
  @ApiOperation({
    summary: 'Revoke delegated school admin',
    description: 'Revokes a delegated school admin account.',
  })
  @ApiParam({ name: 'id', description: 'Delegated school admin ID' })
  @ApiBody({
    description: 'Revocation data',
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for revocation' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Delegated school admin revoked successfully',
  })
  async revokeDelegatedSchoolAdmin(
    @Req() request: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<any> {
    this.logger.log(`Revoking delegated school admin ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;
    const revokedBy = request.user?.id || 'system';

    return this.delegatedSchoolAdminService.revokeDelegatedSchoolAdmin(id, schoolId, revokedBy);
  }

  @Delete('delegated-admins/:id')
  @Auditable({
    action: AuditAction.USER_DELETED,
    resource: 'delegated_school_admin',
    customAction: 'delegated_school_admin_deleted',
    severity: AuditSeverity.CRITICAL,
    metadata: { accountType: 'delegated_school_admin', requiresConfirmation: true }
  })
  @ApiOperation({
    summary: 'Delete delegated school admin',
    description: 'Deletes a delegated school admin account.',
  })
  @ApiParam({ name: 'id', description: 'Delegated school admin ID' })
  @ApiResponse({
    status: 204,
    description: 'Delegated school admin deleted successfully',
  })
  async deleteDelegatedSchoolAdmin(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(`Deleting delegated school admin ID: ${id}`);

    const schoolContext = request.schoolContext;
    const schoolId = schoolContext.schoolId;

    await this.delegatedSchoolAdminService.deleteDelegatedSchoolAdmin(id, schoolId);
  }
}