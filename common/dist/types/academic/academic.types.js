"use strict";
// Academia Pro - Academic Management Types
// Shared type definitions for academic management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TLearningObjectiveType = exports.TAcademicYearStatus = exports.TGradeLevel = exports.TSubjectType = void 0;
// Enums
var TSubjectType;
(function (TSubjectType) {
    TSubjectType["CORE"] = "core";
    TSubjectType["ELECTIVE"] = "elective";
    TSubjectType["PRACTICAL"] = "practical";
    TSubjectType["LANGUAGE"] = "language";
    TSubjectType["ARTS"] = "arts";
    TSubjectType["SPORTS"] = "sports";
})(TSubjectType || (exports.TSubjectType = TSubjectType = {}));
var TGradeLevel;
(function (TGradeLevel) {
    TGradeLevel["NURSERY"] = "nursery";
    TGradeLevel["LKG"] = "lkg";
    TGradeLevel["UKG"] = "ukg";
    TGradeLevel["GRADE_1"] = "grade_1";
    TGradeLevel["GRADE_2"] = "grade_2";
    TGradeLevel["GRADE_3"] = "grade_3";
    TGradeLevel["GRADE_4"] = "grade_4";
    TGradeLevel["GRADE_5"] = "grade_5";
    TGradeLevel["GRADE_6"] = "grade_6";
    TGradeLevel["GRADE_7"] = "grade_7";
    TGradeLevel["GRADE_8"] = "grade_8";
    TGradeLevel["GRADE_9"] = "grade_9";
    TGradeLevel["GRADE_10"] = "grade_10";
    TGradeLevel["GRADE_11"] = "grade_11";
    TGradeLevel["GRADE_12"] = "grade_12";
})(TGradeLevel || (exports.TGradeLevel = TGradeLevel = {}));
var TAcademicYearStatus;
(function (TAcademicYearStatus) {
    TAcademicYearStatus["PLANNING"] = "planning";
    TAcademicYearStatus["ACTIVE"] = "active";
    TAcademicYearStatus["COMPLETED"] = "completed";
    TAcademicYearStatus["ARCHIVED"] = "archived";
})(TAcademicYearStatus || (exports.TAcademicYearStatus = TAcademicYearStatus = {}));
var TLearningObjectiveType;
(function (TLearningObjectiveType) {
    TLearningObjectiveType["KNOWLEDGE"] = "knowledge";
    TLearningObjectiveType["SKILLS"] = "skills";
    TLearningObjectiveType["ATTITUDES"] = "attitudes";
    TLearningObjectiveType["VALUES"] = "values";
})(TLearningObjectiveType || (exports.TLearningObjectiveType = TLearningObjectiveType = {}));
//# sourceMappingURL=academic.types.js.map