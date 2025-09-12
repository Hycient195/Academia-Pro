import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuditManagementService } from './audit-management.service';
import { AuditExportService } from './audit-export.service';
import { AuditRetentionService } from './audit-retention.service';
import { AuditFiltersDto, AuditTimelineFiltersDto, AuditSearchDto } from './audit-filters.dto';
import { AuditExportDto, ExportFormat } from './audit-export.dto';
import { AuditService } from '../../security/services/audit.service';
import { AuditSeverity } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users';

@Controller('super-admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EUserRole.SUPER_ADMIN)
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(
    private readonly auditManagementService: AuditManagementService,
    private readonly auditExportService: AuditExportService,
    private readonly auditRetentionService: AuditRetentionService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * GET /super-admin/audit/logs
   * Get audit logs with filtering and pagination
   */
  @Get('logs')
  async getAuditLogs(@Query() filters: AuditFiltersDto) {
    console.log("I am audit!")
    this.logger.debug('Received audit filters:', JSON.stringify(filters, null, 2));
    try {
      const result = await this.auditManagementService.getAuditLogs(filters);

      // Debug: Log the raw query result
      this.logger.debug(`Query returned ${result.logs.length} logs out of ${result.total} total`);
      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID, // This should be the current user ID
        action: 'audit_logs_accessed',
        resource: 'audit_logs',
        details: {
          filters: filters,
          resultCount: result.logs.length,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching audit logs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit logs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/test-logs
   * Test endpoint to get raw audit logs without filtering
   */
  @Get('test-logs')
  async getTestAuditLogs() {
    try {
      const logs = await this.auditManagementService.getAuditLogs({});
      this.logger.debug(`Test endpoint: Found ${logs.total} total audit logs`);

      return {
        success: true,
        total: logs.total,
        logs: logs.logs.slice(0, 5), // Return first 5 logs
        message: 'Test endpoint - no filters applied'
      };
    } catch (error) {
      this.logger.error('Error in test endpoint:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch test audit logs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
    * GET /super-admin/audit/logs/:id
    * Get a specific audit log by ID
    */
  @Get('logs/:id')
  async getAuditLogById(@Param('id') id: string) {
     try {
       const log = await this.auditManagementService.getAuditLogById(id);

       return {
         success: true,
         data: log,
       };
     } catch (error) {
       this.logger.error(`Error fetching audit log ${id}:`, error);
       if (error instanceof HttpException) {
         throw error;
       }
       throw new HttpException(
         {
           success: false,
           message: 'Failed to fetch audit log',
           error: error.message,
         },
         HttpStatus.INTERNAL_SERVER_ERROR,
       );
     }
   }


  /**
   * GET /super-admin/audit/logs/search
   * Search audit logs with full-text search
   */
  @Get('logs/search')
  async searchAuditLogs(
    @Query() searchDto: AuditSearchDto,
    @Query() filters: AuditFiltersDto,
  ) {
    try {
      const result = await this.auditManagementService.searchAuditLogs(searchDto, filters);

      // Log the search
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'audit_logs_searched',
        resource: 'audit_logs',
        details: {
          query: searchDto.query,
          resultCount: result.logs.length,
          fields: searchDto.fields,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: result.logs,
        highlights: result.highlights,
        total: result.total,
      };
    } catch (error) {
      this.logger.error('Error searching audit logs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to search audit logs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/timeline
   * Get audit timeline with grouping
   */
  @Get('timeline')
  async getAuditTimeline(@Query() filters: AuditTimelineFiltersDto) {
    try {
      const result = await this.auditManagementService.getAuditTimeline(filters);

      return {
        success: true,
        data: result.timeline,
        total: result.total,
      };
    } catch (error) {
      this.logger.error('Error fetching audit timeline:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit timeline',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/student-logs
   * Get student audit logs
   */
  @Get('student-logs')
  async getStudentAuditLogs(@Query() filters: AuditFiltersDto) {
    try {
      const result = await this.auditManagementService.getStudentAuditLogs(filters);

      return {
        logs: result.logs,
        total: result.total,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching student audit logs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch student audit logs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/statistics
   * Get audit statistics
   */
  @Get('statistics')
  async getAuditStatistics(@Query() filters: AuditFiltersDto) {
    try {
      const statistics = await this.auditManagementService.getAuditStatistics(filters);

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error('Error fetching audit statistics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /super-admin/audit/export
   * Export audit logs
   */
  @Post('export')
  async exportAuditLogs(
    @Body() exportDto: AuditExportDto,
    @Body('filters') filters: AuditFiltersDto,
  ) {
    try {
      const result = await this.auditExportService.exportAuditLogs(
        exportDto,
        filters,
        SYSTEM_USER_ID, // This should be the current user ID
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error exporting audit logs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to export audit logs',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /super-admin/audit/export/:jobId
   * Get export job status
   */
  @Get('export/:jobId')
  async getExportJobStatus(@Param('jobId') jobId: string) {
    try {
      const job = this.auditExportService.getExportJobStatus(jobId);

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      this.logger.error(`Error fetching export job ${jobId}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch export job status',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * GET /super-admin/audit/export
   * Get all export jobs for current user
   */
  @Get('export')
  async getExportJobs(@Query() historyDto: any) {
    try {
      const jobs = this.auditExportService.getExportJobs(SYSTEM_USER_ID, historyDto); // Current user ID

      return {
        success: true,
        data: jobs,
      };
    } catch (error) {
      this.logger.error('Error fetching export jobs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch export jobs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /super-admin/audit/export/:jobId/cancel
   * Cancel export job
   */
  @Post('export/:jobId/cancel')
  async cancelExportJob(@Param('jobId') jobId: string) {
    try {
      this.auditExportService.cancelExportJob(jobId, SYSTEM_USER_ID); // Current user ID

      return {
        success: true,
        message: 'Export job cancelled successfully',
      };
    } catch (error) {
      this.logger.error(`Error cancelling export job ${jobId}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to cancel export job',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /super-admin/audit/export/preview
   * Preview export data
   */
  @Get('export/preview')
  async previewExport(@Query() previewDto: any, @Query() filters: AuditFiltersDto) {
    try {
      const data = await this.auditExportService.previewExport(previewDto, filters);

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error previewing export:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to preview export',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/retention/policies
   * Get retention policies
   */
  @Get('retention/policies')
  async getRetentionPolicies() {
    try {
      const policies = this.auditRetentionService.getRetentionPolicies();

      return {
        success: true,
        data: policies,
      };
    } catch (error) {
      this.logger.error('Error fetching retention policies:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch retention policies',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/retention/policies/:policyId
   * Get specific retention policy
   */
  @Get('retention/policies/:policyId')
  async getRetentionPolicy(@Param('policyId') policyId: string) {
    try {
      const policy = this.auditRetentionService.getRetentionPolicy(policyId);

      if (!policy) {
        throw new HttpException(
          {
            success: false,
            message: 'Retention policy not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: policy,
      };
    } catch (error) {
      this.logger.error(`Error fetching retention policy ${policyId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch retention policy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /super-admin/audit/retention/policies/:policyId/execute
   * Execute retention policy
   */
  @Post('retention/policies/:policyId/execute')
  async executeRetentionPolicy(@Param('policyId') policyId: string) {
    try {
      const result = await this.auditRetentionService.executeRetentionPolicy(policyId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error executing retention policy ${policyId}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to execute retention policy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /super-admin/audit/retention/execute-all
   * Execute all retention policies
   */
  @Post('retention/execute-all')
  async executeAllRetentionPolicies() {
    try {
      const results = await this.auditRetentionService.executeAllRetentionPolicies();

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger.error('Error executing all retention policies:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to execute retention policies',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/retention/statistics
   * Get retention statistics
   */
  @Get('retention/statistics')
  async getRetentionStatistics() {
    try {
      const statistics = await this.auditRetentionService.getRetentionStatistics();

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error('Error fetching retention statistics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch retention statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/retention/policies/:policyId/preview
   * Preview retention policy execution
   */
  @Get('retention/policies/:policyId/preview')
  async previewRetentionPolicy(@Param('policyId') policyId: string) {
    try {
      const preview = await this.auditRetentionService.previewRetentionPolicy(policyId);

      return {
        success: true,
        data: preview,
      };
    } catch (error) {
      this.logger.error(`Error previewing retention policy ${policyId}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to preview retention policy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}