import { IsOptional, IsString, IsEnum, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  XML = 'xml',
  EXCEL = 'excel',
}

export enum ExportScope {
  ALL = 'all',
  FILTERED = 'filtered',
  SELECTED = 'selected',
}

export class AuditExportDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsEnum(ExportScope)
  scope?: ExportScope = ExportScope.ALL;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsBoolean()
  includeHeaders?: boolean = true;

  @IsOptional()
  @IsBoolean()
  compress?: boolean = false;

  @IsOptional()
  @IsString()
  delimiter?: string = ',';

  @IsOptional()
  @IsString()
  dateFormat?: string = 'YYYY-MM-DD HH:mm:ss';

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean = true;

  @IsOptional()
  @IsBoolean()
  anonymize?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anonymizeFields?: string[] = ['ipAddress', 'userAgent', 'userId'];

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  maxRecords?: number = 10000;

  @IsOptional()
  @IsBoolean()
  splitFiles?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  recordsPerFile?: number = 5000;

  @IsOptional()
  @IsString()
  encryption?: 'none' | 'aes256' = 'none';

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean = false;
}

export class AuditExportTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}

export class AuditExportJobDto {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  format: ExportFormat;
  scope: ExportScope;
  totalRecords: number;
  processedRecords: number;
  fileSize?: number;
  fileUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  downloadUrl?: string;
  expiresAt?: Date;
}

export class AuditExportHistoryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class AuditExportResponseDto {
  jobId: string;
  status: string;
  message: string;
  estimatedCompletionTime?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  fileSize?: number;
  recordCount?: number;
}

export class AuditExportPreviewDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsBoolean()
  includeHeaders?: boolean = true;
}

export class AuditExportValidationDto {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  estimatedRecordCount: number;
  estimatedFileSize: number;
  estimatedProcessingTime: number;
}

export class AuditExportScheduleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  cronExpression: string; // e.g., "0 0 * * 1" for weekly

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[];

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  retentionDays?: number = 30;

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';
}