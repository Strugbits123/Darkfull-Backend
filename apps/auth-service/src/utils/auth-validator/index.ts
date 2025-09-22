import z from 'zod';
import { UserRole } from '@prisma/client';
import { OtpType } from '@prisma/client';

// Verify user registration

export const UserRegisterSchema = z.object({
  fullName: z.string().min(2).max(100),
  username: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /[a-zA-Z0-9!@#$%^&*]{8,128}/,
      'Password must contain at least one letter, one number, and one special character'
    ),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
});

// Verify user registration

export const verifyUserSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{4}$/, 'OTP must be a 4-digit number'),
});

// User login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

// Forgot password

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Verify forgot password OTP

export const verifyForgotPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{4}$/, 'OTP must be a 4-digit number'),
});

// Reset password
export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /[a-zA-Z0-9!@#$%^&*]{8,128}/,
      'Password must contain at least one letter, one number, and one special character'
    ),
});

// Resend Otp

export const resendOtpSchema = z.object({
  email: z.string().email(),
  type: z.nativeEnum(OtpType).optional().default(OtpType.EMAIL_VERIFICATION),
});

// SSO Schemas

export const ssoRegisterSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  role: z.nativeEnum(UserRole),
});

export const ssoLoginSchema = z.object({
  email: z.string().email(),
  providerId: z.string().min(1, 'Provider ID is required'),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

// Export types
export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type VerifyUserInput = z.infer<typeof verifyUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyForgotPasswordInput = z.infer<
  typeof verifyForgotPasswordSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SsoRegisterInput = z.infer<typeof ssoRegisterSchema>;
export type SsoLoginInput = z.infer<typeof ssoLoginSchema>;
