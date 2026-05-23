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
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    FRONTEND_URL,
  ]);

  const extras = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim().replace(/\/$/, ''));
  extras?.forEach((o) => o && origins.add(o));

  return origins;
}

const allowedOrigins = getAllowedOrigins();

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowedOrigins.has(normalized)) return true;
  // Vercel production + preview deployments
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) return true;
  if (process.env.CORS_ALLOW_VERCEL === 'true' && normalized.endsWith('.vercel.app')) {
    return true;
  }
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin, 'Allowed:', [...allowedOrigins]);
        callback(new Error('Not allowed by CORS'));
      }
    },
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

app.get('/', (_req, res) => {
  res.json({
    service: 'HealthMate API',
    status: 'running',
    frontend: FRONTEND_URL,
    healthCheck: '/api/health-check',
    docs: 'Use the Next.js app at http://localhost:3000 — this port is API-only.',
  });
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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthMate API running on port ${PORT}`);
    console.log(`CORS frontend: ${FRONTEND_URL}`);
    console.log(`Allowed origins:`, [...allowedOrigins]);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the other process (e.g. lsof -ti :${PORT} | xargs kill -9) or change PORT in .env.`
      );
      process.exit(1);
    }
    throw err;
  });
}

start();

export default app;
