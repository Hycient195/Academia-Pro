import { z } from 'zod';
export const addressSchema = z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
});
export const paginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
export const searchSchema = z.object({
    query: z.string().optional(),
    filters: z.record(z.any()).optional(),
    dateRange: z.object({
        start: z.date(),
        end: z.date(),
    }).optional(),
});
//# sourceMappingURL=types.js.map