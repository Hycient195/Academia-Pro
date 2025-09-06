"use strict";
// Academia Pro - Academic Management Types
// Shared type definitions for academic management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TLearningObjectiveType = exports.TAcademicYearStatus = exports.TSubjectType = exports.TGradeLevel = void 0;
const shared_1 = require("../shared");
Object.defineProperty(exports, "TGradeLevel", { enumerable: true, get: function () { return shared_1.TGradeLevel; } });
Object.defineProperty(exports, "TSubjectType", { enumerable: true, get: function () { return shared_1.TSubjectType; } });
// Enums
// TSubjectType moved to shared
// TGradeLevel moved to shared
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
