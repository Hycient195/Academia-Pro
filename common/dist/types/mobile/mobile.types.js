"use strict";
// Academia Pro - Mobile Application Types
// Shared type definitions for mobile app endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTransportStatus = exports.TAssignmentPriority = exports.TAssignmentStatus = exports.TEmergencySeverity = exports.TEmergencyType = exports.TNotificationType = exports.TMobileDeviceType = exports.TMobilePlatform = void 0;
// Enums
var TMobilePlatform;
(function (TMobilePlatform) {
    TMobilePlatform["IOS"] = "ios";
    TMobilePlatform["ANDROID"] = "android";
    TMobilePlatform["WEB"] = "web";
})(TMobilePlatform || (exports.TMobilePlatform = TMobilePlatform = {}));
var TMobileDeviceType;
(function (TMobileDeviceType) {
    TMobileDeviceType["PHONE"] = "phone";
    TMobileDeviceType["TABLET"] = "tablet";
    TMobileDeviceType["DESKTOP"] = "desktop";
})(TMobileDeviceType || (exports.TMobileDeviceType = TMobileDeviceType = {}));
var TNotificationType;
(function (TNotificationType) {
    TNotificationType["ASSIGNMENT"] = "assignment";
    TNotificationType["GRADE"] = "grade";
    TNotificationType["ATTENDANCE"] = "attendance";
    TNotificationType["EVENT"] = "event";
    TNotificationType["ANNOUNCEMENT"] = "announcement";
    TNotificationType["EMERGENCY"] = "emergency";
    TNotificationType["SYSTEM"] = "system";
})(TNotificationType || (exports.TNotificationType = TNotificationType = {}));
var TEmergencyType;
(function (TEmergencyType) {
    TEmergencyType["MEDICAL"] = "medical";
    TEmergencyType["SAFETY"] = "safety";
    TEmergencyType["TRANSPORT"] = "transport";
    TEmergencyType["BULLYING"] = "bullying";
    TEmergencyType["OTHER"] = "other";
})(TEmergencyType || (exports.TEmergencyType = TEmergencyType = {}));
var TEmergencySeverity;
(function (TEmergencySeverity) {
    TEmergencySeverity["LOW"] = "low";
    TEmergencySeverity["MEDIUM"] = "medium";
    TEmergencySeverity["HIGH"] = "high";
    TEmergencySeverity["CRITICAL"] = "critical";
})(TEmergencySeverity || (exports.TEmergencySeverity = TEmergencySeverity = {}));
var TAssignmentStatus;
(function (TAssignmentStatus) {
    TAssignmentStatus["PENDING"] = "pending";
    TAssignmentStatus["SUBMITTED"] = "submitted";
    TAssignmentStatus["GRADED"] = "graded";
    TAssignmentStatus["OVERDUE"] = "overdue";
})(TAssignmentStatus || (exports.TAssignmentStatus = TAssignmentStatus = {}));
var TAssignmentPriority;
(function (TAssignmentPriority) {
    TAssignmentPriority["LOW"] = "low";
    TAssignmentPriority["NORMAL"] = "normal";
    TAssignmentPriority["HIGH"] = "high";
    TAssignmentPriority["URGENT"] = "urgent";
})(TAssignmentPriority || (exports.TAssignmentPriority = TAssignmentPriority = {}));
var TTransportStatus;
(function (TTransportStatus) {
    TTransportStatus["ON_TIME"] = "on_time";
    TTransportStatus["DELAYED"] = "delayed";
    TTransportStatus["CANCELLED"] = "cancelled";
    TTransportStatus["EMERGENCY"] = "emergency";
})(TTransportStatus || (exports.TTransportStatus = TTransportStatus = {}));
//# sourceMappingURL=mobile.types.js.map