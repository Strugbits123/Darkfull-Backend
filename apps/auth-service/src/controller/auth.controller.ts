import { Response, Request } from 'express';
import {
  ValidationError,
  ConflictError,
  OTPExpiredError,
  OTPInvalidError,
  OTPAttemptsExceededError,
  UnauthorizedError,
  InvalidCredentialsError,
  NotFoundError,
} from '@packages/error-handler';
import {
  sendSuccessResponse,
  handleDatabaseOperation,
} from '@packages/error-handler/error-middleware';
import prisma from '@packages/libs/prisma';
import {
  createSession,
  invalidateSession,
  getSessionByRefreshToken,
  updateSessionTokens,
  invalidateAllUserSessions,
} from '@packages/utils/helpers/session.helper';
import {
  verifyRefreshToken,
  generateTokenPair,
} from '@packages/utils/helpers/jwt.helper';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus, OtpType } from '@prisma/client';
import logger from '@packages/utils/logger';
import axios from 'axios';
import { asyncHandler } from '@packages/utils/helpers/asyncHandler';
import { 
  loginSchema, 
  inviteStoreAdminSchema, 
  validateInvitationSchema, 
  acceptInvitationSchema 
} from '../utils/auth-validator';
import { sendEmail, generateInvitationEmailTemplate } from '@packages/libs/sendgrid';
import crypto from 'crypto';

// Invitation for Store Admin
export const inviteStoreAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = inviteStoreAdminSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid invitation data', validated.error.message);
    }

    const { email, fullName, storeId, storeName } = validated.data;
    const inviterUser = req.user as { id: string; fullName?: string; email: string };

    // Check if user already exists
    const existingUser = await handleDatabaseOperation(
      () => prisma.user.findUnique({ where: { email } }),
      'checking existing user'
    );

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if there's already a pending invitation
    const existingInvitation = await handleDatabaseOperation(
      () => prisma.invitation.findFirst({
        where: {
          email,
          status: 'PENDING',
          expiresAt: { gt: new Date() }
        }
      }),
      'checking existing invitation'
    );

    if (existingInvitation) {
      throw new ConflictError('Pending invitation already exists for this email');
    }

    // Verify store exists
    const store = await handleDatabaseOperation(
      () => prisma.store.findUnique({ where: { id: storeId } }),
      'verifying store existence'
    );

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Create invitation record
    const invitation = await handleDatabaseOperation(
      () => prisma.invitation.create({
        data: {
          email,
          token: invitationToken,
          role: UserRole.STORE_ADMIN,
          storeId,
          invitedBy: inviterUser.id,
          expiresAt,
          status: 'PENDING',
        }
      }),
      'creating invitation'
    );

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: `Invitation to Dark Horse 3PL Platform - Store Admin`,
        html: generateInvitationEmailTemplate({
          fullName: fullName,
          storeName,
          role: 'Store Admin',
          invitationLink,
          inviterName: inviterUser.fullName || inviterUser.email,
        }),
      });
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation creation, just log the error
    }

    const responseData = {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        storeName,
        expiresAt: invitation.expiresAt,
      },
    };

    sendSuccessResponse(res, responseData, 'Store Admin invitation sent successfully', 201);
  }
);

// Invitation validation
export const validateInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw new ValidationError('Invitation token is required');
    }

    // Find invitation by token
    const invitation = await handleDatabaseOperation(
      () => prisma.invitation.findFirst({
        where: {
          token,
          status: 'PENDING',
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          inviter: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      }),
      'validating invitation token'
    );

    if (!invitation) {
      throw new NotFoundError('Invalid or expired invitation token');
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Update invitation status to expired
      await handleDatabaseOperation(
        () => prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' }
        }),
        'updating invitation status'
      );
      
      throw new ValidationError('Invitation token has expired');
    }

    // Check if user already exists with this email
    const existingUser = await handleDatabaseOperation(
      () => prisma.user.findUnique({ where: { email: invitation.email } }),
      'checking existing user'
    );

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const responseData = {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        storeName: invitation.store.name,
        inviterName: invitation.inviter.fullName || invitation.inviter.email,
        expiresAt: invitation.expiresAt,
      }
    };

    sendSuccessResponse(res, responseData, 'Invitation token is valid', 200);
  }
);

