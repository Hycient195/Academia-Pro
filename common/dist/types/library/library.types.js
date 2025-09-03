"use strict";
// Academia Pro - Library Management Types
// Shared type definitions for library and book management module
Object.defineProperty(exports, "__esModule", { value: true });
exports.TReservationStatus = exports.TCheckoutStatus = exports.TAcquisitionMethod = exports.TLanguage = exports.TBookFormat = exports.TBookCategory = exports.TBookCondition = exports.TBookStatus = void 0;
// Enums
var TBookStatus;
(function (TBookStatus) {
    TBookStatus["AVAILABLE"] = "available";
    TBookStatus["CHECKED_OUT"] = "checked_out";
    TBookStatus["RESERVED"] = "reserved";
    TBookStatus["LOST"] = "lost";
    TBookStatus["DAMAGED"] = "damaged";
    TBookStatus["UNDER_MAINTENANCE"] = "under_maintenance";
    TBookStatus["DISCARDED"] = "discarded";
    TBookStatus["REFERENCE_ONLY"] = "reference_only";
})(TBookStatus || (exports.TBookStatus = TBookStatus = {}));
var TBookCondition;
(function (TBookCondition) {
    TBookCondition["EXCELLENT"] = "excellent";
    TBookCondition["GOOD"] = "good";
    TBookCondition["FAIR"] = "fair";
    TBookCondition["POOR"] = "poor";
    TBookCondition["DAMAGED"] = "damaged";
})(TBookCondition || (exports.TBookCondition = TBookCondition = {}));
var TBookCategory;
(function (TBookCategory) {
    TBookCategory["FICTION"] = "fiction";
    TBookCategory["NON_FICTION"] = "non_fiction";
    TBookCategory["ACADEMIC"] = "academic";
    TBookCategory["REFERENCE"] = "reference";
    TBookCategory["BIOGRAPHY"] = "biography";
    TBookCategory["HISTORY"] = "history";
    TBookCategory["SCIENCE"] = "science";
    TBookCategory["MATHEMATICS"] = "mathematics";
    TBookCategory["LITERATURE"] = "literature";
    TBookCategory["LANGUAGE"] = "language";
    TBookCategory["ART"] = "art";
    TBookCategory["MUSIC"] = "music";
    TBookCategory["SPORTS"] = "sports";
    TBookCategory["HEALTH"] = "health";
    TBookCategory["COOKING"] = "cooking";
    TBookCategory["TRAVEL"] = "travel";
    TBookCategory["RELIGION"] = "religion";
    TBookCategory["PHILOSOPHY"] = "philosophy";
    TBookCategory["PSYCHOLOGY"] = "psychology";
    TBookCategory["SOCIOLOGY"] = "sociology";
    TBookCategory["ECONOMICS"] = "economics";
    TBookCategory["POLITICAL_SCIENCE"] = "political_science";
    TBookCategory["LAW"] = "law";
    TBookCategory["MEDICINE"] = "medicine";
    TBookCategory["ENGINEERING"] = "engineering";
    TBookCategory["COMPUTER_SCIENCE"] = "computer_science";
    TBookCategory["EDUCATION"] = "education";
    TBookCategory["CHILDREN"] = "children";
    TBookCategory["TEEN"] = "teen";
    TBookCategory["MAGAZINES"] = "magazines";
    TBookCategory["NEWSPAPERS"] = "newspapers";
    TBookCategory["OTHER"] = "other";
})(TBookCategory || (exports.TBookCategory = TBookCategory = {}));
var TBookFormat;
(function (TBookFormat) {
    TBookFormat["HARDCOVER"] = "hardcover";
    TBookFormat["PAPERBACK"] = "paperback";
    TBookFormat["EBOOK"] = "ebook";
    TBookFormat["AUDIOBOOK"] = "audiobook";
    TBookFormat["MAGAZINE"] = "magazine";
    TBookFormat["NEWSPAPER"] = "newspaper";
    TBookFormat["JOURNAL"] = "journal";
    TBookFormat["THESIS"] = "thesis";
    TBookFormat["DISSERTATION"] = "dissertation";
    TBookFormat["REPORT"] = "report";
    TBookFormat["MANUSCRIPT"] = "manuscript";
    TBookFormat["MAP"] = "map";
    TBookFormat["ATLAS"] = "atlas";
    TBookFormat["CD"] = "cd";
    TBookFormat["DVD"] = "dvd";
    TBookFormat["OTHER"] = "other";
})(TBookFormat || (exports.TBookFormat = TBookFormat = {}));
var TLanguage;
(function (TLanguage) {
    TLanguage["ENGLISH"] = "english";
    TLanguage["SPANISH"] = "spanish";
    TLanguage["FRENCH"] = "french";
    TLanguage["GERMAN"] = "german";
    TLanguage["ITALIAN"] = "italian";
    TLanguage["PORTUGUESE"] = "portuguese";
    TLanguage["RUSSIAN"] = "russian";
    TLanguage["CHINESE"] = "chinese";
    TLanguage["JAPANESE"] = "japanese";
    TLanguage["KOREAN"] = "korean";
    TLanguage["ARABIC"] = "arabic";
    TLanguage["HINDI"] = "hindi";
    TLanguage["BENGALI"] = "bengali";
    TLanguage["URDU"] = "urdu";
    TLanguage["TURKISH"] = "turkish";
    TLanguage["PERSIAN"] = "persian";
    TLanguage["SWAHILI"] = "swahili";
    TLanguage["HAUSA"] = "hausa";
    TLanguage["YORUBA"] = "yoruba";
    TLanguage["IGBO"] = "igbo";
    TLanguage["OTHER"] = "other";
})(TLanguage || (exports.TLanguage = TLanguage = {}));
var TAcquisitionMethod;
(function (TAcquisitionMethod) {
    TAcquisitionMethod["PURCHASE"] = "purchase";
    TAcquisitionMethod["DONATION"] = "donation";
    TAcquisitionMethod["EXCHANGE"] = "exchange";
    TAcquisitionMethod["GIFT"] = "gift";
    TAcquisitionMethod["INHERITANCE"] = "inheritance";
    TAcquisitionMethod["LEGAL_DEPOSIT"] = "legal_deposit";
    TAcquisitionMethod["OTHER"] = "other";
})(TAcquisitionMethod || (exports.TAcquisitionMethod = TAcquisitionMethod = {}));
var TCheckoutStatus;
(function (TCheckoutStatus) {
    TCheckoutStatus["ACTIVE"] = "active";
    TCheckoutStatus["RETURNED"] = "returned";
    TCheckoutStatus["OVERDUE"] = "overdue";
    TCheckoutStatus["LOST"] = "lost";
    TCheckoutStatus["DAMAGED"] = "damaged";
})(TCheckoutStatus || (exports.TCheckoutStatus = TCheckoutStatus = {}));
var TReservationStatus;
(function (TReservationStatus) {
    TReservationStatus["ACTIVE"] = "active";
    TReservationStatus["CANCELLED"] = "cancelled";
    TReservationStatus["EXPIRED"] = "expired";
    TReservationStatus["FULFILLED"] = "fulfilled";
})(TReservationStatus || (exports.TReservationStatus = TReservationStatus = {}));
//# sourceMappingURL=library.types.js.map