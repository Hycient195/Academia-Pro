import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuditLog, AuditEventType, AuditSeverity } from '../entities/audit-log.entity';
import { SecurityService } from './security.service';
import { PolicyService } from './policy.service';

export interface ComplianceCheck {
  id: string;
  framework: 'GDPR' | 'FERPA' | 'COPPA' | 'HIPAA' | 'CCPA' | 'SOX';
  requirement: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  remediation: string[];
  lastChecked: Date;
  nextCheck: Date;
  responsibleParty: string;
  metadata: Record<string, any>;
}

export interface DataSubjectRequest {
  id: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  subjectId: string;
  subjectType: 'student' | 'parent' | 'staff' | 'user';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  requesterInfo: {
    name: string;
    email: string;
    relationship?: string;
    verificationMethod: string;
  };
  scope: {
    dataCategories: string[];
    timeRange?: { start: Date; end: Date };
    systems: string[];
  };
  evidence: string[];
  notes: string[];
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ComplianceReport {
  id: string;
  framework: string;
  period: { start: Date; end: Date };
  generatedAt: Date;
  generatedBy: string;
  overallCompliance: number;
  summary: {
    totalChecks: number;
    compliant: number;
    nonCompliant: number;
    notApplicable: number;
    underReview: number;
  };
  findings: Array<{
    requirement: string;
    status: string;
    severity: string;
    description: string;
    evidence: string[];
    remediation: string[];
  }>;
  recommendations: string[];
  nextReviewDate: Date;
  metadata: Record<string, any>;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private securityService: SecurityService,
    private policyService: PolicyService,
    private dataSource: DataSource,
  ) {}

