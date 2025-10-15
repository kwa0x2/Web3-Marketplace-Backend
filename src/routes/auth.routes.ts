import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthUseCases } from '../usecases/auth.usecases';
import { UserRepository } from '../repositories/user_repository';
import { authMiddleware } from '../middleware/auth.middleware';

export function createAuthRoutes(): Router {
  const router = Router();

  const userRepo = new UserRepository();
  const authUseCases = new AuthUseCases(userRepo);
  const authController = new AuthController(authUseCases);

  // Public routes
  router.post('/nonce', (req, res) => authController.generateNonce(req, res));
  router.post('/verify', (req, res) => authController.verifySignature(req, res));

  // Protected routes
  router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
  router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

  return router;
}
