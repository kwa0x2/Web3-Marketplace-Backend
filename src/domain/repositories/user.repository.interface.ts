import { User } from '../entities';

export interface IUserRepository {
  findByAddress(address: string): Promise<User | null>;

  save(user: Partial<User>): Promise<User>;

  updateLastLogin(address: string): Promise<void>;
}
