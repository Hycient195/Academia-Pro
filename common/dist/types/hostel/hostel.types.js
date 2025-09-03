"use strict";
// Academia Pro - Hostel Management Types
// Shared type definitions for hostel/dormitory management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAllocationStatus = exports.THostelMaintenanceStatus = exports.THostelMaintenanceType = exports.TFacilityType = exports.TBedStatus = exports.TRoomStatus = exports.TRoomType = exports.THostelStatus = exports.THostelType = void 0;
// Enums
var THostelType;
(function (THostelType) {
    THostelType["BOYS"] = "boys";
    THostelType["GIRLS"] = "girls";
    THostelType["MIXED"] = "mixed";
    THostelType["INTERNATIONAL"] = "international";
    THostelType["VIP"] = "vip";
    THostelType["STAFF"] = "staff";
    THostelType["GUEST"] = "guest";
})(THostelType || (exports.THostelType = THostelType = {}));
var THostelStatus;
(function (THostelStatus) {
    THostelStatus["ACTIVE"] = "active";
    THostelStatus["INACTIVE"] = "inactive";
    THostelStatus["UNDER_MAINTENANCE"] = "under_maintenance";
    THostelStatus["CLOSED"] = "closed";
    THostelStatus["DECOMMISSIONED"] = "decommissioned";
})(THostelStatus || (exports.THostelStatus = THostelStatus = {}));
var TRoomType;
(function (TRoomType) {
    TRoomType["SINGLE"] = "single";
    TRoomType["DOUBLE"] = "double";
    TRoomType["TRIPLE"] = "triple";
    TRoomType["QUADRUPLE"] = "quadruple";
    TRoomType["SUITE"] = "suite";
    TRoomType["DORMITORY"] = "dormitory";
    TRoomType["STUDIO"] = "studio";
})(TRoomType || (exports.TRoomType = TRoomType = {}));
var TRoomStatus;
(function (TRoomStatus) {
    TRoomStatus["AVAILABLE"] = "available";
    TRoomStatus["OCCUPIED"] = "occupied";
    TRoomStatus["RESERVED"] = "reserved";
    TRoomStatus["UNDER_MAINTENANCE"] = "under_maintenance";
    TRoomStatus["OUT_OF_ORDER"] = "out_of_order";
    TRoomStatus["QUARANTINE"] = "quarantine";
})(TRoomStatus || (exports.TRoomStatus = TRoomStatus = {}));
var TBedStatus;
(function (TBedStatus) {
    TBedStatus["AVAILABLE"] = "available";
    TBedStatus["OCCUPIED"] = "occupied";
    TBedStatus["RESERVED"] = "reserved";
    TBedStatus["OUT_OF_ORDER"] = "out_of_order";
    TBedStatus["QUARANTINE"] = "quarantine";
})(TBedStatus || (exports.TBedStatus = TBedStatus = {}));
var TFacilityType;
(function (TFacilityType) {
    TFacilityType["WIFI"] = "wifi";
    TFacilityType["LAUNDRY"] = "laundry";
    TFacilityType["GYM"] = "gym";
    TFacilityType["STUDY_ROOM"] = "study_room";
    TFacilityType["COMMON_ROOM"] = "common_room";
    TFacilityType["KITCHEN"] = "kitchen";
    TFacilityType["DINING_HALL"] = "dining_hall";
    TFacilityType["SECURITY"] = "security";
    TFacilityType["PARKING"] = "parking";
    TFacilityType["GARDEN"] = "garden";
    TFacilityType["SWIMMING_POOL"] = "swimming_pool";
    TFacilityType["LIBRARY"] = "library";
    TFacilityType["COMPUTER_LAB"] = "computer_lab";
    TFacilityType["MEDICAL_ROOM"] = "medical_room";
    TFacilityType["PRAYER_ROOM"] = "prayer_room";
    TFacilityType["GAMES_ROOM"] = "games_room";
    TFacilityType["TV_ROOM"] = "tv_room";
    TFacilityType["STORE"] = "store";
    TFacilityType["CAFETERIA"] = "cafeteria";
})(TFacilityType || (exports.TFacilityType = TFacilityType = {}));
var THostelMaintenanceType;
(function (THostelMaintenanceType) {
    THostelMaintenanceType["ELECTRICAL"] = "electrical";
    THostelMaintenanceType["PLUMBING"] = "plumbing";
    THostelMaintenanceType["CARPENTRY"] = "carpentry";
    THostelMaintenanceType["PAINTING"] = "painting";
    THostelMaintenanceType["CLEANING"] = "cleaning";
    THostelMaintenanceType["HVAC"] = "hvac";
    THostelMaintenanceType["SECURITY"] = "security";
    THostelMaintenanceType["LANDSCAPING"] = "landscaping";
    THostelMaintenanceType["PEST_CONTROL"] = "pest_control";
    THostelMaintenanceType["OTHER"] = "other";
})(THostelMaintenanceType || (exports.THostelMaintenanceType = THostelMaintenanceType = {}));
var THostelMaintenanceStatus;
(function (THostelMaintenanceStatus) {
    THostelMaintenanceStatus["REQUESTED"] = "requested";
    THostelMaintenanceStatus["APPROVED"] = "approved";
    THostelMaintenanceStatus["IN_PROGRESS"] = "in_progress";
    THostelMaintenanceStatus["COMPLETED"] = "completed";
    THostelMaintenanceStatus["CANCELLED"] = "cancelled";
    THostelMaintenanceStatus["DEFERRED"] = "deferred";
})(THostelMaintenanceStatus || (exports.THostelMaintenanceStatus = THostelMaintenanceStatus = {}));
var TAllocationStatus;
(function (TAllocationStatus) {
    TAllocationStatus["ACTIVE"] = "active";
    TAllocationStatus["CHECKED_OUT"] = "checked_out";
    TAllocationStatus["TRANSFERRED"] = "transferred";
    TAllocationStatus["TERMINATED"] = "terminated";
    TAllocationStatus["SUSPENDED"] = "suspended";
})(TAllocationStatus || (exports.TAllocationStatus = TAllocationStatus = {}));
//# sourceMappingURL=hostel.types.js.map