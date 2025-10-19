import { Request, Response } from 'express';
import { AuthUseCases } from '../usecases/auth.usecase';
import { SessionUseCases } from '../usecases/session.usecase';
import { SESSION_CONFIG, getCookieMaxAge } from '../config/session';

export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private sessionUseCases?: SessionUseCases
  ) {}

  /**
   * POST /api/auth/nonce
   * Step 1: Generate nonce for wallet to sign
   * Body: { address: "0x..." }
   * Response: { message: "Sign this...", nonce: "abc123..." }
   */
  async generateNonce(req: Request, res: Response) {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      const result = await this.authUseCases.generateNonce(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/auth/verify
   * Step 2: Verify signed message and authenticate
   * Body: { signature: "0x...", address: "0x...", chainId?: 1 }
   * Response: Sets httpOnly cookie and returns { user: {...} }
   */
  async verifySignature(req: Request, res: Response) {
    try {
      const { signature, address, chainId } = req.body;

      if (!signature || !address) {
        return res.status(400).json({
          error: 'Missing required fields: signature, address'
        });
      }

      const result = await this.authUseCases.verifyAndAuthenticate(
        signature,
        address,
        chainId,
        req.headers['user-agent'],
        req.ip
      );

      res.cookie(SESSION_CONFIG.cookieName, result.session.session_id, {
        httpOnly: SESSION_CONFIG.cookie.httpOnly,
        secure: SESSION_CONFIG.cookie.secure,
        sameSite: SESSION_CONFIG.cookie.sameSite,
        maxAge: getCookieMaxAge(),
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          expiresIn: `${SESSION_CONFIG.durationDays}d`,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user (requires session cookie)
   * Response: { user: {...} }
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user?.address) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.authUseCases.getCurrentUser(req.user.address);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user by clearing session
   */
  async logout(req: Request, res: Response) {
    try {
      const sessionId = req.cookies[SESSION_CONFIG.cookieName];

      if (sessionId && this.sessionUseCases) {
        await this.sessionUseCases.deleteSession(sessionId);
      }

      res.clearCookie(SESSION_CONFIG.cookieName);
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
