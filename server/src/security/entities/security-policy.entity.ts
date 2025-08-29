import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

export enum PolicyType {
  // Authentication Policies
  PASSWORD_POLICY = 'password_policy',
  MFA_POLICY = 'mfa_policy',
  SESSION_POLICY = 'session_policy',
  LOGIN_POLICY = 'login_policy',

  // Authorization Policies
  ACCESS_CONTROL = 'access_control',
  ROLE_POLICY = 'role_policy',
  PERMISSION_POLICY = 'permission_policy',
  RESOURCE_POLICY = 'resource_policy',

  // Data Protection Policies
  DATA_CLASSIFICATION = 'data_classification',
  ENCRYPTION_POLICY = 'encryption_policy',
  RETENTION_POLICY = 'retention_policy',
  SHARING_POLICY = 'sharing_policy',

  // Compliance Policies
  GDPR_POLICY = 'gdpr_policy',
  FERPA_POLICY = 'ferpa_policy',
  COPPA_POLICY = 'coppa_policy',
  HIPAA_POLICY = 'hipaa_policy',

  // Security Policies
  NETWORK_POLICY = 'network_policy',
  ENDPOINT_POLICY = 'endpoint_policy',
  INCIDENT_RESPONSE = 'incident_response',
  MONITORING_POLICY = 'monitoring_policy',

  // Operational Policies
  BACKUP_POLICY = 'backup_policy',
  AUDIT_POLICY = 'audit_policy',
  MAINTENANCE_POLICY = 'maintenance_policy',
  CHANGE_MANAGEMENT = 'change_management',
}

export enum PolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export enum PolicyScope {
  GLOBAL = 'global',           // Applies to entire system
  SCHOOL = 'school',           // Applies to specific school
  USER_GROUP = 'user_group',   // Applies to user groups
  DEPARTMENT = 'department',   // Applies to departments
  INDIVIDUAL = 'individual',   // Applies to individual users
}

export enum EnforcementLevel {
  PERMISSIVE = 'permissive',   // Allow with warnings
  STRICT = 'strict',           // Enforce with blocking
  AUDIT_ONLY = 'audit_only',   // Log violations only
  DISABLED = 'disabled',       // Policy disabled
}

