"use strict";
// Academia Pro - Parent Portal Types
// Shared type definitions for parent portal and family communication module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAcademicAlertType = exports.TResourceType = exports.TAppointmentType = void 0;
var TAppointmentType;
(function (TAppointmentType) {
    TAppointmentType["PARENT_TEACHER"] = "parent_teacher";
    TAppointmentType["COUNSELING"] = "counseling";
    TAppointmentType["ADMINISTRATIVE"] = "administrative";
    TAppointmentType["MEDICAL"] = "medical";
    TAppointmentType["OTHER"] = "other";
})(TAppointmentType || (exports.TAppointmentType = TAppointmentType = {}));
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
