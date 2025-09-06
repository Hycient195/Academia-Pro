export declare enum TReportType {
    STUDENT_PERFORMANCE = "student_performance",
    ATTENDANCE_ANALYTICS = "attendance_analytics",
    FINANCIAL_REPORTS = "financial_reports",
    STAFF_ANALYTICS = "staff_analytics",
    ASSET_UTILIZATION = "asset_utilization",
    ACADEMIC_PROGRESS = "academic_progress",
    ENROLLMENT_TRENDS = "enrollment_trends",
    FEE_COLLECTION = "fee_collection",
    EXAMINATION_RESULTS = "examination_results",
    TRANSPORTATION_USAGE = "transportation_usage",
    LIBRARY_UTILIZATION = "library_utilization",
    HOSTEL_OCCUPANCY = "hostel_occupancy",
    COMMUNICATION_METRICS = "communication_metrics",
    MAINTENANCE_REPORTS = "maintenance_reports",
    CUSTOM_REPORT = "custom_report"
}
export declare enum TReportFormat {
    PDF = "pdf",
    EXCEL = "excel",
    CSV = "csv",
    JSON = "json",
    HTML = "html"
}
export declare enum TReportFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly",
    AD_HOC = "ad_hoc"
}
export declare enum TChartType {
    BAR_CHART = "bar_chart",
    LINE_CHART = "line_chart",
    PIE_CHART = "pie_chart",
    AREA_CHART = "area_chart",
    SCATTER_PLOT = "scatter_plot",
    HEATMAP = "heatmap",
    GAUGE_CHART = "gauge_chart",
    TABLE = "table"
}
export declare enum TMetricType {
    COUNT = "count",
    SUM = "sum",
    AVERAGE = "average",
    PERCENTAGE = "percentage",
    RATIO = "ratio",
    TREND = "trend",
    COMPARISON = "comparison"
}
export declare enum TTimeRange {
    TODAY = "today",
    YESTERDAY = "yesterday",
    THIS_WEEK = "this_week",
    LAST_WEEK = "last_week",
    THIS_MONTH = "this_month",
    LAST_MONTH = "last_month",
    THIS_QUARTER = "this_quarter",
    LAST_QUARTER = "last_quarter",
    THIS_YEAR = "this_year",
    LAST_YEAR = "last_year",
    CUSTOM = "custom"
}
export interface IReport {
    id: string;
    title: string;
    description?: string;
    type: TReportType;
    format: TReportFormat;
    frequency: TReportFrequency;
    parameters: IReportParameters;
    schedule?: IReportSchedule;
    isActive: boolean;
    isPublic: boolean;
    createdBy: string;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
    lastGeneratedAt?: Date;
    fileUrl?: string;
    fileSize?: number;
    expiresAt?: Date;
}
export interface IReportParameters {
    timeRange: TTimeRange;
    startDate?: Date;
    endDate?: Date;
    filters: IReportFilters;
    groupBy?: string[];
    metrics: IReportMetric[];
    chartType?: TChartType;
    includeCharts: boolean;
    includeTables: boolean;
}
export interface IReportFilters {
    schoolId: string;
    gradeIds?: string[];
    classIds?: string[];
    subjectIds?: string[];
    studentIds?: string[];
    staffIds?: string[];
    departmentIds?: string[];
    category?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
    search?: string;
}
export interface IReportMetric {
    name: string;
    type: TMetricType;
    field: string;
    label: string;
    format?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}
