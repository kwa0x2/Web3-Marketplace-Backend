export interface Session {
  session_id: string;
  address: string;
  chain_id?: number;
  created_at: number; // Unix timestamp (seconds)
  expires_at: number; // Unix timestamp (seconds)
  last_activity_at: number; // Unix timestamp (seconds)
  user_agent?: string;
  ip_address?: string;
}
