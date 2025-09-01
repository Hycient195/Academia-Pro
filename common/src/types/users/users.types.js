"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUserTheme = exports.TUserGender = exports.TUserStatus = void 0;
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
//# sourceMappingURL=users.types.js.map