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

const authRouter: Router = express.Router();


authRouter.post('/invitations/store-admin', inviteStoreAdmin);
authRouter.post('/invitations/validate/:token', validateInvitation);
authRouter.post('/invitations/accept', acceptInvitation);
authRouter.post('/login', userLogin);
authRouter.get('/salla/connect', sallaConnect, authenticateToken);
authRouter.get('/salla/callback', sallaCallback, authenticateToken);


export default authRouter;
