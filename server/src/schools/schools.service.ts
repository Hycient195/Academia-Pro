// Academia Pro - Schools Service
// Business logic for school management and multi-school operations

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolStatus, SubscriptionPlan } from './school.entity';
import { TSchoolType } from '@academia-pro/types/schools';
import { CreateSchoolDto, UpdateSchoolDto } from './dtos';

// Audit imports
import { AuditCreate, AuditUpdate, AuditDelete, AuditRead, Auditable } from '../common/audit/auditable.decorator';
import { AuditService } from '../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';
import { Inject } from '@nestjs/common';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private schoolsRepository: Repository<School>,
    @Inject(AuditService)
    private auditService: AuditService,
  ) {}

  /**
    * Create a new school
    */
  @AuditCreate('school')
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
  @AuditRead('schools')
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
  @AuditRead('school')
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
  @AuditRead('school')
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
  @AuditUpdate('school')
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
  @AuditDelete('school')
  async remove(id: string): Promise<void> {
    const school = await this.findOne(id);

    // Instead of hard delete, change status to inactive
    school.status = SchoolStatus.INACTIVE;

    await this.schoolsRepository.save(school);
  }

  /**
    * Activate school
    */
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'school',
    customAction: 'school_activated',
    severity: AuditSeverity.MEDIUM,
    metadata: { statusChange: 'active' }
  })
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
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'school',
    customAction: 'school_deactivated',
    severity: AuditSeverity.MEDIUM,
    metadata: { statusChange: 'inactive' }
  })
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
  @Auditable({
    action: AuditAction.DATA_UPDATED,
    resource: 'school',
    customAction: 'school_settings_updated',
    severity: AuditSeverity.HIGH,
    metadata: { settingsUpdate: true }
  })
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
  @AuditRead('school')
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
  @Auditable({
    action: AuditAction.DATA_ACCESSED,
    resource: 'schools',
    customAction: 'school_search_performed',
    severity: AuditSeverity.LOW,
    metadata: { searchOperation: true }
  })
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
  @AuditRead('schools')
  async getActiveSchools(): Promise<School[]> {
    return this.schoolsRepository.find({
      where: { status: SchoolStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  /**
   * Bulk update school status
   */
  async bulkUpdateStatus(schoolIds: string[], status: SchoolStatus, userId?: string): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const schoolId of schoolIds) {
      try {
        const school = await this.findOne(schoolId);
        const oldStatus = school.status;

        if (oldStatus === status) {
          // Skip if already in desired status
          success++;
          continue;
        }

        school.status = status;
        await this.schoolsRepository.save(school);

        // Log individual status change
        await this.auditStatusChange(schoolId, oldStatus, status, 'Bulk operation', userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`School ${schoolId}: ${error.message}`);
      }
    }

    // Log bulk operation summary
    await this.auditBulkOperation('bulk_status_update', schoolIds, { success, failed }, userId);

    return { success, failed, errors };
  }

  /**
   * Bulk update school settings
   */
  async bulkUpdateSettings(schoolIds: string[], settings: any, userId?: string): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const schoolId of schoolIds) {
      try {
        await this.updateSettings(schoolId, settings);
        success++;
      } catch (error) {
        failed++;
        errors.push(`School ${schoolId}: ${error.message}`);
      }
    }

    // Log bulk operation summary
    await this.auditBulkOperation('bulk_settings_update', schoolIds, { success, failed }, userId);

    return { success, failed, errors };
  }

  /**
   * Custom audit method for bulk school operations
   */
  async auditBulkOperation(operation: string, schoolIds: string[], result: { success: number; failed: number }, userId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'schools',
      resourceId: 'bulk_operation',
      severity: AuditSeverity.MEDIUM,
      userId,
      details: {
        operation,
        schoolIds,
        result,
        timestamp: new Date(),
        bulkOperation: true,
        operationType: operation,
      },
    });
  }

  /**
   * Custom audit method for school configuration changes
   */
  async auditConfigurationChange(schoolId: string, configType: string, changes: any, userId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resource: 'school',
      resourceId: schoolId,
      severity: AuditSeverity.HIGH,
      userId,
      details: {
        configType,
        changes,
        timestamp: new Date(),
        configurationChange: true,
      },
    });
  }

  /**
   * Custom audit method for school status changes
   */
  async auditStatusChange(schoolId: string, oldStatus: string, newStatus: string, reason?: string, userId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'school',
      resourceId: schoolId,
      severity: AuditSeverity.MEDIUM,
      userId,
      details: {
        statusChange: {
          from: oldStatus,
          to: newStatus,
          reason,
        },
        timestamp: new Date(),
        isStatusChange: true,
        oldStatus,
        newStatus,
      },
    });
  }

  /**
   * Custom audit method for school data access
   */
  async auditDataAccess(schoolId: string, accessType: string, dataFields?: string[], userId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_ACCESSED,
      resource: 'school',
      resourceId: schoolId,
      severity: AuditSeverity.LOW,
      userId,
      details: {
        accessType,
        dataFields,
        timestamp: new Date(),
        dataAccess: true,
      },
    });
  }

  /**
   * Custom audit method for school security events
   */
  async auditSecurityEvent(schoolId: string, eventType: string, details: any, userId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.SECURITY_ALERT,
      resource: 'school',
      resourceId: schoolId,
      severity: AuditSeverity.HIGH,
      userId,
      details: {
        eventType,
        ...details,
        timestamp: new Date(),
        securityEvent: true,
      },
    });
  }

  /**
   * Sanitize sensitive school data for audit logging
   */
  private sanitizeSchoolData(school: School): Partial<School> {
    const sanitized = { ...school };

    // Remove or mask sensitive fields
    if (sanitized.principalEmail) {
      sanitized.principalEmail = this.maskEmail(sanitized.principalEmail);
    }
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }
    if (sanitized.phone) {
      sanitized.phone = this.maskPhone(sanitized.phone);
    }
    if (sanitized.principalPhone) {
      sanitized.principalPhone = this.maskPhone(sanitized.principalPhone);
    }

    // Remove settings that might contain sensitive data
    if (sanitized.settings?.security) {
      sanitized.settings.security = {
        mfaRequired: sanitized.settings.security.mfaRequired,
        sessionTimeout: sanitized.settings.security.sessionTimeout,
        sanitized: true
      } as any;
    }

    return sanitized;
  }

  /**
   * Mask email addresses for audit logging
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2
      ? local.substring(0, 2) + '*'.repeat(local.length - 2)
      : local;
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask phone numbers for audit logging
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    const lastFour = phone.substring(phone.length - 4);
    const masked = '*'.repeat(phone.length - 4);
    return masked + lastFour;
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