// Academia Pro - Schools Service
// Business logic for school management and multi-school operations

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolStatus, SubscriptionPlan } from './school.entity';
import { TSchoolType } from '@academia-pro/types/schools';
import { CreateSchoolDto, UpdateSchoolDto } from './dtos';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private schoolsRepository: Repository<School>,
  ) {}

  /**
    * Create a new school
    */
  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const { name, code, ...schoolData } = createSchoolDto;

    // Check if school with same name already exists
    const existingByName = await this.schoolsRepository.findOne({
      where: { name },
    });

    if (existingByName) {
      throw new ConflictException('School with this name already exists');
    }

    // Check if school with same code already exists
    if (code) {
      const existingByCode = await this.schoolsRepository.findOne({
        where: { code },
      });

      if (existingByCode) {
        throw new ConflictException('School with this code already exists');
      }
    }

    // Create school
    const school = this.schoolsRepository.create({
      name,
      code: code || this.generateSchoolCode(name),
      description: schoolData.description,
      type: schoolData.type,
      phone: schoolData.phone,
      email: schoolData.email,
      website: schoolData.website,
      address: schoolData.address,
      city: schoolData.city,
      state: schoolData.state,
      zipCode: (schoolData as any).zipCode,
      country: schoolData.country,
      principalName: schoolData.principalName,
      principalPhone: schoolData.principalPhone,
      principalEmail: schoolData.principalEmail,
      currentStudents: schoolData.totalStudents || 0,
      currentStaff: schoolData.totalStaff || 0,
      subscriptionPlan: ((schoolData as any).subscriptionPlan as unknown as SubscriptionPlan) || SubscriptionPlan.BASIC,
      createdBy: 'system', // TODO: Get from current user
    });

    return this.schoolsRepository.save(school);
  }

  /**
   * Get all schools with pagination and filtering
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    type?: TSchoolType;
    status?: SchoolStatus;
    search?: string;
  }): Promise<{ data: School[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> {
    const { page = 1, limit = 10, type, status, search } = options || {};

    const queryBuilder = this.schoolsRepository.createQueryBuilder('school');

    // Apply filters
    if (type) {
      queryBuilder.andWhere('school.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('school.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(school.name ILIKE :search OR school.code ILIKE :search OR school.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('school.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [schools, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get school by ID
   */
  async findOne(id: string): Promise<School> {
    const school = await this.schoolsRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  /**
   * Get school by code
   */
  async findByCode(code: string): Promise<School> {
    const school = await this.schoolsRepository.findOne({
      where: { code },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  /**
   * Update school information
   */
  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);

    // Check for unique constraints if updating name or code
    if (updateSchoolDto.name && updateSchoolDto.name !== school.name) {
      const existingSchool = await this.schoolsRepository.findOne({
        where: { name: updateSchoolDto.name },
      });
      if (existingSchool) {
        throw new ConflictException('School with this name already exists');
      }
    }

    if (updateSchoolDto.code && updateSchoolDto.code !== school.code) {
      const existingSchool = await this.schoolsRepository.findOne({
        where: { code: updateSchoolDto.code },
      });
      if (existingSchool) {
        throw new ConflictException('School with this code already exists');
      }
    }

    // Update school
    Object.assign(school, updateSchoolDto);

    return this.schoolsRepository.save(school);
  }

  /**
   * Delete school (soft delete by changing status)
   */
  async remove(id: string): Promise<void> {
    const school = await this.findOne(id);

    // Instead of hard delete, change status to inactive
    school.status = SchoolStatus.INACTIVE;

    await this.schoolsRepository.save(school);
  }

  /**
   * Activate school
   */
  async activate(id: string): Promise<School> {
    const school = await this.findOne(id);

    if (school.status === SchoolStatus.ACTIVE) {
      throw new BadRequestException('School is already active');
    }

    school.status = SchoolStatus.ACTIVE;

    return this.schoolsRepository.save(school);
  }

  /**
   * Deactivate school
   */
  async deactivate(id: string): Promise<School> {
    const school = await this.findOne(id);

    if (school.status === SchoolStatus.INACTIVE) {
      throw new BadRequestException('School is already inactive');
    }

    school.status = SchoolStatus.INACTIVE;

    return this.schoolsRepository.save(school);
  }

  /**
   * Update school settings
   */
  async updateSettings(id: string, settings: any): Promise<School> {
    const school = await this.findOne(id);

    // Merge new settings with existing ones
    school.settings = {
      ...school.settings,
      ...settings,
    };

    return this.schoolsRepository.save(school);
  }

  /**
   * Get school statistics
   */
  async getStatistics(id: string): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    activeFeatures: string[];
  }> {
    const school = await this.findOne(id);

    // TODO: Implement actual statistics calculation
    // This would involve querying related entities

    const activeFeatures = [];
    if (school.settings?.features?.includes('online-learning')) activeFeatures.push('online-learning');
    if (school.settings?.features?.includes('transportation')) activeFeatures.push('transportation');
    if (school.settings?.features?.includes('hostel')) activeFeatures.push('hostel');

    return {
      totalStudents: school.currentStudents || 0,
      totalTeachers: 0, // TODO: Implement calculation from staff entities
      totalStaff: school.currentStaff || 0,
      activeFeatures,
    };
  }

  /**
   * Search schools
   */
  async search(query: string, options?: {
    type?: TSchoolType;
    status?: SchoolStatus;
    limit?: number;
  }): Promise<School[]> {
    const { type, status, limit = 20 } = options || {};

    const queryBuilder = this.schoolsRepository.createQueryBuilder('school');

    // Search in multiple fields
    queryBuilder.where(
      '(school.name ILIKE :query OR school.code ILIKE :query OR school.email ILIKE :query OR school.phone ILIKE :query)',
      { query: `%${query}%` },
    );

    if (type) {
      queryBuilder.andWhere('school.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('school.status = :status', { status });
    }

    queryBuilder
      .orderBy('school.name', 'ASC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get schools by type
   */
  async getSchoolsByType(type: TSchoolType): Promise<School[]> {
    return this.schoolsRepository.find({
      where: { type, status: SchoolStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get active schools
   */
  async getActiveSchools(): Promise<School[]> {
    return this.schoolsRepository.find({
      where: { status: SchoolStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  // Private helper methods
  private generateSchoolCode(name: string): string {
    // Generate a unique school code from the name
    const baseCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${baseCode}${suffix}`;
  }
}