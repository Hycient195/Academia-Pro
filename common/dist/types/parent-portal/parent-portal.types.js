"use strict";
// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal and family communication module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTransportationStatus = exports.TFeeStatus = exports.TAcademicAlertType = exports.TResourceType = exports.TNotificationStatus = exports.TMessagePriority = exports.TAppointmentType = exports.TAppointmentStatus = exports.TCommunicationType = exports.TParentRelationship = void 0;
// Enums
var TParentRelationship;
(function (TParentRelationship) {
    TParentRelationship["FATHER"] = "father";
    TParentRelationship["MOTHER"] = "mother";
    TParentRelationship["GUARDIAN"] = "guardian";
    TParentRelationship["GRANDPARENT"] = "grandparent";
    TParentRelationship["OTHER"] = "other";
})(TParentRelationship || (exports.TParentRelationship = TParentRelationship = {}));
var TCommunicationType;
(function (TCommunicationType) {
    TCommunicationType["EMAIL"] = "email";
    TCommunicationType["SMS"] = "sms";
    TCommunicationType["PUSH"] = "push";
    TCommunicationType["IN_APP"] = "in_app";
    TCommunicationType["CALL"] = "call";
})(TCommunicationType || (exports.TCommunicationType = TCommunicationType = {}));
var TAppointmentStatus;
(function (TAppointmentStatus) {
    TAppointmentStatus["SCHEDULED"] = "scheduled";
    TAppointmentStatus["CONFIRMED"] = "confirmed";
    TAppointmentStatus["COMPLETED"] = "completed";
    TAppointmentStatus["CANCELLED"] = "cancelled";
    TAppointmentStatus["NO_SHOW"] = "no_show";
})(TAppointmentStatus || (exports.TAppointmentStatus = TAppointmentStatus = {}));
var TAppointmentType;
(function (TAppointmentType) {
    TAppointmentType["PARENT_TEACHER"] = "parent_teacher";
    TAppointmentType["COUNSELING"] = "counseling";
    TAppointmentType["ADMINISTRATIVE"] = "administrative";
    TAppointmentType["MEDICAL"] = "medical";
    TAppointmentType["OTHER"] = "other";
})(TAppointmentType || (exports.TAppointmentType = TAppointmentType = {}));
var TMessagePriority;
(function (TMessagePriority) {
    TMessagePriority["LOW"] = "low";
    TMessagePriority["NORMAL"] = "normal";
    TMessagePriority["HIGH"] = "high";
    TMessagePriority["URGENT"] = "urgent";
})(TMessagePriority || (exports.TMessagePriority = TMessagePriority = {}));
var TNotificationStatus;
(function (TNotificationStatus) {
    TNotificationStatus["SENT"] = "sent";
    TNotificationStatus["DELIVERED"] = "delivered";
    TNotificationStatus["READ"] = "read";
    TNotificationStatus["FAILED"] = "failed";
})(TNotificationStatus || (exports.TNotificationStatus = TNotificationStatus = {}));
var TResourceType;
(function (TResourceType) {
    TResourceType["DOCUMENT"] = "document";
    TResourceType["VIDEO"] = "video";
    TResourceType["LINK"] = "link";
    TResourceType["GUIDE"] = "guide";
    TResourceType["FORM"] = "form";
})(TResourceType || (exports.TResourceType = TResourceType = {}));
var TAcademicAlertType;
(function (TAcademicAlertType) {
    TAcademicAlertType["GRADE_DROP"] = "grade_drop";
    TAcademicAlertType["ATTENDANCE_ISSUE"] = "attendance_issue";
    TAcademicAlertType["BEHAVIOR_CONCERN"] = "behavior_concern";
    TAcademicAlertType["ACADEMIC_IMPROVEMENT"] = "academic_improvement";
    TAcademicAlertType["ACHIEVEMENT"] = "achievement";
})(TAcademicAlertType || (exports.TAcademicAlertType = TAcademicAlertType = {}));
var TFeeStatus;
(function (TFeeStatus) {
    TFeeStatus["PAID"] = "paid";
    TFeeStatus["PENDING"] = "pending";
    TFeeStatus["OVERDUE"] = "overdue";
    TFeeStatus["PARTIAL"] = "partial";
    TFeeStatus["WAIVED"] = "waived";
})(TFeeStatus || (exports.TFeeStatus = TFeeStatus = {}));
var TTransportationStatus;
(function (TTransportationStatus) {
    TTransportationStatus["ACTIVE"] = "active";
    TTransportationStatus["INACTIVE"] = "inactive";
    TTransportationStatus["SUSPENDED"] = "suspended";
})(TTransportationStatus || (exports.TTransportationStatus = TTransportationStatus = {}));
//# sourceMappingURL=parent-portal.types.js.map