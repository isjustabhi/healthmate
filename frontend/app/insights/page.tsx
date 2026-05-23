'use client';

import { useEffect, useState } from 'react';
import { Brain, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { generateInsights, getInsights } from '@/lib/api';
import { HealthInsight } from '@/lib/types';

export default function InsightsPage() {
  const [insight, setInsight] = useState<HealthInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await getInsights();
      setInsight(res.insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generateInsights();
      setInsight(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Health Insights</h1>
              <p className="text-gray-600">Personalized wellness analysis based on your metrics</p>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 text-sm py-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {generating ? 'Analyzing...' : 'Generate New Insights'}
            </button>
          </div>

          {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : insight ? (
            <div className="space-y-6 animate-fade-in">
              <div className="card">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Summary</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{insight.insights}</p>
                {insight.generated_at && (
                  <p className="mt-4 text-xs text-gray-400">
                    Generated {new Date(insight.generated_at).toLocaleString()}
                  </p>
                )}
              </div>

              {insight.trends && insight.trends.length > 0 && (
                <div className="card">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <TrendingUp className="h-6 w-6 text-brand-blue" />
                    </div>
                    <h2 className="text-lg font-semibold">Observed Trends</h2>
                  </div>
                  <ul className="space-y-3">
                    {insight.trends.map((trend, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.recommendations && insight.recommendations.length > 0 && (
                <div className="card">
                  <h2 className="mb-4 text-lg font-semibold">Recommendations</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {insight.recommendations.map((rec, i) => (
                      <div key={i} className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-300" />
              <h2 className="mt-4 text-lg font-semibold text-gray-700">No insights yet</h2>
              <p className="mt-2 text-gray-500">Log at least a few days of health metrics, then generate AI insights.</p>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary mt-6">
                Generate Insights
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
