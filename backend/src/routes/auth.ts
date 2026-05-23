import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db/client';
import { verifyToken } from '../middleware/auth';
import { AuthRequest, User } from '../types';

const router = Router();
const SALT_ROUNDS = 12;

function generateToken(user: { id: string; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { email, password } = req.body;

      const existing = await query<User>('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const result = await query<User>(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Invalid email or password' });
        return;
      }

      const { email, password } = req.body;

      const result = await query<User>(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash!);

      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query<User>(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
