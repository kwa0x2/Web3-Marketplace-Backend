export interface User {
  address: string;
  chainId?: number;
  createdAt: Date;
  lastLoginAt: Date;
}

export class UserRepository {
  private users: Map<string, User> = new Map();

  async findByAddress(address: string): Promise<User | null> {
    return this.users.get(address.toLowerCase()) || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.address.toLowerCase(), user);
    return user;
  }

  async updateLastLogin(address: string): Promise<void> {
    const user = await this.findByAddress(address);
    if (user) {
      user.lastLoginAt = new Date();
      await this.save(user);
    }
  }
}
