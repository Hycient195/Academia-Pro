import { IsOptional, IsString, IsEnum, IsDateString, IsUUID, IsArray, IsIn, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { AuditAction as StudentAuditAction, AuditEntityType, AuditSeverity as StudentAuditSeverity } from '../../students/entities/student-audit-log.entity';

export class AuditFiltersDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  // Student-specific filters
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsEnum(StudentAuditAction)
  studentAction?: StudentAuditAction;

  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsEnum(StudentAuditSeverity)
  studentSeverity?: StudentAuditSeverity;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  userRole?: string;

  @IsOptional()
  @IsString()
  userDepartment?: string;

  // Pagination and sorting
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // Advanced filtering
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessRulesViolated?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceIssues?: string[];

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsBoolean()
  gdprCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresParentConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  parentConsentObtained?: boolean;
}

export class AuditTimelineFiltersDto extends AuditFiltersDto {
  @IsOptional()
  @IsString()
  @IsIn(['hour', 'day', 'week', 'month'])
  groupBy?: 'hour' | 'day' | 'week' | 'month' = 'day';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  timeRange?: number = 30; // days

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeActions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeActions?: string[];
}

export class AuditSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[] = ['userId', 'resource', 'resourceId', 'details', 'ipAddress'];

  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean = false;

  @IsOptional()
  @IsBoolean()
  exactMatch?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 100;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlightFields?: string[];
}