@Entity('security_policies')
@Index(['type', 'status'])
@Index(['scope', 'scopeId'])
@Index(['effectiveFrom', 'effectiveUntil'])
@Index(['priority', 'status'])
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
  })
  type: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT,
  })
  status: PolicyStatus;

  @Column({
    type: 'enum',
    enum: PolicyScope,
    default: PolicyScope.GLOBAL,
  })
  scope: PolicyScope;

  @Column({ name: 'scope_id', type: 'uuid', nullable: true })
  scopeId: string;

  @Column({
    name: 'enforcement_level',
    type: 'enum',
    enum: EnforcementLevel,
    default: EnforcementLevel.STRICT,
  })
  enforcementLevel: EnforcementLevel;

  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ name: 'effective_from', type: 'timestamp', nullable: true })
  effectiveFrom: Date;

  @Column({ name: 'effective_until', type: 'timestamp', nullable: true })
  effectiveUntil: Date;

  @Column({ name: 'version', type: 'varchar', length: 20, default: '1.0.0' })
  version: string;

  @Column({ name: 'is_system_policy', type: 'boolean', default: false })
  isSystemPolicy: boolean;

  @Column({ name: 'is_mandatory', type: 'boolean', default: false })
  isMandatory: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_required_by', type: 'uuid', nullable: true })
  approvalRequiredBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'categories', type: 'simple-array', nullable: true })
  categories: string[];

  // Policy Rules and Configuration
  @Column({ name: 'rules', type: 'jsonb' })
  rules: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
      value: any;
      logicalOperator?: 'AND' | 'OR';
    }>;
    actions: Array<{
      type: 'allow' | 'deny' | 'warn' | 'log' | 'notify' | 'escalate';
      parameters?: Record<string, any>;
    }>;
    exceptions?: Array<{
      condition: string;
      action: string;
    }>;
  };

  // Policy Metadata
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: {
    complianceFrameworks?: string[];
    regulatoryRequirements?: string[];
    businessImpact?: 'low' | 'medium' | 'high' | 'critical';
    technicalComplexity?: 'low' | 'medium' | 'high';
    testingRequirements?: string[];
    rollbackPlan?: string;
    monitoringMetrics?: string[];
    documentation?: {
      userGuide?: string;
      technicalSpec?: string;
      complianceDoc?: string;
    };
    customFields?: Record<string, any>;
  };

  // Policy Statistics
  @Column({ name: 'statistics', type: 'jsonb', nullable: true })
  statistics: {
    totalEvaluations: number;
    successfulEvaluations: number;
    failedEvaluations: number;
    violationsDetected: number;
    warningsIssued: number;
    escalationsTriggered: number;
    averageEvaluationTime: number;
    lastEvaluationAt?: Date;
    peakUsageTime?: Date;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PolicyStatus.ACTIVE &&
      (!this.effectiveFrom || now >= this.effectiveFrom) &&
      (!this.effectiveUntil || now <= this.effectiveUntil)
    );
  }

  isExpired(): boolean {
    return this.effectiveUntil && new Date() > this.effectiveUntil;
  }

  isGlobal(): boolean {
    return this.scope === PolicyScope.GLOBAL;
  }

  requiresApprovalCheck(): boolean {
    return this.requiresApproval && !this.approvedAt;
  }

  canBeModified(): boolean {
    return !this.isSystemPolicy || this.status === PolicyStatus.DRAFT;
  }

  getEffectiveScope(): string {
    if (this.scope === PolicyScope.GLOBAL) return 'Global';
    if (this.scope === PolicyScope.SCHOOL) return `School: ${this.scopeId}`;
    if (this.scope === PolicyScope.USER_GROUP) return `User Group: ${this.scopeId}`;
    if (this.scope === PolicyScope.DEPARTMENT) return `Department: ${this.scopeId}`;
    if (this.scope === PolicyScope.INDIVIDUAL) return `User: ${this.scopeId}`;
    return 'Unknown';
  }

  // Policy evaluation methods
  async evaluate(context: Record<string, any>): Promise<{
    result: 'allow' | 'deny' | 'warn';
    actions: Array<{ type: string; parameters?: any }>;
    reason?: string;
  }> {
    try {
      // Evaluate conditions
      const conditionsMet = this.evaluateConditions(context);

      if (!conditionsMet) {
        return {
          result: 'allow',
          actions: [],
          reason: 'Conditions not met',
        };
      }

      // Check for exceptions
      const exception = this.checkExceptions(context);
      if (exception) {
        return {
          result: exception.action as any,
          actions: [exception],
          reason: `Exception applied: ${exception.condition}`,
        };
      }

      // Return configured actions
      return {
        result: this.rules.actions[0]?.type as any || 'allow',
        actions: this.rules.actions,
      };
    } catch (error) {
      return {
        result: 'deny',
        actions: [{ type: 'log', parameters: { error: error.message } }],
        reason: `Policy evaluation error: ${error.message}`,
      };
    }
  }

  private evaluateConditions(context: Record<string, any>): boolean {
    if (!this.rules.conditions || this.rules.conditions.length === 0) {
      return true;
    }

    let result = true;

    for (const condition of this.rules.conditions) {
      const conditionResult = this.evaluateCondition(condition, context);
      const logicalOp = condition.logicalOperator || 'AND';

      if (logicalOp === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
    }

    return result;
  }

  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(conditionValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      default:
        return false;
    }
  }

  private checkExceptions(context: Record<string, any>): any {
    if (!this.rules.exceptions) return null;

    for (const exception of this.rules.exceptions) {
      if (this.evaluateCondition({ field: exception.condition, operator: 'equals', value: true }, context)) {
        return { type: exception.action };
      }
    }

    return null;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Factory methods for common policies
  static createPasswordPolicy(
    name: string,
    rules: any,
    createdBy: string,
  ): Partial<SecurityPolicy> {
    return {
      name,
      displayName: `${name} Password Policy`,
      description: 'Password security requirements and restrictions',
      type: PolicyType.PASSWORD_POLICY,
      scope: PolicyScope.GLOBAL,
      rules,
      createdBy,
      isMandatory: true,
      priority: 90,
    };
  }

  static createAccessControlPolicy(
    name: string,
    resourceType: string,
    rules: any,
    createdBy: string,
  ): Partial<SecurityPolicy> {
    return {
      name,
      displayName: `${name} Access Control`,
      description: `Access control policy for ${resourceType}`,
      type: PolicyType.ACCESS_CONTROL,
      scope: PolicyScope.GLOBAL,
      rules,
      createdBy,
      priority: 80,
    };
  }

  static createDataRetentionPolicy(
    dataType: string,
    retentionDays: number,
    createdBy: string,
  ): Partial<SecurityPolicy> {
    return {
      name: `${dataType}_retention`,
      displayName: `${dataType} Data Retention Policy`,
      description: `Data retention policy for ${dataType}`,
      type: PolicyType.RETENTION_POLICY,
      scope: PolicyScope.GLOBAL,
      rules: {
        conditions: [{ field: 'dataType', operator: 'equals', value: dataType }],
        actions: [{ type: 'log', parameters: { retentionDays } }],
      },
      createdBy,
      priority: 70,
    };
  }
}