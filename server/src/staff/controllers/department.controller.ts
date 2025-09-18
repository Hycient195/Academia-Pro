import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { EDepartmentType } from '@academia-pro/types/staff';
import { Department } from '../entities/department.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department created successfully',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department with this type and name already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createDepartment(
    @Body() dto: CreateDepartmentDto,
    @Request() req: any,
  ): Promise<Department> {
    const userId = req.user?.userId || req.user?.id;
    return this.departmentService.createDepartment(dto, userId);
  }

  @Get()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.TEACHER)
  @ApiOperation({ summary: 'Get all departments with optional filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Departments retrieved successfully',
    type: [Department],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: EDepartmentType,
    description: 'Filter by department type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by department name or description',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of results',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination',
  })
  async getAllDepartments(
    @Query('type') type?: EDepartmentType,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Department[]> {
    return this.departmentService.getAllDepartments({
      type,
      search,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('type/:type')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.TEACHER)
  @ApiOperation({ summary: 'Get departments by type' })
  @ApiParam({
    name: 'type',
    enum: EDepartmentType,
    description: 'Department type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Departments retrieved successfully',
    type: [Department],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid department type',
  })
  async getDepartmentsByType(
    @Param('type', new ParseEnumPipe(EDepartmentType)) type: EDepartmentType,
  ): Promise<Department[]> {
    return this.departmentService.getDepartmentsByType(type);
  }

  @Get(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.TEACHER)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department retrieved successfully',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  async getDepartmentById(@Param('id') id: string): Promise<Department> {
    return this.departmentService.getDepartmentById(id);
  }

  @Put(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department updated successfully',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department with this type and name already exists',
  })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Request() req: any,
  ): Promise<Department> {
    const userId = req.user?.userId || req.user?.id;
    return this.departmentService.updateDepartment(id, dto, userId);
  }

  @Delete(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete department with assigned staff members',
  })
  async deleteDepartment(@Param('id') id: string): Promise<void> {
    return this.departmentService.deleteDepartment(id);
  }

  @Post(':id/staff/:staffId')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Assign staff member to department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
  })
  @ApiParam({
    name: 'staffId',
    description: 'Staff member ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff member assigned to department successfully',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department or staff member not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Staff member is already assigned to this department',
  })
  async assignStaffToDepartment(
    @Param('id') departmentId: string,
    @Param('staffId') staffId: string,
    @Request() req: any,
  ): Promise<Department> {
    const userId = req.user?.userId || req.user?.id;
    return this.departmentService.assignStaffToDepartment(departmentId, staffId, userId);
  }

  @Delete(':id/staff/:staffId')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Remove staff member from department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
  })
  @ApiParam({
    name: 'staffId',
    description: 'Staff member ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff member removed from department successfully',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department or staff member not found',
  })
  async removeStaffFromDepartment(
    @Param('id') departmentId: string,
    @Param('staffId') staffId: string,
    @Request() req: any,
  ): Promise<Department> {
    const userId = req.user?.userId || req.user?.id;
    return this.departmentService.removeStaffFromDepartment(departmentId, staffId, userId);
  }

  @Get('stats/overview')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get department statistics overview' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department statistics retrieved successfully',
  })
  async getDepartmentStatistics(): Promise<{
    totalDepartments: number;
    departmentsByType: Record<string, number>;
    averageStaffPerDepartment: number;
    departmentsWithMostStaff: Array<{
      departmentId: string;
      departmentName: string;
      staffCount: number;
    }>;
  }> {
    return this.departmentService.getDepartmentStatistics();
  }
}