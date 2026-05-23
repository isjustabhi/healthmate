import axios, { AxiosError } from 'axios';
import { getToken } from './auth';
import {
  AIRecommendationResponse,
  AuthResponse,
  HealthInsight,
  HealthMetric,
  MetricsResponse,
  Mood,
  SymptomRecord,
  User,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      throw new Error(
        `Cannot reach API at ${API_URL}. Check NEXT_PUBLIC_API_URL on Vercel (must be https, no trailing slash) and that Railway is running.`
      );
    }
    const message = error.response?.data?.error || error.message || 'Request failed';
    throw new Error(message);
  }
  throw error;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/register', { email, password });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMe(): Promise<{ user: User }> {
  try {
    const { data } = await api.get<{ user: User }>('/api/auth/me');
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getHealthRecommendations(
  symptoms: string,
  age: number,
  conditions: string[]
): Promise<AIRecommendationResponse> {
  try {
    const { data } = await api.post<AIRecommendationResponse>('/api/ai/recommendations', {
      symptoms,
      age,
      medical_history: conditions,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function trackMetrics(params: {
  weight?: number;
  sleep_hours?: number;
  exercise_minutes?: number;
  mood?: Mood;
  date: string;
  notes?: string;
}): Promise<{ metric: HealthMetric }> {
  try {
    const { data } = await api.post<{ metric: HealthMetric }>('/api/health/metrics', params);
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMetrics(): Promise<MetricsResponse> {
  try {
    const { data } = await api.get<MetricsResponse>('/api/health/metrics');
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteMetric(id: string): Promise<void> {
  try {
    await api.delete(`/api/health/metrics/${id}`);
  } catch (error) {
    handleError(error);
  }
}

export async function saveSymptomCheck(params: {
  symptoms: string;
  age: number;
  medical_history: string[];
  ai_response: AIRecommendationResponse;
}): Promise<{ record: SymptomRecord }> {
  try {
    const { data } = await api.post<{ record: SymptomRecord }>('/api/health/symptoms', params);
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getSymptomHistory(): Promise<{ history: SymptomRecord[] }> {
  try {
    const { data } = await api.get<{ history: SymptomRecord[] }>('/api/health/symptoms/history');
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function getInsights(): Promise<{ insight: HealthInsight | null }> {
  try {
    const { data } = await api.get<{ insight: HealthInsight | null }>('/api/health/insights');
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function generateInsights(): Promise<HealthInsight> {
  try {
    const { data } = await api.post<HealthInsight>('/api/ai/insights');
    return data;
  } catch (error) {
    handleError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch {
    // Ignore logout API errors; clear local state regardless
  }
}
