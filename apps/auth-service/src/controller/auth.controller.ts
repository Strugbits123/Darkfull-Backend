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
import logger from 'src/utils/logger';
import axios from 'axios';
import { asyncHandler } from '@packages/utils/helpers/asyncHandler';
import { loginSchema } from '../utils/auth-validator';

// Invitation for Store Admin
export const inviteStoreAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      return res.status(200).json({ message: 'User invited successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Invitation validation
export const validateInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Simulate token validation
    const isValid = token === 'valid_token';

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    return res.status(200).json({ message: 'Token is valid' });
  }
);

// Accept invitation
export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: 'Token and password are required' });
    }
    // Simulate token validation
    const isValid = token === 'valid_token';
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    return res
      .status(200)
      .json({ message: 'Invitation accepted successfully' });
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
          createdAt: true,
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
