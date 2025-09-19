// Academia Pro - Staff Controller
// REST API endpoints for managing staff members and HR operations

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, SampleAudit, MonitorPerformance } from '../../common/audit/auditable.decorator';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto, UpdateStaffDto } from '../dtos';
import { StaffType, StaffStatus, EmploymentType } from '../entities/staff.entity';
import { AssignStaffToDepartmentDto } from '../dtos/assign-staff-to-department.dto';
import { StaffDepartmentResponseDto } from '../dtos/staff-department-response.dto';

@ApiTags('Staff Management')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AuditCreate('staff', 'id')
  @ApiOperation({
    summary: 'Create a new staff member',
    description: 'Create a new staff member with complete profile information',
  })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Staff member with this email already exists',
  })
  async createStaff(
    @Body() dto: CreateStaffDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.staffService.createStaff(dto, createdBy);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get staff member by ID',
    description: 'Retrieve a specific staff member with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Staff member not found',
  })
  async getStaffById(@Param('id', ParseUUIDPipe) staffId: string) {
    return this.staffService.getStaffById(staffId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Get staff member by employee ID',
    description: 'Retrieve a staff member using their employee ID',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: 'EMP2024001',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Staff member not found',
  })
  async getStaffByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.staffService.getStaffByEmployeeId(employeeId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update staff member',
    description: 'Update an existing staff member\'s information',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
  })
  async updateStaff(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Body() dto: UpdateStaffDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.staffService.updateStaff(staffId, dto, updatedBy);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete staff member',
    description: 'Delete a staff member (only if not active)',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
  })
  async deleteStaff(@Param('id', ParseUUIDPipe) staffId: string) {
    await this.staffService.deleteStaff(staffId);
    return { message: 'Staff member deleted successfully' };
  }

  @Put(':id/terminate')
  @AuditUpdate('staff', 'id')
  @ApiOperation({
    summary: 'Terminate staff member',
    description: 'Terminate a staff member with reason',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiQuery({
    name: 'reason',
    description: 'Reason for termination',
    example: 'End of contract',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member terminated successfully',
  })
  async terminateStaff(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('reason') reason: string,
    @Request() req: any,
  ) {
    const terminatedBy = req.user?.id || 'system';
    return this.staffService.terminateStaff(staffId, reason, terminatedBy);
  }

  @Put(':id/suspend')
  @ApiOperation({
    summary: 'Suspend staff member',
    description: 'Suspend a staff member with reason',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiQuery({
    name: 'reason',
    description: 'Reason for suspension',
    example: 'Policy violation',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member suspended successfully',
  })
  async suspendStaff(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('reason') reason: string,
    @Request() req: any,
  ) {
    const suspendedBy = req.user?.id || 'system';
    return this.staffService.suspendStaff(staffId, reason, suspendedBy);
  }

  @Put(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate staff member',
    description: 'Reactivate a suspended or terminated staff member',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member reactivated successfully',
  })
  async reactivateStaff(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Request() req: any,
  ) {
    const reactivatedBy = req.user?.id || 'system';
    return this.staffService.reactivateStaff(staffId, reactivatedBy);
  }

  @Put(':id/performance')
  @ApiOperation({
    summary: 'Update staff performance',
    description: 'Update performance rating and review notes',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiQuery({
    name: 'rating',
    description: 'Performance rating (1-5)',
    example: 4.5,
  })
  @ApiQuery({
    name: 'notes',
    description: 'Performance review notes',
    example: 'Excellent teaching performance',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Performance updated successfully',
  })
  async updatePerformance(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('rating') rating: number,
    @Query('notes') notes: string,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.staffService.updatePerformance(staffId, rating, updatedBy, notes);
  }

  @Post(':id/leave')
  @ApiOperation({
    summary: 'Process leave request',
    description: 'Process a leave request for a staff member',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiQuery({
    name: 'leaveType',
    description: 'Type of leave',
    example: 'annual',
    enum: ['annual', 'sick', 'maternity', 'paternity', 'casual'],
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of leave days',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave processed successfully',
  })
  async processLeave(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('leaveType') leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual',
    @Query('days') days: number,
    @Request() req: any,
  ) {
    const processedBy = req.user?.id || 'system';
    return this.staffService.processLeave(staffId, leaveType, days, processedBy);
  }

  @Post(':id/leave/add')
  @ApiOperation({
    summary: 'Add leave balance',
    description: 'Add leave days to a staff member\'s balance',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiQuery({
    name: 'leaveType',
    description: 'Type of leave',
    example: 'annual',
    enum: ['annual', 'sick', 'maternity', 'paternity', 'casual'],
  })
  @ApiQuery({
    name: 'days',
    description: 'Number of leave days to add',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave balance updated successfully',
  })
  async addLeaveBalance(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('leaveType') leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual',
    @Query('days') days: number,
    @Request() req: any,
  ) {
    const addedBy = req.user?.id || 'system';
    return this.staffService.addLeaveBalance(staffId, leaveType, days, addedBy);
  }

  @Get('school/:schoolId')
  @ApiOperation({
    summary: 'Get staff by school',
    description: 'Retrieve all staff members for a specific school',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'staffType',
    required: false,
    description: 'Filter by staff type',
    enum: StaffType,
    example: StaffType.TEACHING,
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
    example: 'Mathematics',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, email, or employee ID',
    example: 'John',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Staff members retrieved successfully',
  })
  async getStaffBySchool(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      staffType: query.staffType,
      department: query.department,
      status: query.status,
      search: query.search,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.staffService.getStaffBySchool(schoolId, options);
  }

  @Get('department/:schoolId/:department')
  @ApiOperation({
    summary: 'Get staff by department',
    description: 'Retrieve all staff members for a specific department',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiParam({
    name: 'department',
    description: 'Department name',
    example: 'Mathematics',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Department staff retrieved successfully',
  })
  async getStaffByDepartment(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('department') department: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.staffService.getStaffByDepartment(schoolId, department, options);
  }

  @Get('statistics/:schoolId')
  @ApiOperation({
    summary: 'Get staff statistics',
    description: 'Retrieve comprehensive statistics for staff management',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff statistics retrieved successfully',
  })
  async getStaffStatistics(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.staffService.getStaffStatistics(schoolId);
  }

  @Get('birthdays/:schoolId')
  @ApiOperation({
    summary: 'Get upcoming birthdays',
    description: 'Retrieve staff members with upcoming birthdays',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming birthdays retrieved successfully',
  })
  async getUpcomingBirthdays(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('days') days: number = 30,
  ) {
    return this.staffService.getUpcomingBirthdays(schoolId, days);
  }

  @Get('contracts/expiring/:schoolId')
  @ApiOperation({
    summary: 'Get expiring contracts',
    description: 'Retrieve staff members with contracts expiring soon',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look ahead',
    example: 90,
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring contracts retrieved successfully',
  })
  async getExpiringContracts(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('days') days: number = 90,
  ) {
    return this.staffService.getExpiringContracts(schoolId, days);
  }

  @Get('probation/:schoolId')
  @ApiOperation({
    summary: 'Get staff on probation',
    description: 'Retrieve staff members currently on probation',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff on probation retrieved successfully',
  })
  async getStaffOnProbation(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.staffService.getStaffOnProbation(schoolId);
  }

  @Post('bulk/salary-update')
  @HttpCode(HttpStatus.OK)
  @SampleAudit(0.1) // Sample 10% of bulk salary updates
  @AuditUpdate('staff', '0.id')
  @ApiOperation({
    summary: 'Bulk update staff salaries',
    description: 'Update salaries for multiple staff members at once',
  })
  @ApiResponse({
    status: 200,
    description: 'Salaries updated successfully',
  })
  async bulkUpdateSalaries(
    @Body() body: {
      schoolId: string;
      updates: Array<{
        staffId: string;
        basicSalary?: number;
        houseAllowance?: number;
        transportAllowance?: number;
        medicalAllowance?: number;
        otherAllowances?: number;
        taxDeductible?: number;
        providentFund?: number;
        otherDeductions?: number;
      }>;
    },
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.staffService.bulkUpdateSalaries(body.schoolId, body.updates, updatedBy);
  }

  @Get('dashboard/:schoolId')
  @ApiOperation({
    summary: 'Get staff dashboard overview',
    description: 'Retrieve dashboard data for staff management',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff dashboard overview retrieved successfully',
  })
  async getStaffDashboard(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    const [statistics, upcomingBirthdays, expiringContracts, staffOnProbation] = await Promise.all([
      this.staffService.getStaffStatistics(schoolId),
      this.staffService.getUpcomingBirthdays(schoolId, 30),
      this.staffService.getExpiringContracts(schoolId, 90),
      this.staffService.getStaffOnProbation(schoolId),
    ]);

    return {
      summary: statistics,
      alerts: {
        upcomingBirthdays: upcomingBirthdays.length,
        expiringContracts: expiringContracts.length,
        staffOnProbation: staffOnProbation.length,
      },
      recentData: {
        upcomingBirthdays: upcomingBirthdays.slice(0, 5),
        expiringContracts: expiringContracts.slice(0, 5),
        staffOnProbation: staffOnProbation.slice(0, 5),
      },
      period: {
        generatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('reports/salary/:schoolId')
  @ApiOperation({
    summary: 'Get salary report',
    description: 'Generate comprehensive salary report for the school',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department',
    example: 'Mathematics',
  })
  @ApiQuery({
    name: 'staffType',
    required: false,
    description: 'Filter by staff type',
    enum: StaffType,
    example: StaffType.TEACHING,
  })
  @ApiResponse({
    status: 200,
    description: 'Salary report generated successfully',
  })
  async getSalaryReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: {
      department?: string;
      staffType?: StaffType;
    },
  ) {
    const staff = await this.staffService.getStaffBySchool(schoolId, {
      department: query.department,
      staffType: query.staffType,
      status: StaffStatus.ACTIVE,
    });

    const report = {
      totalStaff: staff.length,
      totalGrossSalary: staff.reduce((sum, s) => sum + (s.compensation?.grossSalary || 0), 0),
      totalNetSalary: staff.reduce((sum, s) => sum + (s.compensation?.netSalary || 0), 0),
      averageGrossSalary: staff.length > 0 ? staff.reduce((sum, s) => sum + (s.compensation?.grossSalary || 0), 0) / staff.length : 0,
      averageNetSalary: staff.length > 0 ? staff.reduce((sum, s) => sum + (s.compensation?.netSalary || 0), 0) / staff.length : 0,
      salaryByDepartment: staff.reduce((acc, s) => {
        // Handle departments array - use first department or 'Unassigned'
        const deptName = s.departments?.[0]?.name || 'Unassigned';
        acc[deptName] = (acc[deptName] || 0) + (s.compensation?.netSalary || 0);
        return acc;
      }, {} as Record<string, number>),
      staffDetails: staff.map(s => ({
        employeeId: s.employeeId,
        name: s.fullName,
        department: s.departments?.[0]?.name || 'Unassigned',
        designation: s.designation,
        grossSalary: s.compensation?.grossSalary || 0,
        netSalary: s.compensation?.netSalary || 0,
        joiningDate: s.joiningDate,
      })),
      generatedAt: new Date().toISOString(),
    };

    return report;
  }

  // ==================== DEPARTMENT OPERATIONS ====================

  @Get(':id/departments')
  @ApiOperation({
    summary: 'Get staff departments',
    description: 'Retrieve all departments assigned to a specific staff member',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff departments retrieved successfully',
    type: [StaffDepartmentResponseDto],
  })
  async getStaffDepartments(@Param('id', ParseUUIDPipe) staffId: string) {
    const departments = await this.staffService.getStaffDepartments(staffId);
    return departments.map(dept => ({
      id: dept.id,
      type: dept.type,
      name: dept.name,
      description: dept.description,
      staffCount: dept.staff?.length || 0,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    }));
  }

  @Get(':id/with-departments')
  @ApiOperation({
    summary: 'Get staff with departments',
    description: 'Retrieve a staff member with their assigned departments',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff with departments retrieved successfully',
  })
  async getStaffWithDepartments(@Param('id', ParseUUIDPipe) staffId: string) {
    return this.staffService.getStaffWithDepartments(staffId);
  }

  @Post(':id/departments')
  @ApiOperation({
    summary: 'Assign staff to department',
    description: 'Assign a staff member to a specific department',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff assigned to department successfully',
  })
  async assignStaffToDepartment(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Body() dto: AssignStaffToDepartmentDto,
    @Request() req: any,
  ) {
    const assignedBy = req.user?.id || 'system';
    return this.staffService.assignStaffToDepartment(staffId, dto.departmentId, assignedBy);
  }

  @Delete(':id/departments/:departmentId')
  @ApiOperation({
    summary: 'Remove staff from department',
    description: 'Remove a staff member from a specific department',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    example: 'department-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff removed from department successfully',
  })
  async removeStaffFromDepartment(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Request() req: any,
  ) {
    const removedBy = req.user?.id || 'system';
    return this.staffService.removeStaffFromDepartment(staffId, departmentId, removedBy);
  }

  @Put(':id/departments')
  @ApiOperation({
    summary: 'Update staff departments',
    description: 'Replace all departments assigned to a staff member',
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID',
    example: 'staff-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff departments updated successfully',
  })
  async updateStaffDepartments(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Body() body: { departmentIds: string[] },
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.staffService.updateStaffDepartments(staffId, body.departmentIds, updatedBy);
  }

  @Get('department-id/:departmentId/staff')
  @ApiOperation({
    summary: 'Get staff by department ID',
    description: 'Retrieve all staff members assigned to a specific department',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    example: 'department-uuid-456',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by staff status',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Department staff retrieved successfully',
  })
  async getStaffByDepartmentId(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.staffService.getStaffByDepartmentId(departmentId, options);
  }
}