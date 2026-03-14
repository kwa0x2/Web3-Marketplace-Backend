import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';
import { createNFTRoutes } from './nft.routes';

export function createV1Routes(): Router {
  const router = Router();

  router.use('/auth', createAuthRoutes());
  router.use('/nft', createNFTRoutes());

  return router;
}