// Accept invitation
export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const validated = acceptInvitationSchema.safeParse(req.body);
    if (!validated.success) {
      throw new ValidationError('Invalid invitation data', validated.error.message);
    }

    const { token, password, firstName, lastName, phone } = validated.data;

    // Find and validate invitation
    const invitation = await handleDatabaseOperation(
      () => prisma.invitation.findFirst({
        where: {
          token,
          status: 'PENDING',
        },
        include: {
          store: true,
          inviter: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      }),
      'finding invitation'
    );

    if (!invitation) {
      throw new NotFoundError('Invalid or expired invitation token');
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await handleDatabaseOperation(
        () => prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' }
        }),
        'updating invitation status'
      );
      
      throw new ValidationError('Invitation token has expired');
    }

    // Check if user already exists
    const existingUser = await handleDatabaseOperation(
      () => prisma.user.findUnique({ where: { email: invitation.email } }),
      'checking existing user'
    );

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const user = await handleDatabaseOperation(
      () => prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: invitation.role,
          storeId: invitation.storeId,
          warehouseId: invitation.warehouseId,
          invitedBy: invitation.invitedBy,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        }
      }),
      'creating user account'
    );

    // Update invitation status
    await handleDatabaseOperation(
      () => prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          userId: user.id,
        }
      }),
      'updating invitation status'
    );

    // Get request metadata for session creation
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const platform = (req.headers['x-platform'] as string) || 'web';
    const deviceInfo = (req.headers['user-agent'] as string) || '';
    const location = (req.headers['x-location'] as string) || '';

    // Create session for the new user
    const { session, tokens } = await createSession(
      user.id,
      user.email,
      userAgent,
      ipAddress,
      platform,
      deviceInfo,
      location
    );

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        store: user.store,
        createdAt: user.createdAt,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      },
    };

    sendSuccessResponse(res, responseData, 'Invitation accepted successfully', 201);
  }
);

// User login
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const validated = loginSchema.safeParse(req.body);
  if (!validated.success) {
    throw new ValidationError('Invalid login data', validated.error.message);
  }
  const { email, password } = validated.data;

  // Find user by email
  const user = await handleDatabaseOperation(
    () =>
      prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          status: true,
          emailVerified: true,
          fullName: true,
          role: true,
          storeId: true,
          warehouseId: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
      }),
    'fetching user by email'
  );

  if (!user) {
    throw new NotFoundError('User not found with this email');
  }

  // Check if user account is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedError(
      'Account is not active. Please contact support.'
    );
  }
  // Check if email is verified
  if (!user.emailVerified) {
    throw new UnauthorizedError(
      'Email is not verified. Please verify your email.'
    );
  }

  // Verify password
  if (!user.password) {
    throw new InvalidCredentialsError('Invalid email or password');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError('Invalid email or password');
  }

  // Get request metadata
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const platform = (req.headers['x-platform'] as string) || 'web';
  const deviceInfo = (req.headers['user-agent'] as string) || '';
  const location = (req.headers['x-location'] as string) || '';

  // Create session
  const { session, tokens } = await createSession(
    user.id,
    user.email,
    userAgent,
    ipAddress,
    platform,
    deviceInfo,
    location
  );

  // Prepare user data for response (exclude password)

  const userData = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
    role: user.role,
    storeId: user.storeId,
    warehouseId: user.warehouseId,
    store: user.store,
    createdAt: user.createdAt,
  };

  // Prepare response data
  const responseData = {
    user: userData,
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      deviceInfo: session?.deviceInfo,
      ipAddress: session?.ipAddress,
      userAgent: session?.userAgent,
      platform: session?.platform,
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    },
  };
  sendSuccessResponse(res, responseData, 'Login successful', 200);
});

// Salla OAuth Integration
export const sallaConnect = asyncHandler(
  async (req: Request, res: Response) => {
    const sallaClientId = '36e42043-f4a5-419a-9587-77f6634e4000';
    const sallaRedirectUri =
      'https://a779a4474087.ngrok-free.app/api/v1/auth/salla/callback';
    const state = 'some_random_state_string';
    const sallaAuthUrl = `https://accounts.salla.sa/oauth2/auth?client_id=${sallaClientId}&redirect_uri=${sallaRedirectUri}&response_type=code&scope=offline_access&state=${state}`;
    res.redirect(sallaAuthUrl);
  }
);

// Salla OAuth Callback
export const sallaCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query;
    console.log('Salla callback invoked', req.query);
    console.log('Authorization code:', code);
    const sallaClientId = '36e42043-f4a5-419a-9587-77f6634e4000';
    const sallaClientSecret = '6860d0b71a83fe7a4b1932983c992661';
    const sallaRedirectUri =
      'https://a779a4474087.ngrok-free.app/api/v1/auth/salla/callback';
    // const sallaRedirectUri = 'http://localhost:8080/api/v1/auth/salla/callback';
    const SALLA_TOKEN_URL = 'https://accounts.salla.sa/oauth2/token';

    if (!code) {
      return res.status(400).json({ error: 'Missing code' });
    }

    try {
      const response = await axios.post(
        SALLA_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          client_id: sallaClientId,
          client_secret: sallaClientSecret,
          redirect_uri: sallaRedirectUri,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('Token response:', response.data);
      const { access_token, refresh_token, expires_in } = response.data;
      return res.status(200).json({ access_token, refresh_token, expires_in });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);
