"use strict";
// Academia Pro - Users Types
// Shared type definitions for users module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUserTheme = exports.TUserGender = exports.EUserRole = exports.EUserStatus = void 0;
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
    EUserRole["TEACHER"] = "teacher";
    EUserRole["STUDENT"] = "student";
    EUserRole["PARENT"] = "parent";
})(EUserRole || (exports.EUserRole = EUserRole = {}));
var TUserGender;
(function (TUserGender) {
    TUserGender["MALE"] = "male";
    TUserGender["FEMALE"] = "female";
    TUserGender["OTHER"] = "other";
})(TUserGender || (exports.TUserGender = TUserGender = {}));
var TUserTheme;
(function (TUserTheme) {
    TUserTheme["LIGHT"] = "light";
    TUserTheme["DARK"] = "dark";
    TUserTheme["AUTO"] = "auto";
})(TUserTheme || (exports.TUserTheme = TUserTheme = {}));
// All types are exported above with their declarations
