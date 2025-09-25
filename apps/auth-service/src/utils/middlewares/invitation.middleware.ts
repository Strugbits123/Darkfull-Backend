import { Request, Response, NextFunction } from 'express';
import { ValidationError, ForbiddenError } from '@packages/error-handler';
import { UserRole } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  role?: UserRole;
  storeId?: string;
  warehouseId?: string;
}

/**
 * Role hierarchy mapping - who can invite whom
 */
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  SUPER_ADMIN: [UserRole.STORE_ADMIN],
  STORE_ADMIN: [UserRole.DIRECTOR],
  DIRECTOR: [UserRole.MANAGER],
  MANAGER: [UserRole.RECEIVER, UserRole.PICKER, UserRole.PACKER, UserRole.SHIPPER],
  RECEIVER: [],
  PICKER: [],
  PACKER: [],
  SHIPPER: [],
  USER: [],
};

/**
 * Middleware to validate if user can invite others with specific role
 */
export const validateInvitationPermission = (allowedTargetRoles?: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthenticatedUser;
      const { role: targetRole } = req.body;

      if (!user) {
        throw new ValidationError('User authentication required');
      }

      if (!user.role) {
        throw new ValidationError('User role is required');
      }

      if (!targetRole) {
        throw new ValidationError('Target user role is required');
      }

      // Check if the user's role can invite the target role
      const canInviteRoles = ROLE_HIERARCHY[user.role] || [];
      
      if (!canInviteRoles.includes(targetRole as UserRole)) {
        throw new ForbiddenError(
          `${user.role} cannot invite users with role ${targetRole}`
        );
      }

      // If specific allowed roles are provided, check against them
      if (allowedTargetRoles && !allowedTargetRoles.includes(targetRole as UserRole)) {
        throw new ForbiddenError(
          `This endpoint only allows inviting: ${allowedTargetRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * Middleware to validate Super Admin role
 */
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new ValidationError('User authentication required');
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError('Super Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate Store Admin role
 */
export const requireStoreAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new ValidationError('User authentication required');
    }

    if (user.role !== UserRole.STORE_ADMIN) {
      throw new ForbiddenError('Store Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate store context for Store Admin operations
 */
export const validateStoreContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthenticatedUser;
    const { storeId } = req.body;

    if (!user) {
      throw new ValidationError('User authentication required');
    }

    // Super Admin can work with any store
    if (user.role === UserRole.SUPER_ADMIN) {
      if (!storeId) {
        throw new ValidationError('Store ID is required');
      }
      next();
      return;
    }

    // Store Admin must work within their own store
    if (user.role === UserRole.STORE_ADMIN) {
      if (!user.storeId) {
        throw new ValidationError('User is not associated with any store');
      }
      
      if (storeId && storeId !== user.storeId) {
        throw new ForbiddenError('Cannot perform operations on other stores');
      }
      
      // Set storeId from user context if not provided
      if (!storeId) {
        req.body.storeId = user.storeId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};