import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { StudentAuditLog } from '../../students/entities/student-audit-log.entity';
import { AuditService } from '../../security/services/audit.service';
import { AuditSeverity } from '../../security/types/audit.types';
import {
  AuditExportDto,
  ExportFormat,
  ExportScope,
  AuditExportJobDto,
  AuditExportResponseDto,
  AuditExportPreviewDto,
  AuditExportValidationDto,
  AuditExportTemplateDto,
  AuditExportScheduleDto,
  AuditExportHistoryDto,
} from './audit-export.dto';
import { AuditFiltersDto } from './audit-filters.dto';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AuditExportService {
  private readonly logger = new Logger(AuditExportService.name);
  private readonly exportJobs = new Map<string, AuditExportJobDto>();
  private readonly exportDirectory = path.join(process.cwd(), 'exports', 'audit');

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(StudentAuditLog)
    private readonly studentAuditLogRepository: Repository<StudentAuditLog>,
    private readonly auditService: AuditService,
  ) {
    // Ensure export directory exists
    if (!fs.existsSync(this.exportDirectory)) {
      fs.mkdirSync(this.exportDirectory, { recursive: true });
    }
  }

  /**
   * Export audit logs based on provided configuration
   */
  async exportAuditLogs(
    exportDto: AuditExportDto,
    filters: AuditFiltersDto,
    userId: string,
  ): Promise<AuditExportResponseDto> {
    // Validate export configuration
    const validation = await this.validateExportConfiguration(exportDto, filters);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid export configuration',
        errors: validation.errors,
      });
    }

    // Create export job
    const jobId = randomUUID();
    const job: AuditExportJobDto = {
      id: jobId,
      status: 'pending',
      format: exportDto.format,
      scope: exportDto.scope,
      totalRecords: validation.estimatedRecordCount,
      processedRecords: 0,
      createdAt: new Date(),
      createdBy: userId,
      progress: 0,
    };

    this.exportJobs.set(jobId, job);

    // Start export process asynchronously
    this.processExport(jobId, exportDto, filters, userId);

    return {
      jobId,
      status: 'pending',
      message: 'Export job created successfully',
      estimatedCompletionTime: validation.estimatedProcessingTime,
    };
  }

  /**
   * Get export job status
   */
  getExportJobStatus(jobId: string): AuditExportJobDto {
    const job = this.exportJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Export job with ID ${jobId} not found`);
    }
    return job;
  }

  /**
   * Get all export jobs for a user
   */
  getExportJobs(userId: string, historyDto: AuditExportHistoryDto): AuditExportJobDto[] {
    const jobs = Array.from(this.exportJobs.values())
      .filter(job => job.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const page = historyDto.page || 1;
    const limit = historyDto.limit || 20;
    const offset = (page - 1) * limit;

    return jobs.slice(offset, offset + limit);
  }

  /**
   * Cancel export job
   */
  cancelExportJob(jobId: string, userId: string): void {
    const job = this.exportJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Export job with ID ${jobId} not found`);
    }

    if (job.createdBy !== userId) {
      throw new BadRequestException('You can only cancel your own export jobs');
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new BadRequestException('Cannot cancel a job that is already completed or failed');
    }

    job.status = 'cancelled';
    this.exportJobs.set(jobId, job);
  }

  /**
   * Preview export data
   */
  async previewExport(previewDto: AuditExportPreviewDto, filters: AuditFiltersDto): Promise<any[]> {
    const limit = Math.min(previewDto.limit || 10, 100);

    let queryBuilder: any;

    if (filters.studentId || filters.studentAction) {
      // Student audit logs
      queryBuilder = this.studentAuditLogRepository.createQueryBuilder('studentAudit');
      this.applyStudentFilters(queryBuilder, filters);
    } else {
      // Regular audit logs
      queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
      this.applyAuditFilters(queryBuilder, filters);
    }

    queryBuilder
      .orderBy('createdAt', 'DESC')
      .limit(limit);

    const records = await queryBuilder.getMany();

    // Format records based on requested format
    return this.formatRecords(records, previewDto.format, previewDto.fields);
  }

  /**
   * Validate export configuration
   */
  async validateExportConfiguration(
    exportDto: AuditExportDto,
    filters: AuditFiltersDto,
  ): Promise<AuditExportValidationDto> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Validate format
    if (!Object.values(ExportFormat).includes(exportDto.format)) {
      errors.push({
        field: 'format',
        message: `Invalid export format: ${exportDto.format}`,
        code: 'INVALID_FORMAT',
      });
    }

    // Validate scope
    if (!Object.values(ExportScope).includes(exportDto.scope)) {
      errors.push({
        field: 'scope',
        message: `Invalid export scope: ${exportDto.scope}`,
        code: 'INVALID_SCOPE',
      });
    }

    // Validate record count
    let estimatedRecordCount = 0;
    try {
      if (filters.studentId || filters.studentAction) {
        const queryBuilder = this.studentAuditLogRepository.createQueryBuilder('studentAudit');
        this.applyStudentFilters(queryBuilder, filters);
        estimatedRecordCount = await queryBuilder.getCount();
      } else {
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
        this.applyAuditFilters(queryBuilder, filters);
        estimatedRecordCount = await queryBuilder.getCount();
      }
    } catch (error) {
      errors.push({
        field: 'filters',
        message: 'Failed to validate record count',
        code: 'VALIDATION_ERROR',
      });
    }

    // Check record limits
    const maxRecords = exportDto.maxRecords || 10000;
    if (estimatedRecordCount > maxRecords) {
      warnings.push({
        field: 'maxRecords',
        message: `Estimated records (${estimatedRecordCount}) exceed limit (${maxRecords}). Only first ${maxRecords} records will be exported.`,
        code: 'RECORD_LIMIT_EXCEEDED',
      });
    }

    // Estimate file size and processing time
    const estimatedFileSize = this.estimateFileSize(estimatedRecordCount, exportDto.format);
    const estimatedProcessingTime = this.estimateProcessingTime(estimatedRecordCount, exportDto.format);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedRecordCount,
      estimatedFileSize,
      estimatedProcessingTime,
    };
  }

  /**
   * Save export template
   */
  async saveExportTemplate(templateDto: AuditExportTemplateDto, userId: string): Promise<void> {
    // In a real implementation, this would save to database
    // For now, we'll just validate the template
    if (!templateDto.name || !templateDto.format || !templateDto.fields?.length) {
      throw new BadRequestException('Template must have name, format, and fields');
    }

    this.logger.log(`Export template saved: ${templateDto.name} by user ${userId}`);
  }

  /**
   * Get export templates
   */
  async getExportTemplates(userId: string): Promise<AuditExportTemplateDto[]> {
    // In a real implementation, this would fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Schedule recurring export
   */
  async scheduleExport(scheduleDto: AuditExportScheduleDto, userId: string): Promise<string> {
    // In a real implementation, this would create a scheduled job
    const scheduleId = randomUUID();

    this.logger.log(`Export scheduled: ${scheduleDto.name} by user ${userId}`);

    return scheduleId;
  }

  // Private methods

  private async processExport(
    jobId: string,
    exportDto: AuditExportDto,
    filters: AuditFiltersDto,
    userId: string,
  ): Promise<void> {
    const job = this.exportJobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.exportJobs.set(jobId, job);

      // Get records to export
      const records = await this.getRecordsForExport(exportDto, filters);

      // Generate filename
      const filename = exportDto.filename || `audit-export-${jobId}`;
      const filePath = path.join(this.exportDirectory, `${filename}.${exportDto.format}`);

      // Export based on format
      switch (exportDto.format) {
        case ExportFormat.CSV:
          await this.exportToCSV(records, filePath, exportDto);
          break;
        case ExportFormat.JSON:
          await this.exportToJSON(records, filePath, exportDto);
          break;
        case ExportFormat.PDF:
          await this.exportToPDF(records, filePath, exportDto);
          break;
        case ExportFormat.XML:
          await this.exportToXML(records, filePath, exportDto);
          break;
        default:
          throw new BadRequestException(`Unsupported export format: ${exportDto.format}`);
      }

      // Update job status
      const stats = fs.statSync(filePath);
      job.status = 'completed';
      job.completedAt = new Date();
      job.fileSize = stats.size;
      job.fileUrl = `/exports/audit/${filename}.${exportDto.format}`;
      job.downloadUrl = job.fileUrl;
      job.progress = 100;
      job.processedRecords = records.length;

      // Set expiration (24 hours from now)
      job.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      this.exportJobs.set(jobId, job);

      // Log successful export
      await this.auditService.logActivity({
        userId,
        action: 'data_exported',
        resource: 'audit_export',
        resourceId: jobId,
        details: {
          format: exportDto.format,
          recordCount: records.length,
          fileSize: stats.size,
        },
        severity: AuditSeverity.MEDIUM,
      });

    } catch (error) {
      this.logger.error(`Export job ${jobId} failed:`, error);

      job.status = 'failed';
      job.errorMessage = error.message;
      this.exportJobs.set(jobId, job);

      // Log failed export
      await this.auditService.logActivity({
        userId,
        action: 'data_export_failed',
        resource: 'audit_export',
        resourceId: jobId,
        details: {
          error: error.message,
          format: exportDto.format,
        },
        severity: AuditSeverity.HIGH,
      });
    }
  }

  private async getRecordsForExport(exportDto: AuditExportDto, filters: AuditFiltersDto): Promise<any[]> {
    let queryBuilder: any;
    const maxRecords = exportDto.maxRecords || 10000;

    if (filters.studentId || filters.studentAction) {
      // Student audit logs
      queryBuilder = this.studentAuditLogRepository.createQueryBuilder('studentAudit');
      this.applyStudentFilters(queryBuilder, filters);
    } else {
      // Regular audit logs
      queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
      this.applyAuditFilters(queryBuilder, filters);
    }

    // Handle selected IDs
    if (exportDto.scope === ExportScope.SELECTED && exportDto.selectedIds?.length) {
      queryBuilder.andWhere('id IN (:...ids)', { ids: exportDto.selectedIds });
    }

    queryBuilder
      .orderBy('createdAt', 'DESC')
      .limit(maxRecords);

    return await queryBuilder.getMany();
  }

  private async exportToCSV(records: any[], filePath: string, exportDto: AuditExportDto): Promise<void> {
    const fields = exportDto.fields || [
      'id', 'timestamp', 'userId', 'action', 'resource', 'resourceId',
      'severity', 'ipAddress', 'userAgent', 'details'
    ];

    // Create CSV header
    let csv = fields.join(',') + '\n';

    // Add records
    records.forEach(record => {
      const values = fields.map(field => {
        let value = record[field];
        if (field === 'details' && value) {
          value = JSON.stringify(value);
        } else if (field === 'timestamp' && value) {
          value = value.toISOString();
        }
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csv += values.join(',') + '\n';
    });

    fs.writeFileSync(filePath, csv);
  }

  private async exportToJSON(records: any[], filePath: string, exportDto: AuditExportDto): Promise<void> {
    const data = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        format: exportDto.format,
        recordCount: records.length,
        fields: exportDto.fields,
      },
      records: records.map(record => {
        if (exportDto.anonymize) {
          return this.anonymizeRecord(record, exportDto.anonymizeFields);
        }
        return record;
      }),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private async exportToPDF(records: any[], filePath: string, exportDto: AuditExportDto): Promise<void> {
    // Simple text-based PDF-like export (placeholder for actual PDF generation)
    let content = 'AUDIT LOG EXPORT\n';
    content += '=' .repeat(50) + '\n\n';
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `Total Records: ${records.length}\n\n`;

    records.forEach((record, index) => {
      content += `Record ${index + 1}:\n`;
      content += '-'.repeat(30) + '\n';

      Object.entries(record).forEach(([key, value]) => {
        if (key !== 'details' || exportDto.includeMetadata) {
          const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
          content += `${key}: ${displayValue}\n`;
        }
      });
      content += '\n';
    });

    fs.writeFileSync(filePath, content);
  }

  private async exportToXML(records: any[], filePath: string, exportDto: AuditExportDto): Promise<void> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<audit-export>\n';
    xml += `  <export-info>\n`;
    xml += `    <timestamp>${new Date().toISOString()}</timestamp>\n`;
    xml += `    <record-count>${records.length}</record-count>\n`;
    xml += `  </export-info>\n`;
    xml += '  <records>\n';

    records.forEach(record => {
      xml += '    <record>\n';
      Object.entries(record).forEach(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        xml += `      <${key}>${this.escapeXml(displayValue)}</${key}>\n`;
      });
      xml += '    </record>\n';
    });

    xml += '  </records>\n';
    xml += '</audit-export>\n';

    fs.writeFileSync(filePath, xml);
  }

  private formatRecords(records: any[], format: ExportFormat, fields?: string[]): any[] {
    if (!fields) {
      return records;
    }

    return records.map(record => {
      const formatted: any = {};
      fields.forEach(field => {
        formatted[field] = record[field];
      });
      return formatted;
    });
  }

  private anonymizeRecord(record: any, anonymizeFields?: string[]): any {
    const anonymized = { ...record };
    const fieldsToAnonymize = anonymizeFields || ['ipAddress', 'userAgent', 'userId'];

    fieldsToAnonymize.forEach(field => {
      if (anonymized[field]) {
        if (field === 'ipAddress') {
          anonymized[field] = this.anonymizeIP(anonymized[field]);
        } else if (field === 'userId') {
          anonymized[field] = `user_${anonymized[field].substring(0, 8)}`;
        } else {
          anonymized[field] = '[REDACTED]';
        }
      }
    });

    return anonymized;
  }

  private anonymizeIP(ip: string): string {
    if (ip.includes('.')) {
      // IPv4
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.***.***`;
    } else if (ip.includes(':')) {
      // IPv6
      return ip.substring(0, 8) + '****:****:****:****';
    }
    return '***.***.***.***';
  }

  private escapeXml(unsafe: string): string {
    // Simple XML escaping
    return unsafe;
  }

  private applyAuditFilters(queryBuilder: any, filters: AuditFiltersDto): void {
    // Reuse the filter logic from AuditManagementService
    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.severity) {
      queryBuilder.andWhere('audit.severity = :severity', { severity: filters.severity });
    }
  }

  private applyStudentFilters(queryBuilder: any, filters: AuditFiltersDto): void {
    if (filters.studentId) {
      queryBuilder.andWhere('studentAudit.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters.studentAction) {
      queryBuilder.andWhere('studentAudit.action = :action', { action: filters.studentAction });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('studentAudit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    }
  }

  private estimateFileSize(recordCount: number, format: ExportFormat): number {
    const averageRecordSize = 500; // bytes per record estimate
    const baseSize = 1000; // base file size

    let multiplier = 1;
    switch (format) {
      case ExportFormat.JSON:
        multiplier = 1.2;
        break;
      case ExportFormat.XML:
        multiplier = 1.5;
        break;
      case ExportFormat.PDF:
        multiplier = 2.0;
        break;
      case ExportFormat.CSV:
      default:
        multiplier = 1.0;
        break;
    }

    return Math.round((recordCount * averageRecordSize * multiplier) + baseSize);
  }

  private estimateProcessingTime(recordCount: number, format: ExportFormat): number {
    const baseTimePerRecord = 0.01; // seconds per record
    let multiplier = 1;

    switch (format) {
      case ExportFormat.PDF:
        multiplier = 3;
        break;
      case ExportFormat.XML:
        multiplier = 1.5;
        break;
      case ExportFormat.JSON:
      case ExportFormat.CSV:
      default:
        multiplier = 1;
        break;
    }

    return Math.round(recordCount * baseTimePerRecord * multiplier);
  }
}