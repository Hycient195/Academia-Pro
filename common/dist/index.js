"use strict";
// Academia Pro - Common Types Package
// Main entry point for shared types and interfaces
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
exports.TTransportationStatus = exports.TFeeStatus = exports.TAcademicAlertType = exports.TResourceType = exports.TNotificationStatus = exports.TMessagePriority = exports.TAppointmentType = exports.TAppointmentStatus = exports.TCommunicationType = exports.TParentRelationship = void 0;
// Export shared types
__exportStar(require("./types/shared/types"), exports);
// Export module-specific types
__exportStar(require("./types/shared/util.types"), exports);
__exportStar(require("./types/student/student.types"), exports);
__exportStar(require("./types/academic/academic.types"), exports);
var parent_portal_types_1 = require("./types/parent-portal/parent-portal.types");
Object.defineProperty(exports, "TParentRelationship", { enumerable: true, get: function () { return parent_portal_types_1.TParentRelationship; } });
Object.defineProperty(exports, "TCommunicationType", { enumerable: true, get: function () { return parent_portal_types_1.TCommunicationType; } });
Object.defineProperty(exports, "TAppointmentStatus", { enumerable: true, get: function () { return parent_portal_types_1.TAppointmentStatus; } });
Object.defineProperty(exports, "TAppointmentType", { enumerable: true, get: function () { return parent_portal_types_1.TAppointmentType; } });
Object.defineProperty(exports, "TMessagePriority", { enumerable: true, get: function () { return parent_portal_types_1.TMessagePriority; } });
Object.defineProperty(exports, "TNotificationStatus", { enumerable: true, get: function () { return parent_portal_types_1.TNotificationStatus; } });
Object.defineProperty(exports, "TResourceType", { enumerable: true, get: function () { return parent_portal_types_1.TResourceType; } });
Object.defineProperty(exports, "TAcademicAlertType", { enumerable: true, get: function () { return parent_portal_types_1.TAcademicAlertType; } });
Object.defineProperty(exports, "TFeeStatus", { enumerable: true, get: function () { return parent_portal_types_1.TFeeStatus; } });
Object.defineProperty(exports, "TTransportationStatus", { enumerable: true, get: function () { return parent_portal_types_1.TTransportationStatus; } });
// export * from './types/staff/staff.types'; // TODO: Resolve duplicate interface conflicts
// TODO: Add other module types as they are created
// export * from './modules/attendance-management/types';
// export * from './modules/examination-assessment/types';
// export * from './modules/fee-management/types';
__exportStar(require("./types/timetable/timetable.types"), exports);
//# sourceMappingURL=index.js.map