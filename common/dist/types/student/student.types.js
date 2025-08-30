"use strict";
// Academia Pro - Student Shared Types
// Shared types and interfaces for student management across frontend and backend
Object.defineProperty(exports, "__esModule", { value: true });
exports.TBloodGroup = exports.TEnrollmentType = exports.TStudentStatus = void 0;
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
var TBloodGroup;
(function (TBloodGroup) {
    TBloodGroup["A_POSITIVE"] = "A+";
    TBloodGroup["A_NEGATIVE"] = "A-";
    TBloodGroup["B_POSITIVE"] = "B+";
    TBloodGroup["B_NEGATIVE"] = "B-";
    TBloodGroup["AB_POSITIVE"] = "AB+";
    TBloodGroup["AB_NEGATIVE"] = "AB-";
    TBloodGroup["O_POSITIVE"] = "O+";
    TBloodGroup["O_NEGATIVE"] = "O-";
})(TBloodGroup || (exports.TBloodGroup = TBloodGroup = {}));
// All types are exported above with their declarations
//# sourceMappingURL=student.types.js.map