import express, { Router } from 'express';
import {
  inviteStoreAdmin,
  validateInvitation,
  acceptInvitation,
  userLogin,
  sallaConnect,
  sallaCallback,
} from '../../controller/auth.controller';
import { authenticateToken } from '../../utils/middlewares/auth.middleware';
import { 
  requireSuperAdmin,
  requireStoreAdmin,
  validateStoreContext,
} from '../../utils/middlewares/invitation.middleware';

const authRouter: Router = express.Router();

// Public routes
authRouter.get('/invitations/validate/:token', validateInvitation);
authRouter.post('/invitations/accept', acceptInvitation);
authRouter.post('/login', userLogin);

// Salla OAuth callback (public - no auth required)
authRouter.get('/salla/callback', sallaCallback);

// Protected routes - Super Admin only
authRouter.post('/invitations/store-admin', 
  authenticateToken,
  requireSuperAdmin,
  validateStoreContext,
  inviteStoreAdmin
);

// Protected routes - Store Admin only (Salla integration)
authRouter.post('/salla/connect', 
  authenticateToken, 
  requireStoreAdmin, 
  sallaConnect
);

export default authRouter;
