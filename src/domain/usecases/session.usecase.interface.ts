import { Session } from '../entities';

export interface ISessionUseCases {
  createSession(
    address: string,
    chain_id?: number,
    user_agent?: string,
    ip_address?: string
  ): Promise<Session>;

  getSessionAndValidate(session_id: string): Promise<Session | null>;

  deleteSession(session_id: string): Promise<void>;
}
