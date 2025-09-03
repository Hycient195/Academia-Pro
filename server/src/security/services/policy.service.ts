import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SecurityPolicy, PolicyType, PolicyStatus, EnforcementLevel, PolicyScope } from '../entities/security-policy.entity';
import { SecurityService } from './security.service';
import { AuditAction, AuditSeverity } from '../types/audit.types';

export interface PolicyEvaluationContext {
  user: {
    id: string;
    roles: string[];
    schoolId?: string;
    attributes?: Record<string, any>;
  };
  resource: {
    type: string;
    id?: string;
    ownerId?: string;
    attributes?: Record<string, any>;
  };
  action: string;
  environment: {
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    sessionId?: string;
    attributes?: Record<string, any>;
  };
  request?: {
    method: string;
    path: string;
    parameters?: Record<string, any>;
    body?: Record<string, any>;
  };
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  policyId?: string;
  appliedPolicies: string[];
  violations: Array<{
    policyId: string;
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  obligations: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(SecurityPolicy)
    private policyRepository: Repository<SecurityPolicy>,
    @Inject(forwardRef(() => SecurityService))
    private securityService: SecurityService,
    private dataSource: DataSource,
  ) {}

  async evaluateAccess(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult> {
    try {
      this.logger.debug(`Evaluating access control for user: ${context.user.id}, action: ${context.action}, resource: ${context.resource.type}`);

      // Get applicable policies
      const applicablePolicies = await this.getApplicablePolicies(context);

      if (applicablePolicies.length === 0) {
        return {
          allowed: true,
          reason: 'No applicable policies found',
          appliedPolicies: [],
          violations: [],
          obligations: [],
        };
      }

      // Evaluate policies in priority order
      const sortedPolicies = applicablePolicies.sort((a, b) => b.priority - a.priority);

      const violations: PolicyEvaluationResult['violations'] = [];
      const obligations: PolicyEvaluationResult['obligations'] = [];
      let finalDecision = true;
      let denyReason = '';
      let appliedPolicyId = '';

      for (const policy of sortedPolicies) {
        const evaluation = await this.evaluateSinglePolicy(policy, context);

        // Collect obligations regardless of decision
        if (evaluation.obligations) {
          obligations.push(...evaluation.obligations);
        }

        // Handle policy decision
        if (evaluation.result === 'deny') {
          finalDecision = false;
          denyReason = evaluation.reason || 'Policy violation';
          appliedPolicyId = policy.id;

          violations.push({
            policyId: policy.id,
            rule: evaluation.reason || 'Policy violation',
            severity: this.mapSeverity(policy.enforcementLevel),
          });

          // If policy is strict, stop evaluation
          if (policy.enforcementLevel === EnforcementLevel.STRICT) {
            break;
          }
        } else if (evaluation.result === 'warn') {
          violations.push({
            policyId: policy.id,
            rule: evaluation.reason || 'Policy warning',
            severity: 'low',
          });
        }
      }

      // Log policy evaluation
      await this.logPolicyEvaluation(context, {
        allowed: finalDecision,
        reason: finalDecision ? 'Access granted' : denyReason,
        policyId: appliedPolicyId,
        appliedPolicies: sortedPolicies.map(p => p.id),
        violations,
        obligations,
      });

      return {
        allowed: finalDecision,
        reason: finalDecision ? 'Access granted' : denyReason,
        policyId: appliedPolicyId,
        appliedPolicies: sortedPolicies.map(p => p.id),
        violations,
        obligations,
      };

    } catch (error) {
      this.logger.error(`Policy evaluation error: ${error.message}`, error.stack);

      // Log evaluation error
      await this.logPolicyEvaluation(context, {
        allowed: false,
        reason: `Policy evaluation error: ${error.message}`,
        appliedPolicies: [],
        violations: [{
          policyId: 'system',
          rule: 'Policy evaluation failed',
          severity: 'critical',
        }],
        obligations: [],
      });

      return {
        allowed: false,
        reason: `Policy evaluation error: ${error.message}`,
        appliedPolicies: [],
        violations: [{
          policyId: 'system',
          rule: 'Policy evaluation failed',
          severity: 'critical',
        }],
        obligations: [],
      };
    }
  }

  private async getApplicablePolicies(context: PolicyEvaluationContext): Promise<SecurityPolicy[]> {
    const query = this.policyRepository.createQueryBuilder('policy')
      .where('policy.status = :status', { status: PolicyStatus.ACTIVE })
      .andWhere('policy.type IN (:...types)', {
        types: this.getApplicablePolicyTypes(context)
      });

    // Add scope filtering
    if (context.user.schoolId) {
      query.andWhere('(policy.scope = :global OR (policy.scope = :school AND policy.scopeId = :schoolId))', {
        global: 'global',
        school: 'school',
        schoolId: context.user.schoolId,
      });
    } else {
      query.andWhere('policy.scope = :global', { global: 'global' });
    }

    // Add date range filtering
    query.andWhere('(policy.effectiveFrom IS NULL OR policy.effectiveFrom <= :now)', { now: new Date() })
         .andWhere('(policy.effectiveUntil IS NULL OR policy.effectiveUntil >= :now)', { now: new Date() });

    const policies = await query.getMany();

    // Filter policies based on context attributes
    return policies.filter(policy => this.isPolicyApplicable(policy, context));
  }

  private getApplicablePolicyTypes(context: PolicyEvaluationContext): PolicyType[] {
    const types: PolicyType[] = [PolicyType.ACCESS_CONTROL];

    // Add specific policy types based on context
    switch (context.resource.type) {
      case 'user':
        types.push(PolicyType.ROLE_POLICY, PolicyType.PERMISSION_POLICY);
        break;
      case 'student':
        types.push(PolicyType.DATA_CLASSIFICATION, PolicyType.RETENTION_POLICY);
        break;
      case 'report':
        types.push(PolicyType.DATA_CLASSIFICATION, PolicyType.SHARING_POLICY);
        break;
      case 'file':
      case 'document':
        types.push(PolicyType.DATA_CLASSIFICATION, PolicyType.ENCRYPTION_POLICY);
        break;
    }

    // Add authentication policies for login-related actions
    if (['login', 'authenticate', 'verify'].includes(context.action)) {
      types.push(PolicyType.PASSWORD_POLICY, PolicyType.MFA_POLICY, PolicyType.SESSION_POLICY);
    }

    return [...new Set(types)]; // Remove duplicates
  }

  private isPolicyApplicable(policy: SecurityPolicy, context: PolicyEvaluationContext): boolean {
    // Check if policy rules match context
    if (!policy.rules || !policy.rules.conditions) {
      return true; // Policy applies to all if no specific conditions
    }

    // Evaluate policy conditions against context
    return policy.rules.conditions.every(condition => {
      const contextValue = this.getContextValue(context, condition.field);
      return this.evaluateCondition(contextValue, condition.operator, condition.value);
    });
  }

  private getContextValue(context: PolicyEvaluationContext, field: string): any {
    const fieldPath = field.split('.');

    let current: any = context;
    for (const path of fieldPath) {
      if (current && typeof current === 'object' && path in current) {
        current = current[path];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return String(value).includes(String(expectedValue));
      case 'not_contains':
        return !String(value).includes(String(expectedValue));
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case 'exists':
        return value !== undefined && value !== null;
      case 'not_exists':
        return value === undefined || value === null;
      default:
        return false;
    }
  }

  private async evaluateSinglePolicy(
    policy: SecurityPolicy,
    context: PolicyEvaluationContext,
  ): Promise<{
    result: 'allow' | 'deny' | 'warn';
    reason?: string;
    obligations?: Array<{ type: string; parameters: any }>;
  }> {
    try {
      // Evaluate policy rules
      const evaluation = await policy.evaluate({
        user: context.user,
        resource: context.resource,
        action: context.action,
        environment: context.environment,
        ...context.request,
      });

      return {
        result: evaluation.result,
        reason: evaluation.reason,
        obligations: evaluation.actions?.filter(action => action.type !== 'allow' && action.type !== 'deny').map(action => ({
          type: action.type,
          parameters: action.parameters || {},
        })),
      };
    } catch (error) {
      this.logger.error(`Error evaluating policy ${policy.id}: ${error.message}`, error);
      return {
        result: 'deny',
        reason: `Policy evaluation error: ${error.message}`,
      };
    }
  }

  private mapSeverity(enforcementLevel: EnforcementLevel): 'low' | 'medium' | 'high' | 'critical' {
    switch (enforcementLevel) {
      case EnforcementLevel.PERMISSIVE:
        return 'low';
      case EnforcementLevel.STRICT:
        return 'high';
      case EnforcementLevel.AUDIT_ONLY:
        return 'medium';
      default:
        return 'medium';
    }
  }

  private async logPolicyEvaluation(
    context: PolicyEvaluationContext,
    result: PolicyEvaluationResult,
  ): Promise<void> {
    try {
      const severity = result.allowed ? AuditSeverity.LOW : AuditSeverity.MEDIUM;

      await this.securityService.logSecurityEvent(
        result.allowed ? AuditAction.DATA_ACCESSED : AuditAction.AUTHORIZATION_FAILED,
        context.user.id,
        severity,
        `Policy evaluation: ${result.allowed ? 'Granted' : 'Denied'}`,
        {
          policyEvaluation: true,
          allowed: result.allowed,
          reason: result.reason,
          appliedPolicies: result.appliedPolicies,
          violations: result.violations,
          obligations: result.obligations,
          resourceType: context.resource.type,
          resourceId: context.resource.id,
          action: context.action,
          userRoles: context.user.roles,
          schoolId: context.user.schoolId,
        },
        context.environment.ipAddress,
        context.environment.userAgent,
      );
    } catch (error) {
      this.logger.error('Failed to log policy evaluation', error);
    }
  }

  // Policy Management Methods
  async createPolicy(policyData: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    try {
      this.logger.log(`Creating security policy: ${policyData.name}`);

      const policy = this.policyRepository.create({
        ...policyData,
        status: policyData.status || PolicyStatus.DRAFT,
        enforcementLevel: policyData.enforcementLevel || EnforcementLevel.STRICT,
        priority: policyData.priority || 100,
        isSystemPolicy: false,
        createdBy: policyData.createdBy || 'system',
      });

      const savedPolicy = await this.policyRepository.save(policy);

      // Log policy creation
      await this.securityService.logSecurityEvent(
        AuditAction.SYSTEM_CONFIG_CHANGED,
        policyData.createdBy || 'system',
        AuditSeverity.LOW,
        `Security policy created: ${policyData.name}`,
        {
          policyId: savedPolicy.id,
          policyType: policyData.type,
          policyScope: policyData.scope,
        },
      );

      return savedPolicy;
    } catch (error) {
      this.logger.error(`Failed to create policy: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePolicy(id: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    try {
      this.logger.log(`Updating security policy: ${id}`);

      const policy = await this.policyRepository.findOne({ where: { id } });
      if (!policy) {
        throw new Error('Policy not found');
      }

      Object.assign(policy, updates);
      const savedPolicy = await this.policyRepository.save(policy);

      // Log policy update
      await this.securityService.logSecurityEvent(
        AuditAction.SYSTEM_CONFIG_CHANGED,
        updates.updatedBy || 'system',
        AuditSeverity.MEDIUM,
        `Security policy updated: ${policy.name}`,
        {
          policyId: id,
          updates: Object.keys(updates),
        },
      );

      return savedPolicy;
    } catch (error) {
      this.logger.error(`Failed to update policy: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deletePolicy(id: string, deletedBy: string): Promise<void> {
    try {
      this.logger.log(`Deleting security policy: ${id}`);

      const policy = await this.policyRepository.findOne({ where: { id } });
      if (!policy) {
        throw new Error('Policy not found');
      }

      await this.policyRepository.remove(policy);

      // Log policy deletion
      await this.securityService.logSecurityEvent(
        AuditAction.SYSTEM_CONFIG_CHANGED,
        deletedBy,
        AuditSeverity.HIGH,
        `Security policy deleted: ${policy.name}`,
        {
          policyId: id,
          policyName: policy.name,
          policyType: policy.type,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to delete policy: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPolicies(filters: {
    type?: PolicyType;
    status?: PolicyStatus;
    scope?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ policies: SecurityPolicy[]; total: number }> {
    try {
      const query = this.policyRepository.createQueryBuilder('policy');

      if (filters.type) {
        query.andWhere('policy.type = :type', { type: filters.type });
      }

      if (filters.status) {
        query.andWhere('policy.status = :status', { status: filters.status });
      }

      if (filters.scope) {
        query.andWhere('policy.scope = :scope', { scope: filters.scope });
      }

      const total = await query.getCount();

      query
        .orderBy('policy.priority', 'DESC')
        .addOrderBy('policy.updatedAt', 'DESC')
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      const policies = await query.getMany();

      return { policies, total };
    } catch (error) {
      this.logger.error(`Failed to get policies: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Utility Methods
  async validatePolicySyntax(policy: Partial<SecurityPolicy>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate policy structure
    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required');
    }

    if (!policy.type) {
      errors.push('Policy type is required');
    }

    if (!policy.rules) {
      errors.push('Policy rules are required');
    } else {
      // Validate rule structure
      if (policy.rules.conditions) {
        policy.rules.conditions.forEach((condition, index) => {
          if (!condition.field) {
            errors.push(`Condition ${index}: field is required`);
          }
          if (!condition.operator) {
            errors.push(`Condition ${index}: operator is required`);
          }
        });
      }

      if (policy.rules.actions) {
        policy.rules.actions.forEach((action, index) => {
          if (!action.type) {
            errors.push(`Action ${index}: type is required`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getPolicyTemplates(): Promise<Array<{ type: PolicyType; template: Partial<SecurityPolicy> }>> {
    return [
      {
        type: PolicyType.PASSWORD_POLICY,
        template: {
          name: 'Default Password Policy',
          description: 'Standard password requirements and restrictions',
          type: PolicyType.PASSWORD_POLICY,
          scope: PolicyScope.GLOBAL,
          enforcementLevel: EnforcementLevel.STRICT,
          rules: {
            conditions: [
              { field: 'user.roles', operator: 'not_in', value: ['super-admin'] },
            ],
            actions: [
              { type: 'deny', parameters: { reason: 'Password policy violation' } },
            ],
          },
        },
      },
      {
        type: PolicyType.ACCESS_CONTROL,
        template: {
          name: 'Student Data Access Policy',
          description: 'Controls access to student personal data',
          type: PolicyType.ACCESS_CONTROL,
          scope: PolicyScope.GLOBAL,
          enforcementLevel: EnforcementLevel.STRICT,
          rules: {
            conditions: [
              { field: 'resource.type', operator: 'equals', value: 'student' },
              { field: 'user.roles', operator: 'not_in', value: ['teacher', 'school-admin', 'super-admin'] },
            ],
            actions: [
              { type: 'deny', parameters: { reason: 'Unauthorized access to student data' } },
            ],
          },
        },
      },
    ];
  }
}