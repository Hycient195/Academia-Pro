"use strict";
// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TNotificationPreference = exports.TAppointmentStatus = exports.TPortalAccessLevel = exports.TParentRelationship = void 0;
// Enums
var TParentRelationship;
(function (TParentRelationship) {
    TParentRelationship["FATHER"] = "father";
    TParentRelationship["MOTHER"] = "mother";
    TParentRelationship["GUARDIAN"] = "guardian";
    TParentRelationship["GRANDPARENT"] = "grandparent";
    TParentRelationship["OTHER"] = "other";
})(TParentRelationship || (exports.TParentRelationship = TParentRelationship = {}));
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
    TAppointmentStatus["SCHEDULED"] = "scheduled";
    TAppointmentStatus["CONFIRMED"] = "confirmed";
    TAppointmentStatus["COMPLETED"] = "completed";
    TAppointmentStatus["CANCELLED"] = "cancelled";
    TAppointmentStatus["NO_SHOW"] = "no_show";
})(TAppointmentStatus || (exports.TAppointmentStatus = TAppointmentStatus = {}));
var TNotificationPreference;
(function (TNotificationPreference) {
    TNotificationPreference["EMAIL"] = "email";
    TNotificationPreference["SMS"] = "sms";
    TNotificationPreference["PUSH"] = "push";
    TNotificationPreference["IN_APP"] = "in_app";
    TNotificationPreference["NONE"] = "none";
})(TNotificationPreference || (exports.TNotificationPreference = TNotificationPreference = {}));
// All types are exported above with their declarations
