import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import aiRoutes from './routes/ai';
import { testConnection } from './db/client';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'ok', service: 'HealthMate API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('Warning: Database connection failed. Some features may not work.');
  }

  app.listen(PORT, () => {
    console.log(`HealthMate API running on http://localhost:${PORT}`);
    console.log(`CORS enabled for: ${FRONTEND_URL}`);
  });
}

start();

export default app;
