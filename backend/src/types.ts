import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface HealthMetric {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  sleep_hours: number | null;
  exercise_minutes: number | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
}

export interface SymptomRecord {
  id: string;
  user_id: string;
  symptoms_description: string;
  age: number;
  medical_history: string[];
  severity: string;
  ai_recommendations: AIRecommendationResponse;
  created_at: string;
}

export interface HealthInsight {
  id: string;
  user_id: string;
  insights: string;
  trends: string[];
  recommendations: string[];
  generated_at: string;
}

export interface AIRecommendationResponse {
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  healthTips: string[];
  shouldSeeMD: boolean;
}

export interface AIInsightsResponse {
  insights: string;
  trends: string[];
  recommendations: string[];
}

export interface MetricsAverages {
  weight: number | null;
  sleep_hours: number | null;
  exercise_minutes: number | null;
}
