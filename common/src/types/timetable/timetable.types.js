"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TPriorityLevel = exports.TTimetableStatus = exports.TRecurrenceType = exports.TPeriodType = exports.TDayOfWeek = void 0;
var TDayOfWeek;
(function (TDayOfWeek) {
    TDayOfWeek[TDayOfWeek["SUNDAY"] = 0] = "SUNDAY";
    TDayOfWeek[TDayOfWeek["MONDAY"] = 1] = "MONDAY";
    TDayOfWeek[TDayOfWeek["TUESDAY"] = 2] = "TUESDAY";
    TDayOfWeek[TDayOfWeek["WEDNESDAY"] = 3] = "WEDNESDAY";
    TDayOfWeek[TDayOfWeek["THURSDAY"] = 4] = "THURSDAY";
    TDayOfWeek[TDayOfWeek["FRIDAY"] = 5] = "FRIDAY";
    TDayOfWeek[TDayOfWeek["SATURDAY"] = 6] = "SATURDAY";
})(TDayOfWeek || (exports.TDayOfWeek = TDayOfWeek = {}));
var TPeriodType;
(function (TPeriodType) {
    TPeriodType["REGULAR_CLASS"] = "regular_class";
    TPeriodType["BREAK"] = "break";
    TPeriodType["LUNCH"] = "lunch";
    TPeriodType["ASSEMBLY"] = "assembly";
    TPeriodType["SPORTS"] = "sports";
    TPeriodType["CLUB"] = "club";
    TPeriodType["EXAM"] = "exam";
    TPeriodType["SPECIAL_EVENT"] = "special_event";
    TPeriodType["OFFICE_HOURS"] = "office_hours";
    TPeriodType["COUNSELING"] = "counseling";
    TPeriodType["OTHER"] = "other";
})(TPeriodType || (exports.TPeriodType = TPeriodType = {}));
var TRecurrenceType;
(function (TRecurrenceType) {
    TRecurrenceType["NONE"] = "none";
    TRecurrenceType["DAILY"] = "daily";
    TRecurrenceType["WEEKLY"] = "weekly";
    TRecurrenceType["MONTHLY"] = "monthly";
    TRecurrenceType["YEARLY"] = "yearly";
})(TRecurrenceType || (exports.TRecurrenceType = TRecurrenceType = {}));
var TTimetableStatus;
(function (TTimetableStatus) {
    TTimetableStatus["DRAFT"] = "draft";
    TTimetableStatus["PUBLISHED"] = "published";
    TTimetableStatus["ACTIVE"] = "active";
    TTimetableStatus["ARCHIVED"] = "archived";
    TTimetableStatus["CANCELLED"] = "cancelled";
})(TTimetableStatus || (exports.TTimetableStatus = TTimetableStatus = {}));
var TPriorityLevel;
(function (TPriorityLevel) {
    TPriorityLevel["LOW"] = "low";
    TPriorityLevel["NORMAL"] = "normal";
    TPriorityLevel["HIGH"] = "high";
    TPriorityLevel["URGENT"] = "urgent";
})(TPriorityLevel || (exports.TPriorityLevel = TPriorityLevel = {}));
//# sourceMappingURL=timetable.types.js.map