"use strict";
// Academia Pro - Shared Types
// Common types used across multiple modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.createUserSchema = exports.searchSchema = exports.paginationSchema = exports.addressSchema = exports.TNotificationType = exports.TMessagePriority = exports.TSubjectType = exports.TGradeLevel = exports.TSchoolStatus = exports.TSchoolType = exports.TBloodGroup = exports.TDepreciationMethod = exports.TCommunicationChannel = exports.TCommunicationType = void 0;
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
    TSchoolType["PRESCHOOL"] = "preschool";
    TSchoolType["ELEMENTARY"] = "elementary";
    TSchoolType["MIDDLE_SCHOOL"] = "middle_school";
    TSchoolType["HIGH_SCHOOL"] = "high_school";
    TSchoolType["SENIOR_SECONDARY"] = "senior_secondary";
    TSchoolType["UNIVERSITY"] = "university";
    TSchoolType["COLLEGE"] = "college";
    TSchoolType["INSTITUTE"] = "institute";
    TSchoolType["TRAINING_CENTER"] = "training_center";
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
// Message Priority Enum (moved from communication to avoid circular dependency)
var TMessagePriority;
(function (TMessagePriority) {
    TMessagePriority["LOW"] = "low";
    TMessagePriority["NORMAL"] = "normal";
    TMessagePriority["HIGH"] = "high";
    TMessagePriority["URGENT"] = "urgent";
})(TMessagePriority || (exports.TMessagePriority = TMessagePriority = {}));
// Notification Types
var TNotificationType;
(function (TNotificationType) {
    TNotificationType["INFO"] = "info";
    TNotificationType["SUCCESS"] = "success";
    TNotificationType["WARNING"] = "warning";
    TNotificationType["ERROR"] = "error";
})(TNotificationType || (exports.TNotificationType = TNotificationType = {}));
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
// Validation Schemas (using Zod)
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50),
    roles: zod_1.z.array(zod_1.z.enum(['super-admin', 'delegated-super-admin', 'school-admin', 'teacher', 'student', 'parent'])).min(1, 'At least one role is required'),
    phone: zod_1.z.string().optional(),
    schoolId: zod_1.z.string().optional(),
    sendWelcomeEmail: zod_1.z.boolean().default(true),
});
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    phone: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.date().optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    address: zod_1.z.object({
        street: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        postalCode: zod_1.z.string(),
        country: zod_1.z.string(),
    }).optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
