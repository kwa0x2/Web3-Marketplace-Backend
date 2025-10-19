import { Request, Response, NextFunction } from 'express';
import { SessionRepository } from '../repositories/session.repository';
import { SessionUseCases } from '../usecases/session.usecase';
import { SESSION_CONFIG } from '../config/session';

declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
        chainId?: number;
      };
      sessionId?: string;
    }
  }
}

const sessionRepo = new SessionRepository();
const sessionUseCases = new SessionUseCases(sessionRepo);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies[SESSION_CONFIG.cookieName];

  if (!sessionId) {
    return res.status(401).json({ error: 'No session found' });
  }

  const session = await sessionUseCases.getSessionAndValidate(sessionId);

  if (!session) {
    res.clearCookie(SESSION_CONFIG.cookieName);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = {
    address: session.address,
    chainId: session.chain_id,
  };
  req.sessionId = sessionId;

  next();
}
