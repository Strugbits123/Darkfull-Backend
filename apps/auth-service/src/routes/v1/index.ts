import express from 'express';
import authRouter from './auth.router';
import storeRouter from './store.router';

const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/stores', storeRouter);

export default v1Router;