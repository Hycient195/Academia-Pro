"use strict";
// Academia Pro - Shared Types
// Common types used across multiple modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchema = exports.paginationSchema = exports.addressSchema = void 0;
const zod_1 = require("zod");
// Common Validation Schemas
exports.addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Street is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    postalCode: zod_1.z.string().min(1, 'Postal code is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    coordinates: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
exports.searchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    dateRange: zod_1.z.object({
        start: zod_1.z.date(),
        end: zod_1.z.date(),
    }).optional(),
});
//# sourceMappingURL=types.js.map