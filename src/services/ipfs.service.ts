import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud',
});

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string; 
  attributes?: Array<{ trait_type: string; value: string }>;
  category?: string;
  royalties?: number;
}

export class IPFSService {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const file = new File([fileBuffer], fileName, { type: mimeType });
    const result = await pinata.upload.public.file(file);
    return `ipfs://${result.cid}`;
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    const result = await pinata.upload.public.json(metadata);
    return `ipfs://${result.cid}`;
  }

  toGatewayURL(ipfsUri: string): string {
    const gateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    return ipfsUri.replace('ipfs://', `https://${gateway}/ipfs/`);
  }
}
