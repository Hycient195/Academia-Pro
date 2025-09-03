"use strict";
// Academia Pro - Shared Types
// Common types used across multiple modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchema = exports.paginationSchema = exports.addressSchema = exports.TSubjectType = exports.TGradeLevel = exports.TSchoolStatus = exports.TSchoolType = exports.TBloodGroup = exports.TDepreciationMethod = exports.TCommunicationChannel = exports.TCommunicationType = void 0;
const zod_1 = require("zod");
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
var TCommunicationChannel;
(function (TCommunicationChannel) {
    TCommunicationChannel["EMAIL"] = "email";
    TCommunicationChannel["SMS"] = "sms";
    TCommunicationChannel["PUSH"] = "push";
    TCommunicationChannel["IN_APP"] = "in_app";
    TCommunicationChannel["CALL"] = "call";
})(TCommunicationChannel || (exports.TCommunicationChannel = TCommunicationChannel = {}));
var TDepreciationMethod;
(function (TDepreciationMethod) {
    TDepreciationMethod["STRAIGHT_LINE"] = "straight_line";
    TDepreciationMethod["DECLINING_BALANCE"] = "declining_balance";
    TDepreciationMethod["UNITS_OF_PRODUCTION"] = "units_of_production";
})(TDepreciationMethod || (exports.TDepreciationMethod = TDepreciationMethod = {}));
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
var TSchoolType;
(function (TSchoolType) {
    TSchoolType["PRIMARY"] = "primary";
    TSchoolType["SECONDARY"] = "secondary";
    TSchoolType["MIXED"] = "mixed";
})(TSchoolType || (exports.TSchoolType = TSchoolType = {}));
var TSchoolStatus;
(function (TSchoolStatus) {
    TSchoolStatus["ACTIVE"] = "active";
    TSchoolStatus["INACTIVE"] = "inactive";
    TSchoolStatus["SUSPENDED"] = "suspended";
    TSchoolStatus["CLOSED"] = "closed";
})(TSchoolStatus || (exports.TSchoolStatus = TSchoolStatus = {}));
var TGradeLevel;
(function (TGradeLevel) {
    TGradeLevel["NURSERY"] = "nursery";
    TGradeLevel["LKG"] = "lkg";
    TGradeLevel["UKG"] = "ukg";
    TGradeLevel["GRADE_1"] = "grade_1";
    TGradeLevel["GRADE_2"] = "grade_2";
    TGradeLevel["GRADE_3"] = "grade_3";
    TGradeLevel["GRADE_4"] = "grade_4";
    TGradeLevel["GRADE_5"] = "grade_5";
    TGradeLevel["GRADE_6"] = "grade_6";
    TGradeLevel["GRADE_7"] = "grade_7";
    TGradeLevel["GRADE_8"] = "grade_8";
    TGradeLevel["GRADE_9"] = "grade_9";
    TGradeLevel["GRADE_10"] = "grade_10";
    TGradeLevel["GRADE_11"] = "grade_11";
    TGradeLevel["GRADE_12"] = "grade_12";
})(TGradeLevel || (exports.TGradeLevel = TGradeLevel = {}));
var TSubjectType;
(function (TSubjectType) {
    TSubjectType["CORE"] = "core";
    TSubjectType["ELECTIVE"] = "elective";
    TSubjectType["PRACTICAL"] = "practical";
    TSubjectType["LANGUAGE"] = "language";
    TSubjectType["ARTS"] = "arts";
    TSubjectType["SPORTS"] = "sports";
})(TSubjectType || (exports.TSubjectType = TSubjectType = {}));
// Common Validation Schemas
exports.addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Street is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    postalCode: zod_1.z.string().min(1, 'Postal code is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    coordinates: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
exports.searchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    dateRange: zod_1.z.object({
        start: zod_1.z.date(),
        end: zod_1.z.date(),
    }).optional(),
});
//# sourceMappingURL=shared.types.js.map