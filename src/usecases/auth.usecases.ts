import { UserRepository, User } from '../repositories/user_repository';
import { generateNonceMessage, verifySignature, isNonceExpired } from '../utils/crypto';
import { generateToken } from '../utils/jwt';

export class AuthUseCases {
  constructor(private userRepo: UserRepository) {}

  generateNonce(address: string): { message: string; address: string } {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid wallet address');
    }

    return {
      message: generateNonceMessage(address),
      address: address.toLowerCase(),
    };
  }

  async verifyAndAuthenticate(
    message: string,
    signature: string,
    address: string,
    chainId?: number
  ): Promise<{ token: string; address: string }> {
    if (!message || !signature || !address) {
      throw new Error('Missing required fields');
    }

    if (isNonceExpired(message)) {
      throw new Error('Nonce expired');
    }

    const recoveredAddress = verifySignature(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    let user = await this.userRepo.findByAddress(address);
    if (!user) {
      user = {
        address: address.toLowerCase(),
        chainId,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      await this.userRepo.save(user);
    } else {
      await this.userRepo.updateLastLogin(address);
    }

    const token = generateToken(address, chainId);

    return {
      token,
      address: address.toLowerCase(),
    };
  }

  async getCurrentUser(address: string): Promise<User | null> {
    return this.userRepo.findByAddress(address);
  }
}
