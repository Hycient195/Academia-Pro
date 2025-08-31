"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAttendanceMethod = exports.TAttendanceType = exports.TAttendanceStatus = void 0;
var TAttendanceStatus;
(function (TAttendanceStatus) {
    TAttendanceStatus["PRESENT"] = "present";
    TAttendanceStatus["ABSENT"] = "absent";
    TAttendanceStatus["LATE"] = "late";
    TAttendanceStatus["EXCUSED"] = "excused";
    TAttendanceStatus["HALF_DAY"] = "half_day";
    TAttendanceStatus["MEDICAL_LEAVE"] = "medical_leave";
    TAttendanceStatus["EMERGENCY"] = "emergency";
})(TAttendanceStatus || (exports.TAttendanceStatus = TAttendanceStatus = {}));
var TAttendanceType;
(function (TAttendanceType) {
    TAttendanceType["CLASS"] = "class";
    TAttendanceType["EXAM"] = "exam";
    TAttendanceType["EVENT"] = "event";
    TAttendanceType["ACTIVITY"] = "activity";
    TAttendanceType["ASSEMBLY"] = "assembly";
    TAttendanceType["FIELD_TRIP"] = "field_trip";
    TAttendanceType["SPORTS"] = "sports";
    TAttendanceType["CLUB"] = "club";
    TAttendanceType["OTHER"] = "other";
})(TAttendanceType || (exports.TAttendanceType = TAttendanceType = {}));
var TAttendanceMethod;
(function (TAttendanceMethod) {
    TAttendanceMethod["MANUAL"] = "manual";
    TAttendanceMethod["BIOMETRIC"] = "biometric";
    TAttendanceMethod["RFID"] = "rfid";
    TAttendanceMethod["MOBILE_APP"] = "mobile_app";
    TAttendanceMethod["WEB_PORTAL"] = "web_portal";
    TAttendanceMethod["AUTOMATED"] = "automated";
})(TAttendanceMethod || (exports.TAttendanceMethod = TAttendanceMethod = {}));
//# sourceMappingURL=attendance.types.js.map