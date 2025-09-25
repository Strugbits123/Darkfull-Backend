import { Request, Response, NextFunction } from 'express';
import {
  UnauthorizedError,
  // TokenExpiredError,
  InvalidTokenError,
  ForbiddenError,
} from '@packages/error-handler/index';
import {
  verifyAccessToken,
  extractTokenFromHeader,
  isTokenNearExpiry,
} from '@packages/utils/helpers/jwt.helper';
import { validateSession } from '@packages/utils/helpers/session.helper';
import { handleDatabaseOperation } from '@packages/error-handler/helpers';
import prisma from '@packages/libs/prisma';
import { UserStatus } from '@prisma/client';

// Extend Express Request type to include user and session data
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      fullName: string | null;
      status: string;
    };
    sessionId?: string;
    tokenPayload?: {
      userId: string;
      email: string;
      sessionId: string;
      type: string;
    };
  }
}

/**
 * Middleware to authenticate requests using JWT access tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // Verify the access token
    const tokenPayload = verifyAccessToken(token);

    // Validate the session exists and is active
    const session = await validateSession(tokenPayload.sessionId);

    // Verify the token in the session matches
    if (session.accessToken !== token) {
      throw new InvalidTokenError('Token session mismatch');
    }

    // Get fresh user data from database
    const user = await handleDatabaseOperation(
      () =>
        prisma.user.findUnique({
          where: { id: tokenPayload.userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            status: true,
          },
        }),
      'fetching user for authentication'
    );

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError('Account is not active');
    }

    // Attach user and session data to request
    req.user = user;
    req.sessionId = session.id;
    req.tokenPayload = tokenPayload;

    // Add token expiry warning header if token is near expiry
    if (isTokenNearExpiry(new Date(session.expiresAt))) {
      res.setHeader('X-Token-Expires-Soon', 'true');
    }

    next();
  } catch (error) {
    next(error);
  }
};