import { z } from 'zod';

// Define enums to match Prisma schema
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MERCHANT = 'MERCHANT',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  USER = 'USER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOGIN_VERIFICATION = 'LOGIN_VERIFICATION',
  TWO_FACTOR_AUTH = 'TWO_FACTOR_AUTH'
}

// User Registration Schema
export const UserRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

// User Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// User Verification Schema
export const verifyUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  type: z.nativeEnum(OtpType).default(OtpType.EMAIL_VERIFICATION),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Verify Forgot Password Schema
export const verifyForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Resend OTP Schema
export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.nativeEnum(OtpType),
});

// Update User Schema
export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  avatar: z.string().url().optional(),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User Status Update Schema
export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().optional(),
});

// Role Assignment Schema
export const assignRoleSchema = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
  expiresAt: z.date().optional(),
});

// Permission Assignment Schema
export const assignPermissionSchema = z.object({
  userId: z.string().cuid(),
  permissionId: z.string().cuid(),
  expiresAt: z.date().optional(),
});

// Create Role Schema
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  permissionIds: z.array(z.string().cuid()).optional(),
});

// Create Permission Schema
export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
});

// Session Validation Schema
export const validateSessionSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  fields: z.array(z.string()).optional(),
}).merge(paginationSchema);

// Export types
export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyUserInput = z.infer<typeof verifyUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyForgotPasswordInput = z.infer<typeof verifyForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type ValidateSessionInput = z.infer<typeof validateSessionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;