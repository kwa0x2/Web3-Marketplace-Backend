import { ethers } from 'ethers';
import { randomBytes } from 'crypto';

export function verifySignature(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

export function generateNonce(): string {
  return randomBytes(32).toString('hex');
}

export function createSignMessage(address: string, nonce: string): string {
  return `Welcome to Web3 Marketplace!

Sign this message to authenticate your wallet.

Wallet: ${address}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

export function isNonceExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}
