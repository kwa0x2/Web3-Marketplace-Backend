import { ethers } from 'ethers';
import { randomBytes } from 'crypto';

/**
 * Verify wallet signature
 */
export function verifySignature(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

/**
 * Generate random nonce string
 */
export function generateNonce(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create sign message with nonce
 */
export function createSignMessage(address: string, nonce: string): string {
  return `Welcome to Web3 Marketplace!

Sign this message to authenticate your wallet.

Wallet: ${address}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

/**
 * Check if nonce is expired
 */
export function isNonceExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}
