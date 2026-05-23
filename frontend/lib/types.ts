export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

export interface MetricsResponse {
  metrics: HealthMetric[];
  averages: {
    weight: number | null;
    sleep_hours: number | null;
    exercise_minutes: number | null;
  };
}

export interface AIRecommendationResponse {
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  healthTips: string[];
  shouldSeeMD: boolean;
  id?: string;
  created_at?: string;
}

export interface SymptomRecord {
  id: string;
  symptoms_description: string;
  age: number;
  medical_history: string[];
  severity: string;
  ai_recommendations: AIRecommendationResponse;
  created_at: string;
}

export interface HealthInsight {
  insights: string;
  trends: string[];
  recommendations: string[];
  generated_at?: string;
}

export type ChartType = 'line' | 'bar' | 'area';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export type Mood = 'Great' | 'Good' | 'Okay' | 'Bad';
