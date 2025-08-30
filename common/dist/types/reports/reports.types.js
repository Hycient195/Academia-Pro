"use strict";
// Academia Pro - Reports & Analytics Types
// Shared type definitions for reports and analytics module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTimeRange = exports.TMetricType = exports.TChartType = exports.TReportFrequency = exports.TReportFormat = exports.TReportType = void 0;
// Enums
var TReportType;
(function (TReportType) {
    TReportType["STUDENT_PERFORMANCE"] = "student_performance";
    TReportType["ATTENDANCE_ANALYTICS"] = "attendance_analytics";
    TReportType["FINANCIAL_REPORTS"] = "financial_reports";
    TReportType["STAFF_ANALYTICS"] = "staff_analytics";
    TReportType["ASSET_UTILIZATION"] = "asset_utilization";
    TReportType["ACADEMIC_PROGRESS"] = "academic_progress";
    TReportType["ENROLLMENT_TRENDS"] = "enrollment_trends";
    TReportType["FEE_COLLECTION"] = "fee_collection";
    TReportType["EXAMINATION_RESULTS"] = "examination_results";
    TReportType["TRANSPORTATION_USAGE"] = "transportation_usage";
    TReportType["LIBRARY_UTILIZATION"] = "library_utilization";
    TReportType["HOSTEL_OCCUPANCY"] = "hostel_occupancy";
    TReportType["COMMUNICATION_METRICS"] = "communication_metrics";
    TReportType["MAINTENANCE_REPORTS"] = "maintenance_reports";
    TReportType["CUSTOM_REPORT"] = "custom_report";
})(TReportType || (exports.TReportType = TReportType = {}));
var TReportFormat;
(function (TReportFormat) {
    TReportFormat["PDF"] = "pdf";
    TReportFormat["EXCEL"] = "excel";
    TReportFormat["CSV"] = "csv";
    TReportFormat["JSON"] = "json";
    TReportFormat["HTML"] = "html";
})(TReportFormat || (exports.TReportFormat = TReportFormat = {}));
var TReportFrequency;
(function (TReportFrequency) {
    TReportFrequency["DAILY"] = "daily";
    TReportFrequency["WEEKLY"] = "weekly";
    TReportFrequency["MONTHLY"] = "monthly";
    TReportFrequency["QUARTERLY"] = "quarterly";
    TReportFrequency["YEARLY"] = "yearly";
    TReportFrequency["AD_HOC"] = "ad_hoc";
})(TReportFrequency || (exports.TReportFrequency = TReportFrequency = {}));
var TChartType;
(function (TChartType) {
    TChartType["BAR_CHART"] = "bar_chart";
    TChartType["LINE_CHART"] = "line_chart";
    TChartType["PIE_CHART"] = "pie_chart";
    TChartType["AREA_CHART"] = "area_chart";
    TChartType["SCATTER_PLOT"] = "scatter_plot";
    TChartType["HEATMAP"] = "heatmap";
    TChartType["GAUGE_CHART"] = "gauge_chart";
    TChartType["TABLE"] = "table";
})(TChartType || (exports.TChartType = TChartType = {}));
var TMetricType;
(function (TMetricType) {
    TMetricType["COUNT"] = "count";
    TMetricType["SUM"] = "sum";
    TMetricType["AVERAGE"] = "average";
    TMetricType["PERCENTAGE"] = "percentage";
    TMetricType["RATIO"] = "ratio";
    TMetricType["TREND"] = "trend";
    TMetricType["COMPARISON"] = "comparison";
})(TMetricType || (exports.TMetricType = TMetricType = {}));
var TTimeRange;
(function (TTimeRange) {
    TTimeRange["TODAY"] = "today";
    TTimeRange["YESTERDAY"] = "yesterday";
    TTimeRange["THIS_WEEK"] = "this_week";
    TTimeRange["LAST_WEEK"] = "last_week";
    TTimeRange["THIS_MONTH"] = "this_month";
    TTimeRange["LAST_MONTH"] = "last_month";
    TTimeRange["THIS_QUARTER"] = "this_quarter";
    TTimeRange["LAST_QUARTER"] = "last_quarter";
    TTimeRange["THIS_YEAR"] = "this_year";
    TTimeRange["LAST_YEAR"] = "last_year";
    TTimeRange["CUSTOM"] = "custom";
})(TTimeRange || (exports.TTimeRange = TTimeRange = {}));
// All types are exported above with their declarations
//# sourceMappingURL=reports.types.js.map