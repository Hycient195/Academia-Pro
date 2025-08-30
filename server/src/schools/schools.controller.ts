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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('schools')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
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
  @Roles(UserRole.SUPER_ADMIN)
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
}