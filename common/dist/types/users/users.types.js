"use strict";
// Academia Pro - Users Types
// Shared type definitions for users module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUserTheme = exports.TUserGender = exports.TUserStatus = void 0;
// Enums
var TUserStatus;
(function (TUserStatus) {
    TUserStatus["ACTIVE"] = "active";
    TUserStatus["INACTIVE"] = "inactive";
    TUserStatus["SUSPENDED"] = "suspended";
    TUserStatus["PENDING"] = "pending";
    TUserStatus["DELETED"] = "deleted";
})(TUserStatus || (exports.TUserStatus = TUserStatus = {}));
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
//# sourceMappingURL=users.types.js.map