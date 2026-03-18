import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CollectionController {
  async list(_req: Request, res: Response) {
    try {
      const collections = await prisma.collection.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { nfts: true } },
          owner: { select: { address: true, avatar: true } },
        },
      });

      const data = await Promise.all(
        collections.map(async (col) => {
          const nftStats = await prisma.nft.aggregate({
            where: { collectionId: col.id, price: { not: null } },
            _min: { price: true },
            _count: true,
          });

          const owners = await prisma.nft.groupBy({
            by: ['creatorAddress'],
            where: { collectionId: col.id },
          });

          return {
            id: col.id,
            name: col.name,
            symbol: col.symbol,
            description: col.description,
            image: col.image,
            verified: col.verified,
            ownerAddress: col.ownerAddress,
            owner: col.owner,
            itemCount: col._count.nfts,
            floorPrice: nftStats._min.price ?? 0,
            listedCount: nftStats._count,
            ownerCount: owners.length,
            createdAt: col.createdAt,
          };
        })
      );

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('List collections error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch collections' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const col = await prisma.collection.findUnique({
        where: { id: req.params.id },
        include: {
          owner: { select: { address: true, avatar: true } },
          nfts: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!col) return res.status(404).json({ error: 'Collection not found' });

      res.json({ success: true, data: col });
    } catch (error: any) {
      console.error('Get collection error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch collection' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user?.address) return res.status(401).json({ error: 'Unauthorized' });

      const { name, symbol, description, image } = req.body;
      if (!name || !symbol) return res.status(400).json({ error: 'Name and symbol are required' });

      const collection = await prisma.collection.create({
        data: {
          name,
          symbol: symbol.toUpperCase(),
          description: description || null,
          image: image || null,
          ownerAddress: req.user.address,
        },
      });

      res.status(201).json({ success: true, data: collection });
    } catch (error: any) {
      console.error('Create collection error:', error);
      res.status(500).json({ success: false, error: 'Failed to create collection' });
    }
  }

  async myCollections(req: Request, res: Response) {
    try {
      if (!req.user?.address) return res.status(401).json({ error: 'Unauthorized' });

      const collections = await prisma.collection.findMany({
        where: { ownerAddress: req.user.address },
        include: { _count: { select: { nfts: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const data = collections.map((col) => ({
        id: col.id,
        name: col.name,
        symbol: col.symbol,
        image: col.image,
        itemCount: col._count.nfts,
      }));

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('My collections error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch collections' });
    }
  }
}
