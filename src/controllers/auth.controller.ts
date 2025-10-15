import { Request, Response } from 'express';
import { AuthUseCases } from '../usecases/auth.usecases';

export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  /**
   * POST /api/auth/nonce
   */
  async generateNonce(req: Request, res: Response) {
    try {
      const { address } = req.body;
      const result = this.authUseCases.generateNonce(address);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/verify
   */
  async verifySignature(req: Request, res: Response) {
    try {
      const { message, signature, address, chainId } = req.body;
      const result = await this.authUseCases.verifyAndAuthenticate(
        message,
        signature,
        address,
        chainId
      );
      res.json({ ...result, expiresIn: '7d' });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await this.authUseCases.getCurrentUser(req.user!.address);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/logout
   */
  logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' });
  }
}
