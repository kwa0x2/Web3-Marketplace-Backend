import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IPFSService, NFTMetadata } from '../services/ipfs.service';

const ipfsService = new IPFSService();
const prisma = new PrismaClient();

export class NFTController {
  async uploadToIPFS(req: Request, res: Response) {
    try {
      if (!req.user?.address) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { name, description, category, royalties, properties, chainId, contractAddress } = req.body;

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
          contractAddress: contractAddress || '0x45aA14387e9694CD8175D20fD8B69AB6533C83D6',
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
