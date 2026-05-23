import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query } from '../db/client';
import { verifyToken } from '../middleware/auth';
import { AuthRequest, HealthMetric, SymptomRecord } from '../types';

const router = Router();
router.use(verifyToken);

const MOODS = ['Great', 'Good', 'Okay', 'Bad'];

router.post(
  '/metrics',
  [
    body('date').isISO8601().toDate(),
    body('weight').optional().isFloat({ min: 0, max: 500 }),
    body('sleep_hours').optional().isFloat({ min: 0, max: 24 }),
    body('exercise_minutes').optional().isInt({ min: 0, max: 1440 }),
    body('mood').optional().isIn(MOODS),
    body('notes').optional().isString().isLength({ max: 1000 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { date, weight, sleep_hours, exercise_minutes, mood, notes } = req.body;
      const userId = req.user!.id;
      const dateStr = new Date(date).toISOString().split('T')[0];

      const result = await query<HealthMetric>(
        `INSERT INTO health_metrics (user_id, date, weight, sleep_hours, exercise_minutes, mood, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, date) DO UPDATE SET
           weight = EXCLUDED.weight,
           sleep_hours = EXCLUDED.sleep_hours,
           exercise_minutes = EXCLUDED.exercise_minutes,
           mood = EXCLUDED.mood,
           notes = EXCLUDED.notes
         RETURNING *`,
        [userId, dateStr, weight ?? null, sleep_hours ?? null, exercise_minutes ?? null, mood ?? null, notes ?? null]
      );

      res.status(201).json({ metric: result.rows[0] });
    } catch (error) {
      console.error('Save metrics error:', error);
      res.status(500).json({ error: 'Failed to save metrics' });
    }
  }
);

router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query<HealthMetric>(
      `SELECT * FROM health_metrics
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY date DESC`,
      [userId]
    );

    const avgResult = await query<{
      avg_weight: string | null;
      avg_sleep: string | null;
      avg_exercise: string | null;
    }>(
      `SELECT
         AVG(weight)::numeric(5,2) as avg_weight,
         AVG(sleep_hours)::numeric(3,1) as avg_sleep,
         AVG(exercise_minutes)::numeric as avg_exercise
       FROM health_metrics
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );

    const avg = avgResult.rows[0];
    res.json({
      metrics: result.rows,
      averages: {
        weight: avg?.avg_weight ? parseFloat(avg.avg_weight) : null,
        sleep_hours: avg?.avg_sleep ? parseFloat(avg.avg_sleep) : null,
        exercise_minutes: avg?.avg_exercise ? parseFloat(avg.avg_exercise) : null,
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.delete(
  '/metrics/:id',
  [param('id').isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Invalid metric ID' });
        return;
      }

      const result = await query(
        'DELETE FROM health_metrics WHERE id = $1 AND user_id = $2 RETURNING id',
        [req.params.id, req.user!.id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Metric not found' });
        return;
      }

      res.json({ message: 'Metric deleted successfully' });
    } catch (error) {
      console.error('Delete metric error:', error);
      res.status(500).json({ error: 'Failed to delete metric' });
    }
  }
);

router.post(
  '/symptoms',
  [
    body('symptoms').isString().isLength({ min: 10, max: 2000 }),
    body('age').isInt({ min: 10, max: 100 }),
    body('medical_history').isArray(),
    body('ai_response').isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { symptoms, age, medical_history, ai_response } = req.body;

      const result = await query<SymptomRecord>(
        `INSERT INTO symptoms_history
         (user_id, symptoms_description, age, medical_history, severity, ai_recommendations)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          req.user!.id,
          symptoms,
          age,
          medical_history,
          ai_response.severity || 'low',
          JSON.stringify(ai_response),
        ]
      );

      res.status(201).json({ record: result.rows[0] });
    } catch (error) {
      console.error('Save symptoms error:', error);
      res.status(500).json({ error: 'Failed to save symptom check' });
    }
  }
);

router.get('/symptoms/history', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query<SymptomRecord>(
      `SELECT id, symptoms_description, age, medical_history, severity,
              ai_recommendations, created_at
       FROM symptoms_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user!.id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get symptoms history error:', error);
    res.status(500).json({ error: 'Failed to fetch symptom history' });
  }
});

router.get('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT insights, trends, recommendations, generated_at
       FROM health_insights
       WHERE user_id = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.json({ insight: null });
      return;
    }

    res.json({ insight: result.rows[0] });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
