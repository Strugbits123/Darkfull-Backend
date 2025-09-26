import { z } from 'zod';

// Create Store Schema
export const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  slug: z.string().min(1, 'Store slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

// Update Store Schema
export const updateStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').optional(),
  slug: z.string().min(1, 'Store slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
});

// Store ID Parameter Schema
export const storeParamsSchema = z.object({
  id: z.string().min(1, 'Store ID is required'),
});

// Pagination Schema for Stores
export const storePaginationSchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().optional().default('10').transform(val => parseInt(val, 10)),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Export types
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreParamsInput = z.infer<typeof storeParamsSchema>;
export type StorePaginationInput = z.infer<typeof storePaginationSchema>;