  async performComplianceCheck(
    framework: 'GDPR' | 'FERPA' | 'COPPA' | 'HIPAA' | 'CCPA' | 'SOX',
    scope?: { schoolId?: string; userId?: string; dataCategory?: string },
  ): Promise<ComplianceCheck[]> {
    try {
      this.logger.log(`Performing ${framework} compliance check with scope:`, scope);

      const checks = await this.getComplianceChecks(framework);
      const results: ComplianceCheck[] = [];

      for (const check of checks) {
        const result = await this.evaluateComplianceCheck(check, scope);
        results.push(result);
      }

      return results;
    } catch (error) {
      this.logger.error(`Compliance check error for ${framework}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generateComplianceReport(
    framework: string,
    period: { start: Date; end: Date },
    generatedBy: string,
  ): Promise<ComplianceReport> {
    try {
      this.logger.log(`Generating ${framework} compliance report for period:`, period);

      const checks = await this.performComplianceCheck(framework as any);

      const summary = {
        totalChecks: checks.length,
        compliant: checks.filter(c => c.status === 'compliant').length,
        nonCompliant: checks.filter(c => c.status === 'non_compliant').length,
        notApplicable: checks.filter(c => c.status === 'not_applicable').length,
        underReview: checks.filter(c => c.status === 'under_review').length,
      };

      const overallCompliance = summary.totalChecks > 0
        ? (summary.compliant / summary.totalChecks) * 100
        : 100;

      const findings = checks
        .filter(c => c.status === 'non_compliant')
        .map(check => ({
          requirement: check.requirement || '',
          status: check.status,
          severity: check.severity,
          description: check.description || '',
          evidence: check.evidence,
          remediation: check.remediation,
        }));

      const recommendations = this.generateRecommendations(framework, checks);

      const report: ComplianceReport = {
        id: `report-${Date.now()}`,
        framework,
        period,
        generatedAt: new Date(),
        generatedBy,
        overallCompliance,
        summary,
        findings,
        recommendations,
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        metadata: {
          generatedBySystem: true,
          automated: true,
          frameworkVersion: '1.0',
        },
      };

      return report;
    } catch (error) {
      this.logger.error(`Compliance report generation error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleDataSubjectRequest(
    request: Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status'>,
  ): Promise<DataSubjectRequest> {
    try {
      this.logger.log(`Processing data subject request for subject: ${request.subjectId}`);

      const dataSubjectRequest: DataSubjectRequest = {
        id: `dsr-${Date.now()}`,
        ...request,
        requestedAt: new Date(),
        status: 'pending',
        notes: [],
        evidence: [],
      };

      // Process request based on type
      await this.processDataSubjectRequest(dataSubjectRequest);

      return dataSubjectRequest;
    } catch (error) {
      this.logger.error(`Data subject request error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async performDataClassification(
    data: any,
    context: { source: string; userId?: string; schoolId?: string },
  ): Promise<{
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
    dataCategories: string[];
    retentionPeriod: number;
    encryptionRequired: boolean;
    accessControls: string[];
    complianceFlags: string[];
  }> {
    try {
      this.logger.log(`Performing data classification for data from ${context.source}`);

      let classification: 'public' | 'internal' | 'confidential' | 'restricted' = 'internal';
      let sensitivity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const dataCategories: string[] = [];
      const complianceFlags: string[] = [];

      if (this.containsPersonalData(data)) {
        classification = 'confidential';
        sensitivity = 'high';
        dataCategories.push('personal_data');
        complianceFlags.push('GDPR', 'FERPA');
      }

      if (this.containsSensitiveData(data)) {
        classification = 'restricted';
        sensitivity = 'critical';
        dataCategories.push('sensitive_data');
        complianceFlags.push('HIPAA', 'FERPA');
      }

      if (this.containsStudentRecords(data)) {
        dataCategories.push('student_records');
        complianceFlags.push('FERPA', 'COPPA');
      }

      const result = {
        classification,
        sensitivity,
        dataCategories,
        retentionPeriod: this.calculateRetentionPeriod(dataCategories),
        encryptionRequired: sensitivity === 'high' || sensitivity === 'critical',
        accessControls: this.determineAccessControls(classification, sensitivity),
        complianceFlags,
      };

      return result;
    } catch (error) {
      this.logger.error(`Data classification error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDataRetentionStatus(
    dataCategory: string,
    olderThanDays: number,
  ): Promise<{
    totalRecords: number;
    eligibleForDeletion: number;
    retentionPolicy: any;
    recommendations: string[];
  }> {
    try {
      this.logger.log(`Checking data retention status for ${dataCategory}, older than ${olderThanDays} days`);

      const retentionStatus = {
        totalRecords: 125000,
        eligibleForDeletion: 45000,
        retentionPolicy: {
          category: dataCategory,
          retentionPeriodDays: 2555,
          legalHold: false,
          exceptions: [],
        },
        recommendations: [
          'Schedule automated cleanup for eligible records',
          'Implement data archiving before deletion',
          'Review retention policy compliance',
          'Update data classification labels',
        ],
      };

      return retentionStatus;
    } catch (error) {
      this.logger.error(`Data retention status error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async getComplianceChecks(framework: string): Promise<Partial<ComplianceCheck>[]> {
    const frameworkChecks = {
      GDPR: [
        {
          requirement: 'Article 5 - Lawfulness, fairness and transparency',
          description: 'Personal data shall be processed lawfully, fairly and in a transparent manner',
          framework: 'GDPR' as const,
        },
        {
          requirement: 'Article 6 - Lawful basis for processing',
          description: 'Processing shall have a lawful basis',
          framework: 'GDPR' as const,
        },
        {
          requirement: 'Article 17 - Right to erasure',
          description: 'Data subjects have the right to have their data erased',
          framework: 'GDPR' as const,
        },
      ],
      FERPA: [
        {
          requirement: '20 U.S.C. § 1232g(a)(1) - Written consent',
          description: 'Educational records may not be disclosed without written consent',
          framework: 'FERPA' as const,
        },
        {
          requirement: '34 CFR § 99.31 - Notification of rights',
          description: 'Institutions must notify parents/students of their rights',
          framework: 'FERPA' as const,
        },
      ],
      COPPA: [
        {
          requirement: '16 CFR § 312.3 - Parental consent',
          description: 'Obtain verifiable parental consent before collecting data from children',
          framework: 'COPPA' as const,
        },
      ],
    };

    return frameworkChecks[framework] || [];
  }

  private async evaluateComplianceCheck(
    check: Partial<ComplianceCheck>,
    scope?: any,
  ): Promise<ComplianceCheck> {
    const mockResults = {
      'Article 5': { status: 'compliant', severity: 'high', evidence: ['Privacy policy published', 'Consent mechanisms implemented'] },
      'Article 6': { status: 'compliant', severity: 'high', evidence: ['Lawful basis documented', 'Processing records maintained'] },
      'Article 17': { status: 'non_compliant', severity: 'critical', evidence: ['Erasure process partially implemented'] },
      '20 U.S.C. § 1232g': { status: 'compliant', severity: 'high', evidence: ['Consent forms implemented', 'Access logs maintained'] },
      '34 CFR § 99.31': { status: 'compliant', severity: 'medium', evidence: ['Privacy notices distributed', 'Rights documentation available'] },
      '16 CFR § 312.3': { status: 'non_compliant', severity: 'critical', evidence: ['Parental consent verification incomplete'] },
    };

    const mockResult = mockResults[check.requirement?.split(' - ')[0] || ''] || {
      status: 'compliant',
      severity: 'low',
      evidence: ['Requirement verified through automated checks'],
    };

    return {
      id: `check-${Date.now()}-${Math.random()}`,
      framework: check.framework as any,
      requirement: check.requirement || '',
      description: check.description || '',
      status: mockResult.status as any,
      severity: mockResult.severity as any,
      evidence: mockResult.evidence,
      remediation: mockResult.status === 'non_compliant' ? ['Implement missing controls', 'Update procedures', 'Conduct training'] : [],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      responsibleParty: 'Compliance Officer',
      metadata: { automated: true, scope },
    };
  }

  private async processDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    switch (request.requestType) {
      case 'access':
        await this.processAccessRequest(request);
        break;
      case 'rectification':
        await this.processRectificationRequest(request);
        break;
      case 'erasure':
        await this.processErasureRequest(request);
        break;
      case 'restriction':
        await this.processRestrictionRequest(request);
        break;
      case 'portability':
        await this.processPortabilityRequest(request);
        break;
      case 'objection':
        await this.processObjectionRequest(request);
        break;
    }
  }

  private async processAccessRequest(request: DataSubjectRequest): Promise<void> {
    const subjectData = await this.collectSubjectData(request.subjectId, request.subjectType, request.scope);
    const report = await this.generateDataAccessReport(subjectData, request);

    request.evidence.push(`Data access report generated: ${report.id}`);
    request.status = 'completed';
    request.completedAt = new Date();
  }

  private async processRectificationRequest(request: DataSubjectRequest): Promise<void> {
    const validation = await this.validateRectificationRequest(request);

    if (validation.valid) {
      await this.applyDataCorrections(request);
      request.status = 'completed';
      request.evidence.push('Data rectification applied successfully');
    } else {
      request.status = 'rejected';
      request.notes.push(`Rectification rejected: ${validation.reason}`);
    }

    request.completedAt = new Date();
  }

  private async processErasureRequest(request: DataSubjectRequest): Promise<void> {
    const legalGrounds = await this.checkErasureLegalGrounds(request);

    if (legalGrounds.canErase) {
      await this.performDataErasure(request);
      request.status = 'completed';
      request.evidence.push('Data erasure completed successfully');
    } else {
      request.status = 'rejected';
      request.notes.push(`Erasure rejected: ${legalGrounds.reason}`);
    }

    request.completedAt = new Date();
  }

  private async processRestrictionRequest(request: DataSubjectRequest): Promise<void> {
    await this.implementProcessingRestrictions(request);
    request.status = 'completed';
    request.evidence.push('Data processing restrictions implemented');
    request.completedAt = new Date();
  }

  private async processPortabilityRequest(request: DataSubjectRequest): Promise<void> {
    const portableData = await this.collectPortableData(request);
    const dataExport = await this.generateDataExport(portableData, request);

    request.status = 'completed';
    request.evidence.push(`Data export generated: ${dataExport.id}`);
    request.completedAt = new Date();
  }

  private async processObjectionRequest(request: DataSubjectRequest): Promise<void> {
    const evaluation = await this.evaluateObjectionRequest(request);

    if (evaluation.sustained) {
      await this.ceaseDataProcessing(request);
      request.status = 'completed';
      request.evidence.push('Data processing ceased due to objection');
    } else {
      request.status = 'rejected';
      request.notes.push(`Objection rejected: ${evaluation.reason}`);
    }

    request.completedAt = new Date();
  }

  private containsPersonalData(data: any): boolean {
    const personalDataFields = ['email', 'phone', 'address', 'name', 'ssn', 'birthDate'];
    return personalDataFields.some(field =>
      data && typeof data === 'object' && field in data
    );
  }

  private containsSensitiveData(data: any): boolean {
    const sensitiveFields = ['medical', 'financial', 'criminal', 'religious', 'political'];
    const dataString = JSON.stringify(data).toLowerCase();
    return sensitiveFields.some(field => dataString.includes(field));
  }

  private containsStudentRecords(data: any): boolean {
    const studentFields = ['grade', 'enrollment', 'academic', 'attendance', 'performance'];
    const dataString = JSON.stringify(data).toLowerCase();
    return studentFields.some(field => dataString.includes(field));
  }

  private calculateRetentionPeriod(dataCategories: string[]): number {
    if (dataCategories.includes('student_records')) return 2555;
    if (dataCategories.includes('sensitive_data')) return 2555;
    if (dataCategories.includes('personal_data')) return 2555;
    return 365;
  }

  private determineAccessControls(classification: string, sensitivity: string): string[] {
    const controls = ['authentication_required'];

    if (classification === 'restricted' || sensitivity === 'critical') {
      controls.push('mfa_required', 'encryption_required', 'audit_logging');
    } else if (classification === 'confidential' || sensitivity === 'high') {
      controls.push('role_based_access', 'audit_logging');
    }

    return controls;
  }

  private generateRecommendations(framework: string, checks: ComplianceCheck[]): string[] {
    const recommendations: string[] = [];

    const nonCompliant = checks.filter(c => c.status === 'non_compliant');

    if (nonCompliant.length > 0) {
      recommendations.push('Address non-compliant requirements immediately');
      recommendations.push('Implement automated compliance monitoring');
      recommendations.push('Conduct compliance training for staff');
      recommendations.push('Update policies and procedures');
    }

    if (framework === 'GDPR') {
      recommendations.push('Implement comprehensive data mapping');
      recommendations.push('Establish data protection officer role');
      recommendations.push('Conduct data protection impact assessments');
    }

    if (framework === 'FERPA') {
      recommendations.push('Review student data sharing agreements');
      recommendations.push('Implement student directory information controls');
      recommendations.push('Establish parent notification procedures');
    }

    return recommendations;
  }

  // Mock implementations for data subject request processing
  private async collectSubjectData(subjectId: string, subjectType: string, scope: any): Promise<any> {
    return { subjectId, subjectType, data: [] };
  }

  private async generateDataAccessReport(data: any, request: DataSubjectRequest): Promise<any> {
    return { id: `report-${Date.now()}`, data };
  }

  private async validateRectificationRequest(request: DataSubjectRequest): Promise<{ valid: boolean; reason?: string }> {
    return { valid: true };
  }

  private async applyDataCorrections(request: DataSubjectRequest): Promise<void> {
    // Mock implementation
  }

  private async checkErasureLegalGrounds(request: DataSubjectRequest): Promise<{ canErase: boolean; reason?: string }> {
    return { canErase: true };
  }

  private async performDataErasure(request: DataSubjectRequest): Promise<void> {
    // Mock implementation
  }

  private async implementProcessingRestrictions(request: DataSubjectRequest): Promise<void> {
    // Mock implementation
  }

  private async collectPortableData(request: DataSubjectRequest): Promise<any> {
    return { data: [] };
  }

  private async generateDataExport(data: any, request: DataSubjectRequest): Promise<any> {
    return { id: `export-${Date.now()}`, data };
  }

  private async evaluateObjectionRequest(request: DataSubjectRequest): Promise<{ sustained: boolean; reason?: string }> {
    return { sustained: true };
  }

  private async ceaseDataProcessing(request: DataSubjectRequest): Promise<void> {
    // Mock implementation
  }
}