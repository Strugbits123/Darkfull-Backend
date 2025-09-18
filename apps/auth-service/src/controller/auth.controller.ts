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
} from '../../packages/error-handaler/index';
import {
  asyncHandler,
  sendSuccessResponse,
  validateRequiredFields,
  handleDatabaseOperation,
} from '../../packages/error-handaler/error-middleware';
import {
  createSession,
  invalidateSession,
  getSessionByRefreshToken,
  updateSessionTokens,
  invalidateAllUserSessions,
} from '../../packages/utils/helpers/session.helper';
import {
  verifyRefreshToken,
  generateTokenPair,
} from '../../packages/utils/helpers/jwt.helper';
import bcrypt from 'bcryptjs';
import {
  UserRegisterSchema,
  verifyUserSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
} from '@packages/libs/database/validators/auth.validators';
import { UserRole, UserStatus, OtpType } from '@prisma/client';
import logger from '../../src/utils/logger';







//register a new user
export const userRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = UserRegisterSchema.safeParse(req.body);
    if (!validatedData.success) {
      throw new ValidationError(
        'Invalid user registration data',
        validatedData.error.errors.map(err => err.message)
      );
    }
    const { fullName, username, email, password, role } = validatedData.data;

    // Validate role is a valid UserRole enum value
    if (!Object.values(UserRole).includes(role as unknown as UserRole)) {
      throw new ValidationError('Invalid user role');
    }

    // Check if user already exists
    const existingUser = await handleDatabaseOperation(
      () =>
        prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, username: true },
        }),
      'checking existing user'
    );
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    //Check UserName availability
    const existingUserName = await handleDatabaseOperation(
      () =>
        prisma.user.findUnique({
          where: { username },
          select: { id: true, email: true, username: true },
        }),
      'checking existing username'
    );
    if (existingUserName) {
      throw new ConflictError(
        'Username is already taken. Please choose a different one.'
      );
    }

    // Check OTP restrictions
    const restrictionCheck = await checkOtpRestriction(email);
    if (!restrictionCheck.allowed) {
      throw new OTPAttemptsExceededError(restrictionCheck.message!);
    }

    // Send OTP email
    // const otpResult = await sendOtpEmail(
    //   email,
    //   'verifyEmailOtpTemplate',
    //   OtpType.EMAIL_VERIFICATION
    // );

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await handleDatabaseOperation(
      () =>
        prisma.user.create({
          data: {
            email,
            username,
            fullName: fullName,
            password: hashedPassword,
            role: role as unknown as UserRole,
          },
        }),
      'creating user'
    );
    if (!newUser) {
      throw new ConflictError('Failed to create user');
    }
    sendSuccessResponse(res, null, otpResult.message, 200);
  }
);