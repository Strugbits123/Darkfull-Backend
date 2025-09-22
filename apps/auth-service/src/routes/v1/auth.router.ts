import express, { Router } from 'express';
import {
  inviteUser,
} from '../../controller/auth.controller';
// import { authenticateToken } from './utils/middlewares/auth.middleware';

const authRouter: Router = express.Router();


authRouter.post('/invite-user', inviteUser);



export default authRouter;
