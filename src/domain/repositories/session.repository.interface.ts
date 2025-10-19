import { Session } from '../entities';

export interface ISessionRepository {
  create(
    address: string,
    chain_id?: number,
    user_agent?: string,
    ip_address?: string
  ): Promise<Session>;

  findById(session_id: string): Promise<Session | null>;

  delete(session_id: string): Promise<void>;

  updateActivity(session_id: string): Promise<void>;
}
