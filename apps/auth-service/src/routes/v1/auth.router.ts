import express, { Router } from 'express';
import {
  userRegister,
  verifyUserRegistration,
  userLogin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  refreshToken,
  userLogout,
  resendVerificationOtp,
} from '../../controller/auth.controller';
import { authenticateToken } from '../../../packages/utils/middlewares/auth.middleware';

const authRouter: Router = express.Router();

/**
 * User registration request
 * @typedef {object} UserRegisterRequest
 * @property {string} fullName.required - User full name
 * @property {string} username.required - Username
 * @property {string} email.required - User email
 * @property {string} password.required - User password
 * @property {string} role.required - User role
 */

/**
 * User verification request
 * @typedef {object} UserVerifyRequest
 * @property {string} email.required - User email
 * @property {string} otp.required - OTP code
 */

/**
 * @typedef {object} UserLoginRequest
 * @property {string} email.required - User email
 * @property {string} password.required - User password
 */

/**
 * Forgot password request
 * @typedef {object} ForgotPasswordRequest
 * @property {string} email.required - User email
 */

/**
 * Verify forgot password OTP request
 * @typedef {object} VerifyForgotPasswordOtpRequest
 * @property {string} email.required - User email
 * @property {string} otp.required - OTP code
 */

/**
 * Reset password request
 * @typedef {object} ResetPasswordRequest
 * @property {string} email.required - User email
 * @property {string} newPassword.required - New password
 */

/**
 * Refresh token request
 * @typedef {object} RefreshTokenRequest
 * @property {string} refreshToken.required - Refresh token
 */

/**
 * Logout request
 * @typedef {object} LogoutRequest
 * @property {string} sessionId.required - Session ID
 */

/**
 * Resend OTP request
 * @typedef {object} ResendOtpRequest
 * @property {string} email.required - User email
 * @property {string} type - OTP type: 'VERIFICATION' or 'PASSWORD_RESET' (default: 'VERIFICATION')
 */

/**
 * POST /auth/user-register
 * @tags Auth
 * @summary Register new user
 * @param {UserRegisterRequest} request.body.required - User data
 * @return {object} 201 - Success
 */
authRouter.post('/user-register', userRegister);

/**
 * POST /auth/user-verify
 * @tags Auth
 * @summary Verify user registration
 * @param {UserVerifyRequest} request.body.required - Verification data
 * @return {object} 200 - Success
 */
authRouter.post('/user-verify', verifyUserRegistration);

/**
 * POST /auth/user-login
 * @tags Auth
 * @summary User login
 * @param {UserLoginRequest} request.body.required - Login data
 * @return {object} 200 - Success
 */
authRouter.post('/user-login', userLogin);

/**
 * POST /auth/forgot-password
 * @tags Auth
 * @summary Request password reset (send OTP)
 * @param {ForgotPasswordRequest} request.body.required - Forgot password data
 * @return {object} 200 - Success
 */
authRouter.post('/forgot-password', forgotPassword);

/**
 * POST /auth/verify-forgot-password-otp
 * @tags Auth
 * @summary Verify OTP for password reset
 * @param {VerifyForgotPasswordOtpRequest} request.body.required - OTP verification data
 * @return {object} 200 - Success
 */
authRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);

/**
 * POST /auth/reset-password
 * @tags Auth
 * @summary Reset password
 * @param {ResetPasswordRequest} request.body.required - Reset password data
 * @return {object} 200 - Success
 */
authRouter.post('/reset-password', resetPassword);

/**
 * POST /auth/refresh-token
 * @tags Auth
 * @summary Refresh JWT access token
 * @param {RefreshTokenRequest} request.body.required - Refresh token data
 * @return {object} 200 - Success
 */
authRouter.post('/refresh-token', refreshToken);

/**
 * POST /auth/logout
 * @tags Auth
 * @summary User logout
 * @param {LogoutRequest} request.body.required - Logout data
 * @security BearerAuth
 * @return {object} 200 - Success
 */
authRouter.post('/logout', authenticateToken, userLogout);

/**
 * POST /auth/resend-otp
 * @tags Auth
 * @summary Resend OTP
 * @param {ResendOtpRequest} request.body.required - Resend OTP data
 * @return {object} 200 - Success
 */
authRouter.post('/resend-otp', resendVerificationOtp);



export default authRouter;
