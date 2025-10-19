import { PutCommand, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '../config/dynamodb';
import { calculateExpirationTime, getCurrentTimestamp } from '../config/session';
import { randomUUID } from 'crypto';
import { Session } from '../domain/entities';
import { ISessionRepository } from '../domain/repositories';

export class SessionRepository implements ISessionRepository {
  async create(
    address: string,
    chain_id?: number,
    user_agent?: string,
    ip_address?: string
  ): Promise<Session> {
    const session_id = randomUUID();
    const now = getCurrentTimestamp();
    const expires_at = calculateExpirationTime(now);

    const session: Session = {
      session_id,
      address: address.toLowerCase(),
      chain_id,
      created_at: now,
      expires_at,
      last_activity_at: now,
      user_agent,
      ip_address,
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLES.SESSIONS,
        Item: session,
      })
    );

    return session;
  }

  async findById(session_id: string): Promise<Session | null> {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.SESSIONS,
        Key: { session_id },
      })
    );

    return (result.Item as Session) || null;
  }

  async delete(session_id: string): Promise<void> {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLES.SESSIONS,
        Key: { session_id },
      })
    );
  }

  async updateActivity(session_id: string): Promise<void> {
    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLES.SESSIONS,
        Key: { session_id },
        UpdateExpression: 'SET last_activity_at = :timestamp',
        ExpressionAttributeValues: {
          ':timestamp': getCurrentTimestamp(),
        },
      })
    );
  }
}
