import { prisma } from '../config/prisma';
import { User } from '../domain/entities';
import { IUserRepository } from '../domain/repositories';

export class UserRepository implements IUserRepository {
  async findByAddress(address: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });
  }

  async save(user: Partial<User>): Promise<User> {
    const address = user.address!.toLowerCase();

    const { address: _, ...rest } = user;
    const updateData = Object.fromEntries(
      Object.entries(rest).filter(([_, value]) => value !== undefined)
    );

    return await prisma.user.upsert({
      where: { address },
      update: updateData,
      create: {
        address,
        chainId: user.chainId,
        nonce: user.nonce,
        nonceExpiry: user.nonceExpiry,
        createdAt: new Date(),
      },
    });
  }

  async updateLastLogin(address: string): Promise<void> {
    await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { lastLoginAt: new Date() },
    });
  }
}