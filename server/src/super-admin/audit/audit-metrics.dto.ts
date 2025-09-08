import { IsOptional, IsString, IsDateString, IsArray, IsIn, IsBoolean, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AuditMetricsFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  schoolIds?: string[];

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['low', 'medium', 'high', 'critical'], { each: true })
  severities?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['hour', 'day', 'week', 'month', 'year'])
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  timeRange?: number = 30; // days

  @IsOptional()
  @IsBoolean()
  includeInactiveSchools?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeSystemEvents?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeActions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeActions?: string[];
}

export class AuditDashboardDto {
  summary: {
    totalLogs: number;
    totalSchools: number;
    totalUsers: number;
    averageLogsPerDay: number;
    criticalEventsCount: number;
    recentActivityCount: number;
  };

  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  actionBreakdown: Record<string, number>;

  resourceBreakdown: Record<string, number>;

  topUsers: Array<{
    userId: string;
    userName: string;
    schoolName: string;
    logCount: number;
    lastActivity: Date;
  }>;

  topSchools: Array<{
    schoolId: string;
    schoolName: string;
    logCount: number;
    userCount: number;
    averageSeverity: string;
  }>;

  recentCriticalEvents: Array<{
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    severity: string;
    details: Record<string, any>;
  }>;

  trends: {
    dailyActivity: Array<{
      date: string;
      count: number;
      severityBreakdown: Record<string, number>;
    }>;
    weeklyActivity: Array<{
      week: string;
      count: number;
      growth: number;
    }>;
    monthlyActivity: Array<{
      month: string;
      count: number;
      growth: number;
    }>;
  };

  anomalies: Array<{
    type: string;
    description: string;
    severity: string;
    detectedAt: Date;
    affectedEntities: string[];
    recommendedActions: string[];
  }>;

  compliance: {
    gdprCompliant: number;
    gdprViolations: number;
    dataRetentionCompliant: number;
    dataRetentionViolations: number;
    parentConsentRequired: number;
    parentConsentObtained: number;
  };
}

export class AuditTrendsDto {
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  periods?: number = 30;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[] = ['totalLogs', 'criticalEvents', 'uniqueUsers', 'uniqueResources'];

  @IsOptional()
  @IsBoolean()
  includeGrowth?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includePercentiles?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  percentiles?: number[] = [25, 50, 75, 95];
}

export class AuditAnomaliesDto {
  @IsOptional()
  @IsString()
  @IsIn(['realtime', 'daily', 'weekly'])
  detectionMode?: 'realtime' | 'daily' | 'weekly' = 'daily';

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  sensitivity?: number = 2.0; // Standard deviations

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anomalyTypes?: string[] = [
    'spike_in_activity',
    'unusual_login_times',
    'suspicious_ip_addresses',
    'repeated_failed_actions',
    'unusual_resource_access',
    'bulk_data_operations'
  ];

  @IsOptional()
  @IsBoolean()
  includeHistorical?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  lookbackDays?: number = 30;

  @IsOptional()
  @IsBoolean()
  autoResolve?: boolean = false;
}

export class AuditMetricsResponseDto {
  timestamp: Date;
  period: string;
  metrics: {
    totalLogs: number;
    uniqueUsers: number;
    uniqueSchools: number;
    uniqueResources: number;
    averageLogsPerUser: number;
    averageLogsPerSchool: number;
    criticalEvents: number;
    highSeverityEvents: number;
    failedAuthentications: number;
    successfulAuthentications: number;
    dataAccessEvents: number;
    securityEvents: number;
    systemEvents: number;
    apiCalls: number;
    errorRate: number;
    responseTimeAvg: number;
    topActions: Array<{
      action: string;
      count: number;
      percentage: number;
    }>;
    topResources: Array<{
      resource: string;
      count: number;
      percentage: number;
    }>;
    geographicDistribution: Array<{
      country: string;
      region: string;
      count: number;
    }>;
    deviceTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  trends: {
    growth: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
    threshold: number;
    current: number;
  }>;
}