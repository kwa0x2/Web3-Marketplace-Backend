import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthPayload {
  address: string;
  chainId?: number;
}

export function verifySignature(message: string, signature: string): string {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress;
  } catch (error) {
    throw new Error('Invalid signature');
  }
}

export function generateToken(address: string, chainId?: number): string {
  const payload: AuthPayload = {
    address: address.toLowerCase(),
    chainId,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateNonceMessage(address: string): string {
  const timestamp = Date.now();
  return `Welcome to Web3 Marketplace!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
}
