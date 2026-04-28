import { Router } from 'express';
import multer from 'multer';
import { NFTController } from '../controllers/nft.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'video/mp4',
      'audio/mpeg',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PNG, JPG, GIF, WEBP, MP4, MP3'));
    }
  },
});

export function createNFTRoutes(): Router {
  const router = Router();
  const nftController = new NFTController();

  // Public routes
  router.get('/', (req, res) => nftController.list(req, res));

  // Protected routes
  router.get('/mine', authMiddleware, (req, res) => nftController.getMine(req, res));
  router.get('/:id', (req, res) => nftController.getById(req, res));
  router.post('/upload', authMiddleware, upload.single('file'), (req, res) => nftController.uploadToIPFS(req, res));
  router.post('/', authMiddleware, (req, res) => nftController.create(req, res));
  router.patch('/:id/price', authMiddleware, (req, res) => nftController.updatePrice(req, res));
  router.patch('/token/:tokenId/price', authMiddleware, (req, res) => nftController.updatePriceByTokenId(req, res));
  router.patch('/token/:tokenId/sold', (req, res) => nftController.markSold(req, res));

  return router;
}
