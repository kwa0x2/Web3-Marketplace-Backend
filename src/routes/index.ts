import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';

export function createV1Routes(): Router {
  const router = Router();

  router.use('/auth', createAuthRoutes());

  return router;
}
