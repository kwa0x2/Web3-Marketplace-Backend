import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export interface TokenPayload {
  address: string;
  chainId?: number;
}

export function generateToken(address: string, chainId?: number): string {
  return jwt.sign(
    { address: address.toLowerCase(), chainId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
