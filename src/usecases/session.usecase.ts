import { Session } from '../domain/entities';
import { ISessionRepository } from '../domain/repositories';
import { ISessionUseCases } from '../domain/usecases';
import { getCurrentTimestamp } from '../config/session';

export class SessionUseCases implements ISessionUseCases {
  constructor(private sessionRepo: ISessionRepository) {}

  async createSession(
    address: string,
    chain_id?: number,
    user_agent?: string,
    ip_address?: string
  ): Promise<Session> {
    return await this.sessionRepo.create(address, chain_id, user_agent, ip_address);
  }

  async getSessionAndValidate(session_id: string): Promise<Session | null> {
    const session = await this.sessionRepo.findById(session_id);

    if (!session) {
      return null;
    }

    if (getCurrentTimestamp() > session.expires_at) {
      await this.sessionRepo.delete(session_id);
      return null;
    }

    await this.sessionRepo.updateActivity(session_id);

    return session;
  }

  async deleteSession(session_id: string): Promise<void> {
    await this.sessionRepo.delete(session_id);
  }
}
