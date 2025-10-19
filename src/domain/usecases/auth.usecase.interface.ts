import { Session, User } from '../entities';

export interface IAuthUseCases {
  generateNonce(address: string): Promise<{ message: string; nonce: string }>;

  verifyAndAuthenticate(
    signature: string,
    address: string,
    chainId?: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ session: Session; user: User }>;

  getCurrentUser(address: string): Promise<User | null>;
}
