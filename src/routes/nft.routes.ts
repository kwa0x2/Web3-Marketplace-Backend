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

  // Protected routes
  router.post('/upload', authMiddleware, upload.single('file'), (req, res) => nftController.uploadToIPFS(req, res));
  router.patch('/:id/mint', authMiddleware, (req, res) => nftController.updateMintDetails(req, res));

  return router;
}
