"use strict";
// Academia Pro - Common Types Index
// Only export types from their primary owning modules to avoid conflicts
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
// Core shared types (base types used by other modules)
__exportStar(require("./types/shared"), exports);
// Domain-specific types - only export from their owning modules
__exportStar(require("./types/users"), exports); // User management types
__exportStar(require("./types/auth"), exports); // Authentication types
__exportStar(require("./types/schools"), exports); // School management types
// Student types - primary ownership in student module
__exportStar(require("./types/student"), exports);
// Staff types - primary ownership in staff module
__exportStar(require("./types/staff"), exports);
// Academic types - primary ownership in academic module
__exportStar(require("./types/academic"), exports);
// Attendance types - primary ownership in attendance module
__exportStar(require("./types/attendance"), exports);
// Communication types - primary ownership in communication module
__exportStar(require("./types/communication"), exports);
// Inventory types - primary ownership in inventory module
__exportStar(require("./types/inventory"), exports);
// Library types - primary ownership in library module
__exportStar(require("./types/library"), exports);
// Hostel types - primary ownership in hostel module
__exportStar(require("./types/hostel"), exports);
// Timetable types - primary ownership in timetable module
__exportStar(require("./types/timetable"), exports);
// Reports types - primary ownership in reports module
__exportStar(require("./types/reports"), exports);
// Fee types - primary ownership in fee module
__exportStar(require("./types/fee"), exports);
// Examination types - primary ownership in examination module
__exportStar(require("./types/examination"), exports);
// Mobile types - primary ownership in mobile module
__exportStar(require("./types/mobile"), exports);
// Online learning types - primary ownership in online-learning module
__exportStar(require("./types/online-learning"), exports);
// Parent portal types - primary ownership in parent-portal module
__exportStar(require("./types/parent-portal"), exports);
// Parent types - primary ownership in parent module
__exportStar(require("./types/parent"), exports);
// Super admin types - primary ownership in super-admin module
__exportStar(require("./types/super-admin"), exports);
// NOTE: school-admin types are NOT exported here to avoid conflicts
// Import school-admin types directly from './types/school-admin' when needed
