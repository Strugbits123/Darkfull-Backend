import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@packages/error-handler';

/**
 * Middleware to validate Store Admin or higher role for store access
 * Currently using Super Admin only - can be extended later for role-based access
 */
export const requireStoreAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      throw new ValidationError('User authentication required');
    }

    // For now, just pass through since we're using Super Admin only
    // TODO: Implement store-specific access control when user roles are expanded
    next();
  } catch (error) {
    next(error);
  }
};