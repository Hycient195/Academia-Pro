"use strict";
// Academia Pro - Staff & HR Management Types
// Shared type definitions for staff and HR management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDepartmentType = exports.TLeaveStatus = exports.TLeaveType = exports.TQualificationLevel = exports.TPosition = exports.TDepartment = exports.TEmploymentStatus = exports.TEmploymentType = exports.TBloodGroup = void 0;
const shared_1 = require("../shared");
Object.defineProperty(exports, "TBloodGroup", { enumerable: true, get: function () { return shared_1.TBloodGroup; } });
// Enums
var TEmploymentType;
(function (TEmploymentType) {
    TEmploymentType["FULL_TIME"] = "full_time";
    TEmploymentType["PART_TIME"] = "part_time";
    TEmploymentType["CONTRACT"] = "contract";
    TEmploymentType["TEMPORARY"] = "temporary";
    TEmploymentType["INTERN"] = "intern";
})(TEmploymentType || (exports.TEmploymentType = TEmploymentType = {}));
var TEmploymentStatus;
(function (TEmploymentStatus) {
    TEmploymentStatus["ACTIVE"] = "active";
    TEmploymentStatus["INACTIVE"] = "inactive";
    TEmploymentStatus["TERMINATED"] = "terminated";
    TEmploymentStatus["ON_LEAVE"] = "on_leave";
    TEmploymentStatus["SUSPENDED"] = "suspended";
})(TEmploymentStatus || (exports.TEmploymentStatus = TEmploymentStatus = {}));
var TDepartment;
(function (TDepartment) {
    TDepartment["ACADEMIC"] = "academic";
    TDepartment["ADMINISTRATIVE"] = "administrative";
    TDepartment["SUPPORT"] = "support";
    TDepartment["TECHNICAL"] = "technical";
    TDepartment["MEDICAL"] = "medical";
    TDepartment["SECURITY"] = "security";
    TDepartment["TRANSPORT"] = "transport";
    TDepartment["HOSTEL"] = "hostel";
    TDepartment["LIBRARY"] = "library";
    TDepartment["SPORTS"] = "sports";
})(TDepartment || (exports.TDepartment = TDepartment = {}));
var TPosition;
(function (TPosition) {
    TPosition["PRINCIPAL"] = "principal";
    TPosition["VICE_PRINCIPAL"] = "vice_principal";
    TPosition["HEADMASTER"] = "headmaster";
    TPosition["TEACHER"] = "teacher";
    TPosition["LIBRARIAN"] = "librarian";
    TPosition["ACCOUNTANT"] = "accountant";
    TPosition["ADMINISTRATOR"] = "administrator";
    TPosition["CLERK"] = "clerk";
    TPosition["DRIVER"] = "driver";
    TPosition["SECURITY_GUARD"] = "security_guard";
    TPosition["NURSE"] = "nurse";
    TPosition["TECHNICIAN"] = "technician";
    TPosition["JANITOR"] = "janitor";
    TPosition["COOK"] = "cook";
    TPosition["SECRETARY"] = "secretary";
})(TPosition || (exports.TPosition = TPosition = {}));
var TQualificationLevel;
(function (TQualificationLevel) {
    TQualificationLevel["HIGH_SCHOOL"] = "high_school";
    TQualificationLevel["DIPLOMA"] = "diploma";
    TQualificationLevel["BACHELORS"] = "bachelors";
    TQualificationLevel["MASTERS"] = "masters";
    TQualificationLevel["PHD"] = "phd";
    TQualificationLevel["PROFESSIONAL_CERTIFICATION"] = "professional_certification";
})(TQualificationLevel || (exports.TQualificationLevel = TQualificationLevel = {}));
var TLeaveType;
(function (TLeaveType) {
    TLeaveType["ANNUAL"] = "annual";
    TLeaveType["SICK"] = "sick";
    TLeaveType["MATERNITY"] = "maternity";
    TLeaveType["PATERNITY"] = "paternity";
    TLeaveType["EMERGENCY"] = "emergency";
    TLeaveType["STUDY"] = "study";
    TLeaveType["SABBATICAL"] = "sabbatical";
})(TLeaveType || (exports.TLeaveType = TLeaveType = {}));
var TLeaveStatus;
(function (TLeaveStatus) {
    TLeaveStatus["PENDING"] = "pending";
    TLeaveStatus["APPROVED"] = "approved";
    TLeaveStatus["REJECTED"] = "rejected";
    TLeaveStatus["CANCELLED"] = "cancelled";
    TLeaveStatus["COMPLETED"] = "completed";
})(TLeaveStatus || (exports.TLeaveStatus = TLeaveStatus = {}));
// Department Types
var EDepartmentType;
(function (EDepartmentType) {
    EDepartmentType["ADMINISTRATION"] = "administration";
    EDepartmentType["TEACHING"] = "teaching";
    EDepartmentType["MEDICAL"] = "medical";
    EDepartmentType["COUNSELING"] = "counseling";
    EDepartmentType["BOARDING"] = "boarding";
    EDepartmentType["TRANSPORTATION"] = "transportation";
    EDepartmentType["CATERING"] = "catering";
    EDepartmentType["FACILITIES"] = "facilities";
    EDepartmentType["OPERATIONS"] = "operations";
    EDepartmentType["SECURITY"] = "security";
    EDepartmentType["FINANCE"] = "finance";
    EDepartmentType["HR"] = "hr";
    EDepartmentType["IT"] = "it";
    EDepartmentType["LIBRARY"] = "library";
    EDepartmentType["SPORTS"] = "sports";
    EDepartmentType["ARTS"] = "arts";
    EDepartmentType["EXAMINATIONS"] = "examinations";
})(EDepartmentType || (exports.EDepartmentType = EDepartmentType = {}));
// All types are exported above with their declarations
