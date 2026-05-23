import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIInsightsResponse, AIRecommendationResponse } from '../types';

const MODEL_NAME = 'gemini-1.5-flash';

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

function extractJson(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
}

function validateRecommendations(data: unknown): AIRecommendationResponse {
  const obj = data as Record<string, unknown>;
  const severity = String(obj.severity || 'low').toLowerCase();
  const validSeverity = ['low', 'medium', 'high'].includes(severity)
    ? (severity as 'low' | 'medium' | 'high')
    : 'low';

  return {
    recommendations: Array.isArray(obj.recommendations)
      ? obj.recommendations.map(String)
      : ['Stay hydrated and get adequate rest.'],
    severity: validSeverity,
    healthTips: Array.isArray(obj.healthTips)
      ? obj.healthTips.map(String)
      : ['Monitor your symptoms and rest as needed.'],
    shouldSeeMD: Boolean(obj.shouldSeeMD) || validSeverity === 'high',
  };
}

function validateInsights(data: unknown): AIInsightsResponse {
  const obj = data as Record<string, unknown>;
  return {
    insights: String(obj.insights || 'Keep tracking your health metrics regularly.'),
    trends: Array.isArray(obj.trends) ? obj.trends.map(String) : [],
    recommendations: Array.isArray(obj.recommendations)
      ? obj.recommendations.map(String)
      : ['Continue logging daily metrics for better insights.'],
  };
}

export async function generateRecommendations(
  symptoms: string,
  age: number,
  medicalHistory: string[]
): Promise<AIRecommendationResponse> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const systemPrompt = `You are a health wellness AI assistant. Provide general wellness recommendations based on symptoms described.
IMPORTANT: Always recommend seeing a doctor for serious symptoms. Never diagnose diseases.
Focus on general wellness tips, home remedies, lifestyle changes.
Return ONLY valid JSON (no markdown) with this exact structure:
{
  "recommendations": ["string array of 3-5 recommendations"],
  "severity": "low" | "medium" | "high",
  "healthTips": ["string array of 3-5 tips"],
  "shouldSeeMD": boolean
}`;

  const userPrompt = `Symptoms: ${symptoms}
Age: ${age}
Medical history: ${medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None reported'}`;

  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const text = result.response.text();
    const parsed = JSON.parse(extractJson(text));
    return validateRecommendations(parsed);
  } catch (error) {
    console.error('Gemini recommendations error:', error);
    return {
      recommendations: [
        'Rest and stay well hydrated.',
        'Monitor your symptoms over the next 24-48 hours.',
        'Avoid strenuous activity until you feel better.',
      ],
      severity: 'medium',
      healthTips: [
        'Get adequate sleep (7-9 hours).',
        'Eat nutritious, easy-to-digest meals.',
        'Consider over-the-counter remedies only if appropriate for your symptoms.',
      ],
      shouldSeeMD: false,
    };
  }
}

export async function generateInsights(
  metricsData: Array<{
    date: string;
    weight: number | null;
    sleep_hours: number | null;
    exercise_minutes: number | null;
    mood: string | null;
  }>
): Promise<AIInsightsResponse> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Analyze these health metrics and provide personalized wellness insights.
Include trends, positive observations, and suggestions for improvement.
Return ONLY valid JSON (no markdown) with this exact structure:
{
  "insights": "string - 2-3 sentence summary",
  "trends": ["string array of observed trends"],
  "recommendations": ["string array of 3-5 actionable recommendations"]
}

Health metrics data (last 30 days):
${JSON.stringify(metricsData, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(extractJson(text));
    return validateInsights(parsed);
  } catch (error) {
    console.error('Gemini insights error:', error);
    return {
      insights:
        'Based on your logged data, maintaining consistent tracking will help identify meaningful health patterns over time.',
      trends: ['Continue logging metrics daily for more accurate trend analysis.'],
      recommendations: [
        'Aim for 7-9 hours of sleep per night.',
        'Include at least 30 minutes of moderate exercise most days.',
        'Track your mood alongside physical metrics.',
      ],
    };
  }
}