export interface IReportSchedule {
    frequency: TReportFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
    isActive: boolean;
    nextRun?: Date;
    lastRun?: Date;
}
export interface IDashboard {
    id: string;
    title: string;
    description?: string;
    layout: IDashboardLayout;
    widgets: IDashboardWidget[];
    isPublic: boolean;
    createdBy: string;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IDashboardLayout {
    columns: number;
    rows: number;
    gap: number;
    responsive: boolean;
}
export interface IDashboardWidget {
    id: string;
    title: string;
    type: 'chart' | 'metric' | 'table' | 'text' | 'image';
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    config: IWidgetConfig;
    dataSource: IDataSource;
    refreshInterval?: number;
}
export interface IWidgetConfig {
    chartType?: TChartType;
    showLegend?: boolean;
    showLabels?: boolean;
    colors?: string[];
    fontSize?: number;
    title?: string;
    subtitle?: string;
}
export interface IDataSource {
    type: 'report' | 'query' | 'api' | 'static';
    sourceId: string;
    parameters?: Record<string, any>;
    filters?: IReportFilters;
    refreshInterval?: number;
}
export interface IReportAnalyticsData {
    summary: IAnalyticsSummary;
    trends: ITrendData[];
    comparisons: IComparisonData[];
    breakdowns: IBreakdownData[];
    predictions?: IPredictionData[];
}
export interface IAnalyticsSummary {
    totalRecords: number;
    dateRange: {
        start: Date;
        end: Date;
    };
    keyMetrics: Record<string, number>;
    topPerformers: Array<{
        name: string;
        value: number;
        rank: number;
    }>;
    alerts: IAlertData[];
}
export interface ITrendData {
    metric: string;
    period: string;
    data: Array<{
        date: Date;
        value: number;
        change?: number;
        changePercent?: number;
    }>;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    forecast?: Array<{
        date: Date;
        predictedValue: number;
        confidence: number;
    }>;
}
export interface IComparisonData {
    metric: string;
    categories: string[];
    data: Array<{
        category: string;
        value: number;
        percentage: number;
        benchmark?: number;
    }>;
    comparisonType: 'category' | 'time' | 'group';
}
export interface IBreakdownData {
    dimension: string;
    total: number;
    segments: Array<{
        name: string;
        value: number;
        percentage: number;
        color?: string;
    }>;
    hierarchy?: IBreakdownData[];
}
export interface IPredictionData {
    metric: string;
    model: string;
    accuracy: number;
    predictions: Array<{
        date: Date;
        predictedValue: number;
        upperBound: number;
        lowerBound: number;
        confidence: number;
    }>;
    factors: Array<{
        factor: string;
        impact: number;
        direction: 'positive' | 'negative';
    }>;
}
export interface IAlertData {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    source: string;
    createdAt: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    actionRequired?: boolean;
    actionUrl?: string;
}
export interface ICreateReportRequest {
    title: string;
    description?: string;
    type: TReportType;
    format: TReportFormat;
    parameters: IReportParameters;
    schedule?: IReportSchedule;
    isPublic?: boolean;
    schoolId: string;
}
export interface IUpdateReportRequest {
    title?: string;
    description?: string;
    parameters?: Partial<IReportParameters>;
    schedule?: Partial<IReportSchedule>;
    isActive?: boolean;
    isPublic?: boolean;
}
export interface ICreateDashboardRequest {
    title: string;
    description?: string;
    layout: IDashboardLayout;
    widgets: Omit<IDashboardWidget, 'id'>[];
    isPublic?: boolean;
    schoolId: string;
}
export interface IGenerateReportRequest {
    reportId?: string;
    parameters?: IReportParameters;
    format?: TReportFormat;
    emailTo?: string[];
}
export interface IAnalyticsQueryRequest {
    metrics: string[];
    dimensions: string[];
    filters: IReportFilters;
    timeRange: TTimeRange;
    startDate?: Date;
    endDate?: Date;
    includeTrends?: boolean;
    includePredictions?: boolean;
}
export interface IReportResponse extends Omit<IReport, 'createdBy' | 'updatedAt'> {
    createdByUser: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    scheduleSummary?: {
        nextRun?: Date;
        lastRun?: Date;
        isOverdue: boolean;
    };
    generationStats?: {
        totalGenerations: number;
        averageGenerationTime: number;
        lastGenerationTime?: Date;
    };
    status: 'active' | 'inactive' | 'expired' | 'scheduled' | 'overdue';
    priority: 'low' | 'medium' | 'high' | 'critical';
    daysSinceLastGeneration: number;
    fileSizeFormatted: string;
    recipientCount: number;
    metricsCount: number;
    filtersCount: number;
}
export interface IReportListResponse {
    reports: IReportResponse[];
    total: number;
    page: number;
    limit: number;
    summary: {
        activeReports: number;
        scheduledReports: number;
        publicReports: number;
        totalGenerations: number;
    };
}
export interface IDashboardResponse extends Omit<IDashboard, 'createdBy'> {
    createdByUser: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    widgetsCount: number;
    lastViewedAt?: Date;
    viewCount: number;
}
export interface IDashboardListResponse {
    dashboards: IDashboardResponse[];
    total: number;
    page: number;
    limit: number;
}
export interface IAnalyticsResponse extends IReportAnalyticsData {
    query: IAnalyticsQueryRequest;
    generatedAt: Date;
    executionTime: number;
    dataQuality: {
        completeness: number;
        accuracy: number;
        timeliness: number;
    };
}
export interface IReportGenerationResponse {
    reportId: string;
    fileUrl: string;
    fileSize: number;
    format: TReportFormat;
    generatedAt: Date;
    expiresAt: Date;
    downloadUrl: string;
    previewUrl?: string;
}
export interface IReportFiltersQuery {
    schoolId: string;
    type?: TReportType;
    format?: TReportFormat;
    frequency?: TReportFrequency;
    isActive?: boolean;
    isPublic?: boolean;
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    search?: string;
}
export interface IDashboardFiltersQuery {
    schoolId: string;
    isPublic?: boolean;
    createdBy?: string;
    search?: string;
}
export interface IReportsStatisticsResponse {
    totalReports: number;
    activeReports: number;
    reportsByType: Record<TReportType, number>;
    reportsByFormat: Record<TReportFormat, number>;
    reportsByFrequency: Record<TReportFrequency, number>;
    totalGenerations: number;
    averageGenerationTime: number;
    storageUsed: number;
    topReportCreators: Array<{
        userId: string;
        userName: string;
        reportsCount: number;
    }>;
    generationTrends: Array<{
        date: Date;
        generations: number;
    }>;
}
export interface IDashboardsStatisticsResponse {
    totalDashboards: number;
    publicDashboards: number;
    totalWidgets: number;
    averageWidgetsPerDashboard: number;
    topDashboardCreators: Array<{
        userId: string;
        userName: string;
        dashboardsCount: number;
    }>;
    widgetTypeDistribution: Record<string, number>;
}
export interface IReportExportRequest {
    reportIds: string[];
    format: TReportFormat;
    includeData?: boolean;
    includeSchedule?: boolean;
}
export interface IReportImportRequest {
    file: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
    };
    schoolId: string;
    overwriteExisting?: boolean;
}
export interface IReportTemplate {
    id: string;
    name: string;
    description: string;
    type: TReportType;
    category: string;
    parameters: IReportParameters;
    isSystemTemplate: boolean;
    createdAt: Date;
    usageCount: number;
}
