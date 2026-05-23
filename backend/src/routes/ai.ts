import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db/client';
import { verifyToken } from '../middleware/auth';
import { generateInsights, generateRecommendations } from '../services/gemini';
import { AuthRequest, HealthMetric } from '../types';

const router = Router();
router.use(verifyToken);

router.post(
  '/recommendations',
  [
    body('symptoms').isString().isLength({ min: 10, max: 2000 }),
    body('age').isInt({ min: 10, max: 100 }),
    body('medical_history').isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { symptoms, age, medical_history } = req.body;

      const aiResponse = await generateRecommendations(symptoms, age, medical_history);

      const saved = await query(
        `INSERT INTO symptoms_history
         (user_id, symptoms_description, age, medical_history, severity, ai_recommendations)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at`,
        [
          req.user!.id,
          symptoms,
          age,
          medical_history,
          aiResponse.severity,
          JSON.stringify(aiResponse),
        ]
      );

      res.json({
        ...aiResponse,
        id: saved.rows[0].id,
        created_at: saved.rows[0].created_at,
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  }
);

router.post('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const metricsResult = await query<HealthMetric>(
      `SELECT date, weight, sleep_hours, exercise_minutes, mood
       FROM health_metrics
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY date ASC`,
      [userId]
    );

    const metricsData = metricsResult.rows.map((m) => ({
      date: m.date,
      weight: m.weight ? Number(m.weight) : null,
      sleep_hours: m.sleep_hours ? Number(m.sleep_hours) : null,
      exercise_minutes: m.exercise_minutes,
      mood: m.mood,
    }));

    const insights = await generateInsights(metricsData);

    await query(
      `INSERT INTO health_insights (user_id, insights, trends, recommendations)
       VALUES ($1, $2, $3, $4)`,
      [userId, insights.insights, insights.trends, insights.recommendations]
    );

    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
