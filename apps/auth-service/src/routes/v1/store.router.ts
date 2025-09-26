import express, { Router } from 'express';
import {
    createStore,
    getStoreDetails,
    getPaginatedStores,
    updateStore,
    deleteStore
} from '../../controller/store.controller';
import { authenticateToken } from '../../utils/middlewares/auth.middleware';
import { 
  requireSuperAdmin,
} from '../../utils/middlewares/invitation.middleware';
import { requireStoreAccess } from '../../utils/middlewares/store.middleware';

const storeRouter: Router = express.Router();

// Protected routes - Super Admin only
storeRouter.post('/', 
  authenticateToken,
  requireSuperAdmin,
  createStore
);

storeRouter.get('/:id', 
  authenticateToken,
  requireSuperAdmin,
  getStoreDetails
);

storeRouter.get('/', 
  authenticateToken,
  requireSuperAdmin,
  getPaginatedStores
);

storeRouter.put('/:id', 
  authenticateToken,
  requireSuperAdmin,
  updateStore
);

storeRouter.delete('/:id', 
  authenticateToken,
  requireSuperAdmin,
  deleteStore
);

export default storeRouter;
