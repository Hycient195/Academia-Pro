"use strict";
// Academia Pro - Common Types Index
// Export all type definitions from common package
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAppointmentStatus = exports.TCommunicationType = exports.TParentRelationship = exports.TCollaborationType = exports.TDiscussionType = exports.TEnrollmentStatus = exports.TProgressStatus = exports.TAssessmentType = exports.TLearningPathType = exports.TDifficultyLevel = exports.TContentStatus = exports.TContentType = exports.TTransportStatus = exports.TAssignmentPriority = exports.TAssignmentStatus = exports.TEmergencySeverity = exports.TEmergencyType = exports.TMobileDeviceType = exports.TMobilePlatform = exports.TReservationStatus = exports.TCheckoutStatus = exports.TAcquisitionMethod = exports.TLanguage = exports.TBookFormat = exports.TBookCategory = exports.TBookCondition = exports.TBookStatus = exports.TAttendanceMethod = exports.TAttendanceType = exports.TAttendanceStatus = exports.TAllocationStatus = exports.TFacilityType = exports.TBedStatus = exports.TRoomStatus = exports.TRoomType = exports.THostelStatus = exports.THostelType = exports.TLeaveStatus = exports.TLeaveType = exports.TQualificationLevel = exports.TPosition = exports.TDepartment = exports.TEmploymentStatus = exports.TEmploymentType = exports.TMaintenanceStatus = exports.TMaintenanceType = exports.TProcurementStatus = exports.TAssetStatus = exports.TDepreciationMethod = exports.TAssetCategory = void 0;
exports.TTransportationStatus = exports.TFeeStatus = exports.TAcademicAlertType = exports.TResourceType = exports.TNotificationStatus = exports.TMessagePriority = exports.TAppointmentType = void 0;
// Shared types
__exportStar(require("./shared"), exports);
// Module-specific types with explicit exports to resolve conflicts
__exportStar(require("./academic"), exports);
var inventory_1 = require("./inventory");
Object.defineProperty(exports, "TAssetCategory", { enumerable: true, get: function () { return inventory_1.TAssetCategory; } });
Object.defineProperty(exports, "TDepreciationMethod", { enumerable: true, get: function () { return inventory_1.TDepreciationMethod; } });
Object.defineProperty(exports, "TAssetStatus", { enumerable: true, get: function () { return inventory_1.TAssetStatus; } });
Object.defineProperty(exports, "TProcurementStatus", { enumerable: true, get: function () { return inventory_1.TProcurementStatus; } });
Object.defineProperty(exports, "TMaintenanceType", { enumerable: true, get: function () { return inventory_1.TMaintenanceType; } });
Object.defineProperty(exports, "TMaintenanceStatus", { enumerable: true, get: function () { return inventory_1.TMaintenanceStatus; } });
__exportStar(require("./parent"), exports);
__exportStar(require("./reports"), exports);
__exportStar(require("./schools"), exports);
__exportStar(require("./timetable"), exports);
var staff_1 = require("./staff");
Object.defineProperty(exports, "TEmploymentType", { enumerable: true, get: function () { return staff_1.TEmploymentType; } });
Object.defineProperty(exports, "TEmploymentStatus", { enumerable: true, get: function () { return staff_1.TEmploymentStatus; } });
Object.defineProperty(exports, "TDepartment", { enumerable: true, get: function () { return staff_1.TDepartment; } });
Object.defineProperty(exports, "TPosition", { enumerable: true, get: function () { return staff_1.TPosition; } });
Object.defineProperty(exports, "TQualificationLevel", { enumerable: true, get: function () { return staff_1.TQualificationLevel; } });
Object.defineProperty(exports, "TLeaveType", { enumerable: true, get: function () { return staff_1.TLeaveType; } });
Object.defineProperty(exports, "TLeaveStatus", { enumerable: true, get: function () { return staff_1.TLeaveStatus; } });
__exportStar(require("./student"), exports);
var hostel_1 = require("./hostel");
Object.defineProperty(exports, "THostelType", { enumerable: true, get: function () { return hostel_1.THostelType; } });
Object.defineProperty(exports, "THostelStatus", { enumerable: true, get: function () { return hostel_1.THostelStatus; } });
Object.defineProperty(exports, "TRoomType", { enumerable: true, get: function () { return hostel_1.TRoomType; } });
Object.defineProperty(exports, "TRoomStatus", { enumerable: true, get: function () { return hostel_1.TRoomStatus; } });
Object.defineProperty(exports, "TBedStatus", { enumerable: true, get: function () { return hostel_1.TBedStatus; } });
Object.defineProperty(exports, "TFacilityType", { enumerable: true, get: function () { return hostel_1.TFacilityType; } });
Object.defineProperty(exports, "TAllocationStatus", { enumerable: true, get: function () { return hostel_1.TAllocationStatus; } });
// New module types - explicit exports to avoid conflicts
__exportStar(require("./users"), exports);
__exportStar(require("./auth"), exports);
var attendance_1 = require("./attendance");
Object.defineProperty(exports, "TAttendanceStatus", { enumerable: true, get: function () { return attendance_1.TAttendanceStatus; } });
Object.defineProperty(exports, "TAttendanceType", { enumerable: true, get: function () { return attendance_1.TAttendanceType; } });
Object.defineProperty(exports, "TAttendanceMethod", { enumerable: true, get: function () { return attendance_1.TAttendanceMethod; } });
__exportStar(require("./communication"), exports);
__exportStar(require("./examination"), exports);
__exportStar(require("./fee"), exports);
__exportStar(require("./hostel"), exports);
var library_1 = require("./library");
Object.defineProperty(exports, "TBookStatus", { enumerable: true, get: function () { return library_1.TBookStatus; } });
Object.defineProperty(exports, "TBookCondition", { enumerable: true, get: function () { return library_1.TBookCondition; } });
Object.defineProperty(exports, "TBookCategory", { enumerable: true, get: function () { return library_1.TBookCategory; } });
Object.defineProperty(exports, "TBookFormat", { enumerable: true, get: function () { return library_1.TBookFormat; } });
Object.defineProperty(exports, "TLanguage", { enumerable: true, get: function () { return library_1.TLanguage; } });
Object.defineProperty(exports, "TAcquisitionMethod", { enumerable: true, get: function () { return library_1.TAcquisitionMethod; } });
Object.defineProperty(exports, "TCheckoutStatus", { enumerable: true, get: function () { return library_1.TCheckoutStatus; } });
Object.defineProperty(exports, "TReservationStatus", { enumerable: true, get: function () { return library_1.TReservationStatus; } });
var mobile_1 = require("./mobile");
Object.defineProperty(exports, "TMobilePlatform", { enumerable: true, get: function () { return mobile_1.TMobilePlatform; } });
Object.defineProperty(exports, "TMobileDeviceType", { enumerable: true, get: function () { return mobile_1.TMobileDeviceType; } });
Object.defineProperty(exports, "TEmergencyType", { enumerable: true, get: function () { return mobile_1.TEmergencyType; } });
Object.defineProperty(exports, "TEmergencySeverity", { enumerable: true, get: function () { return mobile_1.TEmergencySeverity; } });
Object.defineProperty(exports, "TAssignmentStatus", { enumerable: true, get: function () { return mobile_1.TAssignmentStatus; } });
Object.defineProperty(exports, "TAssignmentPriority", { enumerable: true, get: function () { return mobile_1.TAssignmentPriority; } });
Object.defineProperty(exports, "TTransportStatus", { enumerable: true, get: function () { return mobile_1.TTransportStatus; } });
var online_learning_1 = require("./online-learning");
Object.defineProperty(exports, "TContentType", { enumerable: true, get: function () { return online_learning_1.TContentType; } });
Object.defineProperty(exports, "TContentStatus", { enumerable: true, get: function () { return online_learning_1.TContentStatus; } });
Object.defineProperty(exports, "TDifficultyLevel", { enumerable: true, get: function () { return online_learning_1.TDifficultyLevel; } });
Object.defineProperty(exports, "TLearningPathType", { enumerable: true, get: function () { return online_learning_1.TLearningPathType; } });
Object.defineProperty(exports, "TAssessmentType", { enumerable: true, get: function () { return online_learning_1.TAssessmentType; } });
Object.defineProperty(exports, "TProgressStatus", { enumerable: true, get: function () { return online_learning_1.TProgressStatus; } });
Object.defineProperty(exports, "TEnrollmentStatus", { enumerable: true, get: function () { return online_learning_1.TEnrollmentStatus; } });
Object.defineProperty(exports, "TDiscussionType", { enumerable: true, get: function () { return online_learning_1.TDiscussionType; } });
Object.defineProperty(exports, "TCollaborationType", { enumerable: true, get: function () { return online_learning_1.TCollaborationType; } });
var parent_portal_1 = require("./parent-portal");
Object.defineProperty(exports, "TParentRelationship", { enumerable: true, get: function () { return parent_portal_1.TParentRelationship; } });
Object.defineProperty(exports, "TCommunicationType", { enumerable: true, get: function () { return parent_portal_1.TCommunicationType; } });
Object.defineProperty(exports, "TAppointmentStatus", { enumerable: true, get: function () { return parent_portal_1.TAppointmentStatus; } });
Object.defineProperty(exports, "TAppointmentType", { enumerable: true, get: function () { return parent_portal_1.TAppointmentType; } });
Object.defineProperty(exports, "TMessagePriority", { enumerable: true, get: function () { return parent_portal_1.TMessagePriority; } });
Object.defineProperty(exports, "TNotificationStatus", { enumerable: true, get: function () { return parent_portal_1.TNotificationStatus; } });
Object.defineProperty(exports, "TResourceType", { enumerable: true, get: function () { return parent_portal_1.TResourceType; } });
Object.defineProperty(exports, "TAcademicAlertType", { enumerable: true, get: function () { return parent_portal_1.TAcademicAlertType; } });
Object.defineProperty(exports, "TFeeStatus", { enumerable: true, get: function () { return parent_portal_1.TFeeStatus; } });
Object.defineProperty(exports, "TTransportationStatus", { enumerable: true, get: function () { return parent_portal_1.TTransportationStatus; } });
//# sourceMappingURL=index.js.map