"use strict";
// Academia Pro - Users Types
// Shared type definitions for users module
Object.defineProperty(exports, "__esModule", { value: true });
exports.EUserTheme = exports.EUserGender = exports.EUserRole = exports.EUserStatus = void 0;
// import { IUserPermissionRole, EUserStatus } from '../shared';
// Enums
var EUserStatus;
(function (EUserStatus) {
    EUserStatus["ACTIVE"] = "active";
    EUserStatus["INACTIVE"] = "inactive";
    EUserStatus["SUSPENDED"] = "suspended";
    EUserStatus["PENDING"] = "pending";
    EUserStatus["DELETED"] = "deleted";
})(EUserStatus || (exports.EUserStatus = EUserStatus = {}));
// Define enums locally since @academia-pro may not be available during development
var EUserRole;
(function (EUserRole) {
    EUserRole["SUPER_ADMIN"] = "super-admin";
    EUserRole["DELEGATED_SUPER_ADMIN"] = "delegated-super-admin";
    EUserRole["SCHOOL_ADMIN"] = "school-admin";
    EUserRole["DELEGATED_SCHOOL_ADMIN"] = "delegated-school-admin";
    EUserRole["STAFF"] = "staff";
    EUserRole["STUDENT"] = "student";
    EUserRole["PARENT"] = "parent";
})(EUserRole || (exports.EUserRole = EUserRole = {}));
var EUserGender;
(function (EUserGender) {
    EUserGender["MALE"] = "male";
    EUserGender["FEMALE"] = "female";
    EUserGender["OTHER"] = "other";
})(EUserGender || (exports.EUserGender = EUserGender = {}));
var EUserTheme;
(function (EUserTheme) {
    EUserTheme["LIGHT"] = "light";
    EUserTheme["DARK"] = "dark";
    EUserTheme["AUTO"] = "auto";
})(EUserTheme || (exports.EUserTheme = EUserTheme = {}));
// All types are exported above with their declarations
