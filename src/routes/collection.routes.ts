import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createCollectionRoutes(): Router {
  const router = Router();
  const controller = new CollectionController();

  router.get('/', (req, res) => controller.list(req, res));

  router.get('/my', authMiddleware, (req, res) => controller.myCollections(req, res));
  router.post('/', authMiddleware, (req, res) => controller.create(req, res));

  router.get('/:id', (req, res) => controller.getById(req, res));

  return router;
}
