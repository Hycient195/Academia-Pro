"use strict";
// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAppointmentStatus = exports.TPortalAccessLevel = exports.TCommunicationType = exports.TNotificationPreference = exports.TParentRelationship = void 0;
// Enums
var TParentRelationship;
(function (TParentRelationship) {
    TParentRelationship["FATHER"] = "father";
    TParentRelationship["MOTHER"] = "mother";
    TParentRelationship["GUARDIAN"] = "guardian";
    TParentRelationship["GRANDPARENT"] = "grandparent";
    TParentRelationship["OTHER"] = "other";
})(TParentRelationship || (exports.TParentRelationship = TParentRelationship = {}));
var TNotificationPreference;
(function (TNotificationPreference) {
    TNotificationPreference["EMAIL"] = "email";
    TNotificationPreference["SMS"] = "sms";
    TNotificationPreference["PUSH"] = "push";
    TNotificationPreference["IN_APP"] = "in_app";
    TNotificationPreference["NONE"] = "none";
})(TNotificationPreference || (exports.TNotificationPreference = TNotificationPreference = {}));
var TCommunicationType;
(function (TCommunicationType) {
    TCommunicationType["ANNOUNCEMENT"] = "announcement";
    TCommunicationType["ASSIGNMENT"] = "assignment";
    TCommunicationType["GRADE"] = "grade";
    TCommunicationType["ATTENDANCE"] = "attendance";
    TCommunicationType["EVENT"] = "event";
    TCommunicationType["EMERGENCY"] = "emergency";
    TCommunicationType["GENERAL"] = "general";
})(TCommunicationType || (exports.TCommunicationType = TCommunicationType = {}));
var TPortalAccessLevel;
(function (TPortalAccessLevel) {
    TPortalAccessLevel["FULL_ACCESS"] = "full_access";
    TPortalAccessLevel["LIMITED_ACCESS"] = "limited_access";
    TPortalAccessLevel["VIEW_ONLY"] = "view_only";
    TPortalAccessLevel["EMERGENCY_ONLY"] = "emergency_only";
})(TPortalAccessLevel || (exports.TPortalAccessLevel = TPortalAccessLevel = {}));
var TAppointmentStatus;
(function (TAppointmentStatus) {
    TAppointmentStatus["REQUESTED"] = "requested";
    TAppointmentStatus["APPROVED"] = "approved";
    TAppointmentStatus["REJECTED"] = "rejected";
    TAppointmentStatus["COMPLETED"] = "completed";
    TAppointmentStatus["CANCELLED"] = "cancelled";
})(TAppointmentStatus || (exports.TAppointmentStatus = TAppointmentStatus = {}));
// All types are exported above with their declarations
//# sourceMappingURL=parent.types.js.map