import { Response, Request } from 'express';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from '@packages/error-handler';
import {
  sendSuccessResponse,
  handleDatabaseOperation,
} from '@packages/error-handler/error-middleware';
import prisma from '@packages/libs/prisma';
import { asyncHandler } from '@packages/utils/helpers/asyncHandler';
import { 
  createStoreSchema, 
  updateStoreSchema, 
  storeParamsSchema,
  storePaginationSchema
} from '../utils/store-validator';

// Create Store
export const createStore = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = createStoreSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid store data', validated.error.message);
    }

    const { name, slug } = validated.data;
    const creatorUser = req.user as { id: string; fullName?: string; email: string };

    // Check if store with same slug already exists
    const existingStore = await handleDatabaseOperation(
      () => prisma.store.findUnique({ where: { slug } }),
      'checking existing store slug'
    );

    if (existingStore) {
      throw new ConflictError('Store with this slug already exists');
    }

    // Create store record
    const store = await handleDatabaseOperation(
      () => prisma.store.create({
        data: {
          name,
          slug,
          createdBy: creatorUser.id,
          isActive: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      }),
      'creating store'
    );

    const responseData = {
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        isActive: store.isActive,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        creator: store.creator,
      },
    };

    sendSuccessResponse(res, responseData, 'Store created successfully', 201);
  }
);

// Get Store Details
export const getStoreDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = storeParamsSchema.safeParse(req.params);
    if (!validated.success) {
      throw new ValidationError('Invalid store ID', validated.error.message);
    }

    const { id } = validated.data;

    // Find store by ID
    const store = await handleDatabaseOperation(
      () => prisma.store.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          },
          users: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              status: true,
            }
          },
          warehouses: {
            select: {
              id: true,
              name: true,
              code: true,
              isActive: true,
            }
          },
          _count: {
            select: {
              users: true,
              warehouses: true,
              invitations: true,
            }
          }
        }
      }),
      'fetching store details'
    );

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const responseData = {
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        isActive: store.isActive,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        sallaConnectedAt: store.sallaConnectedAt,
        creator: store.creator,
        users: store.users,
        warehouses: store.warehouses,
        stats: {
          totalUsers: store._count.users,
          totalWarehouses: store._count.warehouses,
          pendingInvitations: store._count.invitations,
        }
      },
    };

    sendSuccessResponse(res, responseData, 'Store details retrieved successfully');
  }
);

// Get Paginated Stores
export const getPaginatedStores = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = storePaginationSchema.safeParse(req.query);
    if (!validated.success) {
      throw new ValidationError('Invalid pagination parameters', validated.error.message);
    }

    const { page, limit, search, sortBy, sortOrder } = validated.data;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    // Get total count for pagination
    const totalCount = await handleDatabaseOperation(
      () => prisma.store.count({ where: whereClause }),
      'counting stores'
    );

    // Get stores with pagination
    const stores = await handleDatabaseOperation(
      () => prisma.store.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          },
          _count: {
            select: {
              users: true,
              warehouses: true,
              invitations: true,
            }
          }
        }
      }),
      'fetching paginated stores'
    );

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const responseData = {
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        isActive: store.isActive,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        sallaConnectedAt: store.sallaConnectedAt,
        creator: store.creator,
        stats: {
          totalUsers: store._count.users,
          totalWarehouses: store._count.warehouses,
          pendingInvitations: store._count.invitations,
        }
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    };

    sendSuccessResponse(res, responseData, 'Stores retrieved successfully');
  }
);

// Update Store
export const updateStore = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsValidated = storeParamsSchema.safeParse(req.params);
    if (!paramsValidated.success) {
      throw new ValidationError('Invalid store ID', paramsValidated.error.message);
    }

    const bodyValidated = updateStoreSchema.safeParse(req.body);
    if (!bodyValidated.success) {
      throw new ValidationError('Invalid update data', bodyValidated.error.message);
    }

    const { id } = paramsValidated.data;
    const updateData = bodyValidated.data;

    // Check if store exists
    const existingStore = await handleDatabaseOperation(
      () => prisma.store.findUnique({ where: { id } }),
      'checking store existence'
    );

    if (!existingStore) {
      throw new NotFoundError('Store not found');
    }

    // If updating slug, check for conflicts
    if (updateData.slug && updateData.slug !== existingStore.slug) {
      const slugConflict = await handleDatabaseOperation(
        () => prisma.store.findUnique({ where: { slug: updateData.slug } }),
        'checking slug conflict'
      );

      if (slugConflict) {
        throw new ConflictError('Store with this slug already exists');
      }
    }

    // Update store
    const updatedStore = await handleDatabaseOperation(
      () => prisma.store.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      }),
      'updating store'
    );

    const responseData = {
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        isActive: updatedStore.isActive,
        createdAt: updatedStore.createdAt,
        updatedAt: updatedStore.updatedAt,
        creator: updatedStore.creator,
      },
    };

    sendSuccessResponse(res, responseData, 'Store updated successfully');
  }
);

// Delete Store
export const deleteStore = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = storeParamsSchema.safeParse(req.params);
    if (!validated.success) {
      throw new ValidationError('Invalid store ID', validated.error.message);
    }

    const { id } = validated.data;

    // Check if store exists
    const existingStore = await handleDatabaseOperation(
      () => prisma.store.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              warehouses: true,
            }
          }
        }
      }),
      'checking store existence'
    );

    if (!existingStore) {
      throw new NotFoundError('Store not found');
    }

    // Check if store has users or warehouses
    if (existingStore._count.users > 0 || existingStore._count.warehouses > 0) {
      throw new ValidationError(
        'Cannot delete store with existing users or warehouses. Please remove all associated data first.'
      );
    }

    // Delete store (cascade will handle related data like invitations)
    await handleDatabaseOperation(
      () => prisma.store.delete({ where: { id } }),
      'deleting store'
    );

    const responseData = {
      deletedStore: {
        id: existingStore.id,
        name: existingStore.name,
        slug: existingStore.slug,
      },
    };

    sendSuccessResponse(res, responseData, 'Store deleted successfully');
  }
);
