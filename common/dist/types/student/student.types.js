"use strict";
// Academia Pro - Student Shared Types
// Shared types and interfaces for student management across frontend and backend
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTransportationStatus = exports.TStudentStage = exports.TEnrollmentType = exports.TStudentStatus = void 0;
// Enums
var TStudentStatus;
(function (TStudentStatus) {
    TStudentStatus["ACTIVE"] = "active";
    TStudentStatus["INACTIVE"] = "inactive";
    TStudentStatus["GRADUATED"] = "graduated";
    TStudentStatus["TRANSFERRED"] = "transferred";
    TStudentStatus["WITHDRAWN"] = "withdrawn";
    TStudentStatus["SUSPENDED"] = "suspended";
})(TStudentStatus || (exports.TStudentStatus = TStudentStatus = {}));
var TEnrollmentType;
(function (TEnrollmentType) {
    TEnrollmentType["REGULAR"] = "regular";
    TEnrollmentType["SPECIAL_NEEDS"] = "special_needs";
    TEnrollmentType["GIFTED"] = "gifted";
    TEnrollmentType["INTERNATIONAL"] = "international";
    TEnrollmentType["TRANSFER"] = "transfer";
})(TEnrollmentType || (exports.TEnrollmentType = TEnrollmentType = {}));
var TStudentStage;
(function (TStudentStage) {
    TStudentStage["EY"] = "EY";
    TStudentStage["PRY"] = "PRY";
    TStudentStage["JSS"] = "JSS";
    TStudentStage["SSS"] = "SSS";
})(TStudentStage || (exports.TStudentStage = TStudentStage = {}));
var TTransportationStatus;
(function (TTransportationStatus) {
    TTransportationStatus["ACTIVE"] = "active";
    TTransportationStatus["INACTIVE"] = "inactive";
    TTransportationStatus["SUSPENDED"] = "suspended";
})(TTransportationStatus || (exports.TTransportationStatus = TTransportationStatus = {}));
