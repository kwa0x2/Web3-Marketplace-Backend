import { Session, User } from '../domain/entities';
import { IUserRepository } from '../domain/repositories';
import { ISessionUseCases, IAuthUseCases } from '../domain/usecases';
import {
  generateNonce,
  createSignMessage,
  verifySignature,
  isNonceExpired,
} from '../utils/crypto';

export class AuthUseCases implements IAuthUseCases {
  constructor(
    private userRepo: IUserRepository,
    private sessionUseCases: ISessionUseCases
  ) {}

  async generateNonce(address: string): Promise<{ message: string; nonce: string }> {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid wallet address');
    }

    const normalizedAddress = address.toLowerCase();
    const nonce = generateNonce();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepo.save({
      address: normalizedAddress,
      nonce,
      nonceExpiry: expiryDate,
    });

    const message = createSignMessage(normalizedAddress, nonce);

    return { message, nonce };
  }

  async verifyAndAuthenticate(
    signature: string,
    address: string,
    chainId?: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ session: Session; user: User }> {
    if (!signature || !address) {
      throw new Error('Missing required fields');
    }

    const normalizedAddress = address.toLowerCase();

    const user = await this.userRepo.findByAddress(normalizedAddress);
    if (!user || !user.nonce || !user.nonceExpiry) {
      throw new Error('Nonce not found. Please request a new nonce.');
    }

    if (isNonceExpired(user.nonceExpiry)) {
      throw new Error('Nonce expired. Please request a new nonce.');
    }

    const message = createSignMessage(normalizedAddress, user.nonce);

    const recoveredAddress = verifySignature(message, signature);
    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      throw new Error('Invalid signature');
    }

    await this.userRepo.save({
      address: normalizedAddress,
      chainId,
      nonce: null,
      nonceExpiry: null,
      lastLoginAt: new Date(),
    });

    const session = await this.sessionUseCases.createSession(
      normalizedAddress,
      chainId,
      userAgent,
      ipAddress
    );

    const updatedUser = await this.userRepo.findByAddress(normalizedAddress);

    console.log(`✅ Session created for ${normalizedAddress}`);

    return {
      session,
      user: updatedUser!,
    };
  }

  async getCurrentUser(address: string): Promise<User | null> {
    return this.userRepo.findByAddress(address);
  }
}
