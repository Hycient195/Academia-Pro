// Academia Pro - Schools Controller
// REST API endpoints for school management

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators';
import { EUserRole } from '@academia-pro/types/users';
import { SchoolStatus } from './school.entity';

// Audit imports
import { Auditable, SampleAudit } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';

@ApiTags('schools')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new school' })
  @ApiResponse({
    status: 201,
    description: 'School created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'School already exists' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @SampleAudit(0.5) // Sample 50% of requests for high-volume school listing
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schools with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['primary', 'secondary', 'mixed'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'under_maintenance'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Schools retrieved successfully',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.schoolsService.findAll({
      page,
      limit,
      type: type as any,
      status: status as any,
      search,
    });
  }

  @Get('active')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.TEACHER, EUserRole.STUDENT, EUserRole.PARENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active schools' })
  @ApiResponse({
    status: 200,
    description: 'Active schools retrieved successfully',
  })
  getActiveSchools() {
    return this.schoolsService.getActiveSchools();
  }

  @Get('search')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @SampleAudit(0.3) // Sample 30% of search requests
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search schools' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['primary', 'secondary', 'mixed'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  search(
    @Query('query') query: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ) {
    return this.schoolsService.search(query, {
      type: type as any,
      limit,
    });
  }

  @Get(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get school by ID' })
  @ApiResponse({
    status: 200,
    description: 'School retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Get('code/:code')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN, EUserRole.TEACHER, EUserRole.STUDENT, EUserRole.PARENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get school by code' })
  @ApiResponse({
    status: 200,
    description: 'School retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  findByCode(@Param('code') code: string) {
    return this.schoolsService.findByCode(code);
  }

  @Patch(':id')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update school information' })
  @ApiResponse({
    status: 200,
    description: 'School updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'School code or name already exists' })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Patch(':id/activate')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a school' })
  @ApiResponse({
    status: 200,
    description: 'School activated successfully',
  })
  @ApiResponse({ status: 400, description: 'School is already active' })
  @ApiResponse({ status: 404, description: 'School not found' })
  activate(@Param('id') id: string) {
    return this.schoolsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a school' })
  @ApiResponse({
    status: 200,
    description: 'School deactivated successfully',
  })
  @ApiResponse({ status: 400, description: 'School is already inactive' })
  @ApiResponse({ status: 404, description: 'School not found' })
  deactivate(@Param('id') id: string) {
    return this.schoolsService.deactivate(id);
  }

  @Patch(':id/settings')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update school settings' })
  @ApiResponse({
    status: 200,
    description: 'School settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.schoolsService.updateSettings(id, settings);
  }

  @Get(':id/statistics')
  @Roles(EUserRole.SUPER_ADMIN, EUserRole.SCHOOL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get school statistics' })
  @ApiResponse({
    status: 200,
    description: 'School statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  getStatistics(@Param('id') id: string) {
    return this.schoolsService.getStatistics(id);
  }

  @Delete(':id')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete school (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'School deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'School not found' })
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }

  @Post('bulk/status')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update school status' })
  @ApiBody({
    description: 'Bulk status update data',
    schema: {
      type: 'object',
      required: ['schoolIds', 'status'],
      properties: {
        schoolIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of school IDs'
        },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended', 'under_maintenance'],
          description: 'New status for schools'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk status update completed',
  })
  async bulkUpdateStatus(
    @Body() body: { schoolIds: string[]; status: SchoolStatus },
    @Req() request: any
  ) {
    const userId = request.user?.id;
    return this.schoolsService.bulkUpdateStatus(body.schoolIds, body.status, userId);
  }

  @Post('bulk/settings')
  @Roles(EUserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update school settings' })
  @ApiBody({
    description: 'Bulk settings update data',
    schema: {
      type: 'object',
      required: ['schoolIds', 'settings'],
      properties: {
        schoolIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of school IDs'
        },
        settings: {
          type: 'object',
          description: 'Settings to apply to schools'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk settings update completed',
  })
  async bulkUpdateSettings(
    @Body() body: { schoolIds: string[]; settings: any },
    @Req() request: any
  ) {
    const userId = request.user?.id;
    return this.schoolsService.bulkUpdateSettings(body.schoolIds, body.settings, userId);
  }
}