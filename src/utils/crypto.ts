import { ethers } from 'ethers';

export function verifySignature(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

export function generateNonceMessage(address: string): string {
  const timestamp = Date.now();
  return `Welcome to Web3 Marketplace!

Sign this message to authenticate your wallet.

Wallet: ${address}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

export function isNonceExpired(message: string): boolean {
  const match = message.match(/Timestamp: (\d+)/);
  if (!match) return false;

  const timestamp = parseInt(match[1]);
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - timestamp > fiveMinutes;
}
