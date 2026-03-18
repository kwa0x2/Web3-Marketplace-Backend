import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';
import { createNFTRoutes } from './nft.routes';
import { createCollectionRoutes } from './collection.routes';

export function createV1Routes(): Router {
  const router = Router();

  router.use('/auth', createAuthRoutes());
  router.use('/nft', createNFTRoutes());
  router.use('/collection', createCollectionRoutes());

  return router;
}
