import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IPFSService, NFTMetadata } from '../services/ipfs.service';

const ipfsService = new IPFSService();
const prisma = new PrismaClient();

export class NFTController {
  async list(req: Request, res: Response) {
    try {
      const { category, creator, listed, page = '1', limit = '20' } = req.query;

      const take = Math.min(parseInt(limit as string) || 20, 100);
      const skip = (Math.max(parseInt(page as string) || 1, 1) - 1) * take;

      const where: any = {};
      if (category) where.category = category;
      if (creator) where.creatorAddress = creator;
      if (listed === 'true') where.price = { not: null };

      const [nfts, total] = await Promise.all([
        prisma.nft.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
          include: { creator: { select: { address: true, avatar: true } } },
        }),
        prisma.nft.count({ where }),
      ]);

      const data = nfts.map((nft) => ({
        ...nft,
        fileGatewayUrl: ipfsService.toGatewayURL(nft.fileUri),
        metadataGatewayUrl: ipfsService.toGatewayURL(nft.metadataUri),
      }));

      res.json({
        success: true,
        data,
        pagination: { page: skip / take + 1, limit: take, total, totalPages: Math.ceil(total / take) },
      });
    } catch (error: any) {
      console.error('List NFTs error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch NFTs' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nft = await prisma.nft.findUnique({
        where: { id },
        include: { creator: { select: { address: true, avatar: true } } },
      });

      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      res.json({
        success: true,
        data: { ...nft, fileGatewayUrl: ipfsService.toGatewayURL(nft.fileUri), metadataGatewayUrl: ipfsService.toGatewayURL(nft.metadataUri) },
      });
    } catch (error: any) {
      console.error('Get NFT error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch NFT' });
    }
  }

  async uploadToIPFS(req: Request, res: Response) {
    try {
      if (!req.user?.address) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { name, description, category, royalties, properties, chainId, contractAddress, collectionId, price, currency } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const fileIPFSUri = await ipfsService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      let parsedProperties: Array<{ trait_type: string; value: string }> = [];
      if (properties) {
        try {
          parsedProperties = JSON.parse(properties);
        } catch {
          // ignore invalid properties
        }
      }

      const metadata: NFTMetadata = {
        name,
        description: description || '',
        image: fileIPFSUri,
        category: category || undefined,
        royalties: royalties ? parseFloat(royalties) : undefined,
        attributes: parsedProperties.length > 0 ? parsedProperties : undefined,
      };

      const metadataIPFSUri = await ipfsService.uploadMetadata(metadata);

      const royaltyBps = royalties ? Math.round(parseFloat(royalties) * 100) : 1000;

      const nft = await prisma.nft.create({
        data: {
          name,
          description: description || null,
          category: category || null,
          fileUri: fileIPFSUri,
          metadataUri: metadataIPFSUri,
          royaltyBps,
          chainId: chainId ? parseInt(chainId) : 11155111,
          contractAddress: contractAddress || '0x8273737C2bd56b16a97D99F66Ed1Be155f7dd5FE',
          collectionId: collectionId || null,
          price: price ? parseFloat(price) : null,
          currency: currency || null,
          creatorAddress: req.user.address,
        },
      });

      res.json({
        success: true,
        data: {
          id: nft.id,
          fileUri: fileIPFSUri,
          metadataUri: metadataIPFSUri,
          fileGatewayUrl: ipfsService.toGatewayURL(fileIPFSUri),
          metadataGatewayUrl: ipfsService.toGatewayURL(metadataIPFSUri),
        },
      });
    } catch (error: any) {
      console.error('IPFS upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload to IPFS',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  async markSold(req: Request, res: Response) {
    try {
      const { tokenId } = req.params;
      const { buyerAddress } = req.body;

      if (!buyerAddress) {
        return res.status(400).json({ error: 'buyerAddress is required' });
      }

      const nft = await prisma.nft.findFirst({
        where: { tokenId: parseInt(tokenId) },
      });

      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      const updated = await prisma.nft.update({
        where: { id: nft.id },
        data: {
          ownerAddress: buyerAddress.toLowerCase(),
          price: null,
          currency: null,
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Mark sold error:', error);
      res.status(500).json({ success: false, error: 'Failed to mark NFT as sold' });
    }
  }

  async updateMintDetails(req: Request, res: Response) {
    try {
      if (!req.user?.address) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const { txHash, tokenId } = req.body;

      const nft = await prisma.nft.findUnique({ where: { id } });

      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      if (nft.creatorAddress !== req.user.address) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updated = await prisma.nft.update({
        where: { id },
        data: {
          txHash: txHash || null,
          tokenId: tokenId !== undefined ? parseInt(tokenId) : null,
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Update mint error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update mint details',
      });
    }
  }
}
