import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Staff } from '../entities/staff.entity';
import { EDepartmentType } from '@academia-pro/types/staff';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new department
   */
  async createDepartment(dto: CreateDepartmentDto, createdBy: string): Promise<Department> {
    // Check if department with same type and name already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { type: dto.type, name: dto.name },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this type and name already exists');
    }

    const department = this.departmentRepository.create({
      ...dto,
      createdBy,
      updatedBy: createdBy,
    });

    const savedDepartment = await this.departmentRepository.save(department);

    // Handle case where save returns an array
    const departmentEntity = Array.isArray(savedDepartment) ? savedDepartment[0] : savedDepartment;

    this.logger.log(`Created department ${departmentEntity.name} (${departmentEntity.id})`);

    // Audit the creation
    await this.auditDepartmentCreation(departmentEntity.id, dto, createdBy);

    return departmentEntity;
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(departmentId: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['staff'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    return department;
  }

  /**
   * Get all departments
   */
  async getAllDepartments(options?: {
    type?: EDepartmentType;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Department[]> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.staff', 'staff')
      .orderBy('department.name', 'ASC');
      
    if (options?.type) {
      queryBuilder.andWhere('department.type = :type', { type: options.type });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(department.name ILIKE :search OR department.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get all departments with pagination
   */
  async getAllDepartmentsPaginated(options?: {
    type?: EDepartmentType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Department[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.staff', 'staff')
      .orderBy('department.name', 'ASC');

    if (options?.type) {
      queryBuilder.andWhere('department.type = :type', { type: options.type });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(department.name ILIKE :search OR department.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Get total count for pagination
    const totalQueryBuilder = this.departmentRepository
      .createQueryBuilder('department');

    if (options?.type) {
      totalQueryBuilder.andWhere('department.type = :type', { type: options.type });
    }

    if (options?.search) {
      totalQueryBuilder.andWhere(
        '(department.name ILIKE :search OR department.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    const total = await totalQueryBuilder.getCount();

    // Apply pagination
    queryBuilder.limit(limit).offset(offset);

    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
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
   * Get departments by type
   */
  async getDepartmentsByType(type: EDepartmentType): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { type },
      relations: ['staff'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Update department
   */
  async updateDepartment(
    departmentId: string,
    dto: UpdateDepartmentDto,
    updatedBy: string,
  ): Promise<Department> {
    const department = await this.getDepartmentById(departmentId);

    // Check for conflicts if updating name or type
    if (dto.name || dto.type) {
      const newType = dto.type || department.type;
      const newName = dto.name || department.name;

      const existingDepartment = await this.departmentRepository.findOne({
        where: { type: newType, name: newName },
      });

      if (existingDepartment && existingDepartment.id !== departmentId) {
        throw new ConflictException('Department with this type and name already exists');
      }
    }

    Object.assign(department, dto);
    department.updatedBy = updatedBy;

    const updatedDepartment = await this.departmentRepository.save(department);

    this.logger.log(`Updated department ${departmentId}`);

    // Audit the update
    await this.auditDepartmentUpdate(departmentId, dto, updatedBy);

    return updatedDepartment;
  }

  /**
   * Delete department
   */
  async deleteDepartment(departmentId: string): Promise<void> {
    const department = await this.getDepartmentById(departmentId);

    // Check if department has staff members
    if (department.staff && department.staff.length > 0) {
      throw new ConflictException('Cannot delete department with assigned staff members');
    }

    await this.departmentRepository.remove(department);

    this.logger.log(`Deleted department ${departmentId}`);

    // Audit the deletion
    await this.auditDepartmentDeletion(departmentId, department, 'system');
  }

  /**
   * Assign staff to department
   */
  async assignStaffToDepartment(
    departmentId: string,
    staffId: string,
    assignedBy: string,
  ): Promise<Department> {
    const department = await this.getDepartmentById(departmentId);
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['departments'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found`);
    }

    // Check if staff is already assigned to this department
    const isAlreadyAssigned = staff.departments?.some(d => d.id === departmentId);
    if (isAlreadyAssigned) {
      throw new ConflictException('Staff member is already assigned to this department');
    }

    // Add department to staff's departments
    if (!staff.departments) {
      staff.departments = [];
    }
    staff.departments.push(department);
    staff.updatedBy = assignedBy;

    await this.staffRepository.save(staff);

    this.logger.log(`Assigned staff ${staffId} to department ${departmentId}`);

    // Audit the assignment
    await this.auditStaffAssignment(departmentId, staffId, assignedBy);

    return this.getDepartmentById(departmentId);
  }

  /**
   * Remove staff from department
   */
  async removeStaffFromDepartment(
    departmentId: string,
    staffId: string,
    removedBy: string,
  ): Promise<Department> {
    const department = await this.getDepartmentById(departmentId);
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['departments'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found`);
    }

    // Remove department from staff's departments
    if (staff.departments) {
      staff.departments = staff.departments.filter(d => d.id !== departmentId);
      staff.updatedBy = removedBy;

      await this.staffRepository.save(staff);
    }

    this.logger.log(`Removed staff ${staffId} from department ${departmentId}`);

    // Audit the removal
    await this.auditStaffRemoval(departmentId, staffId, removedBy);

    return this.getDepartmentById(departmentId);
  }

  /**
   * Get department statistics
   */
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
    const departments = await this.getAllDepartments();
    const totalDepartments = departments.length;

    // Initialize all department types with zero to ensure consistent shape
    // Filter to only string enum values to avoid numeric enum keys in case of future refactors
    const allTypes = (Object.values(EDepartmentType) as unknown[]).filter(
      (v) => typeof v === 'string'
    ) as string[];

    const departmentsByType: Record<string, number> = allTypes.reduce(
      (acc, t) => {
        acc[t] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );


    // Increment counts for existing departments
    for (const dept of departments) {
      const key = String(dept.type);
      departmentsByType[key] = (departmentsByType[key] ?? 0) + 1;
    }

    // Calculate average staff per department
    const totalStaff = departments.reduce((sum, dept) => sum + (dept.staff?.length || 0), 0);
    const averageStaffPerDepartmentRaw = totalDepartments > 0 ? totalStaff / totalDepartments : 0;
    const averageStaffPerDepartment = totalDepartments === 0 ? 0 : Math.round(averageStaffPerDepartmentRaw * 100) / 100;

    // Get departments with most staff
    const departmentsWithMostStaff = departments
      .map(dept => ({
        departmentId: dept.id,
        departmentName: dept.name,
        staffCount: dept.staff?.length || 0,
      }))
      .sort((a, b) => b.staffCount - a.staffCount)
      .slice(0, 10);

    console.log({
      totalDepartments,
      departmentsByType,
      averageStaffPerDepartment,
      departmentsWithMostStaff,
    })

    return {
      totalDepartments,
      departmentsByType,
      averageStaffPerDepartment,
      departmentsWithMostStaff,
    };
  }

  // ==================== AUDIT METHODS ====================

  private async auditDepartmentCreation(
    departmentId: string,
    details: any,
    userId: string,
  ): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_CREATED,
      resource: 'department',
      resourceId: departmentId,
      severity: AuditSeverity.MEDIUM,
      userId,
      details: {
        departmentDetails: this.sanitizeAuditData(details),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'department_creation',
      },
    });
  }

  private async auditDepartmentUpdate(
    departmentId: string,
    details: any,
    userId: string,
  ): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'department',
      resourceId: departmentId,
      severity: AuditSeverity.LOW,
      userId,
      details: {
        updateDetails: this.sanitizeAuditData(details),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'department_update',
      },
    });
  }

  private async auditDepartmentDeletion(
    departmentId: string,
    department: Department,
    userId: string,
  ): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_DELETED,
      resource: 'department',
      resourceId: departmentId,
      severity: AuditSeverity.HIGH,
      userId,
      details: {
        departmentDetails: this.sanitizeAuditData({
          id: department.id,
          name: department.name,
          type: department.type,
        }),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'department_deletion',
      },
    });
  }

  private async auditStaffAssignment(
    departmentId: string,
    staffId: string,
    userId: string,
  ): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'department_staff',
      resourceId: departmentId,
      severity: AuditSeverity.LOW,
      userId,
      details: {
        staffId,
        departmentId,
        action: 'assigned',
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_department_assignment',
      },
    });
  }

  private async auditStaffRemoval(
    departmentId: string,
    staffId: string,
    userId: string,
  ): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'department_staff',
      resourceId: departmentId,
      severity: AuditSeverity.LOW,
      userId,
      details: {
        staffId,
        departmentId,
        action: 'removed',
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_department_removal',
      },
    });
  }

  private sanitizeAuditData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'ssn', 'socialSecurity', 'bankAccount', 'creditCard'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}