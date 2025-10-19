import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthUseCases } from '../usecases/auth.usecase';
import { SessionUseCases } from '../usecases/session.usecase';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { authMiddleware } from '../middleware/auth.middleware';

export function createAuthRoutes(): Router {
  const router = Router();

  const userRepo = new UserRepository();
  const sessionRepo = new SessionRepository();
  const sessionUseCases = new SessionUseCases(sessionRepo);
  const authUseCases = new AuthUseCases(userRepo, sessionUseCases);
  const authController = new AuthController(authUseCases, sessionUseCases);

  // Public routes
  router.post('/nonce', (req, res) => authController.generateNonce(req, res));
  router.post('/verify', (req, res) => authController.verifySignature(req, res));

  // Protected routes
  router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));

  return router;
}
