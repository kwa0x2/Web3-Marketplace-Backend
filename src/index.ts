import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createV1Routes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Web3 Marketplace API',
    version: '1.0.0',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      docs: '/api/v1/docs',
    },
  });
});

app.use('/api/v1', createV1Routes());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Server is running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 CORS: ${FRONTEND_URL}`);
  console.log(`\n📚 API Routes:`);
  console.log(`   GET  /                    - API info`);
  console.log(`   GET  /health              - Health check`);
  console.log(`   POST /api/v1/auth/nonce   - Generate nonce`);
  console.log(`   POST /api/v1/auth/verify  - Verify signature`);
  console.log(`   GET  /api/v1/auth/me      - Get current user (protected)`);
  console.log(`   POST /api/v1/auth/logout  - Logout (protected)`);
  console.log('');
});

export default app;
