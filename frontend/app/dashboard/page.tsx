'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ClipboardList, Loader2, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import HealthChart from '@/components/HealthChart';
import HealthScore, { calculateHealthScore } from '@/components/HealthScore';
import { generateInsights, getInsights, getMetrics, getSymptomHistory } from '@/lib/api';
import { getUser, getUserDisplayName } from '@/lib/auth';
import { HealthInsight, SymptomRecord } from '@/lib/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<Awaited<ReturnType<typeof getMetrics>> | null>(null);
  const [symptomHistory, setSymptomHistory] = useState<SymptomRecord[]>([]);
  const [insight, setInsight] = useState<HealthInsight | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const user = getUser();
  const displayName = getUserDisplayName(user);

  useEffect(() => {
    async function load() {
      try {
        const [metrics, symptoms, insightsRes] = await Promise.all([
          getMetrics(),
          getSymptomHistory(),
          getInsights(),
        ]);
        setMetricsData(metrics);
        setSymptomHistory(symptoms.history);
        setInsight(insightsRes.insight);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const result = await generateInsights();
      setInsight(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const metrics = metricsData?.metrics || [];
  const { score, breakdown } = calculateHealthScore(metrics, metrics.length);
  const lastCheck = symptomHistory[0]?.created_at
    ? new Date(symptomHistory[0].created_at).toLocaleDateString()
    : 'Never';

  const weightChart = [...metrics]
    .reverse()
    .filter((m) => m.weight)
    .slice(-30)
    .map((m) => ({
      name: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(m.weight),
    }));

  const sleepByWeek: Record<string, number[]> = {};
  metrics.forEach((m) => {
    if (!m.sleep_hours) return;
    const week = `W${Math.ceil(new Date(m.date).getDate() / 7)}`;
    if (!sleepByWeek[week]) sleepByWeek[week] = [];
    sleepByWeek[week].push(Number(m.sleep_hours));
  });
  const sleepChart = Object.entries(sleepByWeek).map(([name, vals]) => ({
    name,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
  }));

  const exerciseChart = [...metrics]
    .reverse()
    .filter((m) => m.exercise_minutes != null)
    .slice(-14)
    .map((m) => ({
      name: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: m.exercise_minutes || 0,
    }));

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
              <p className="text-gray-600">Here&apos;s your health overview</p>
            </div>
            <div className="flex gap-3">
              <Link href="/symptoms" className="btn-primary text-sm py-2">Check Symptoms</Link>
              <Link href="/metrics" className="btn-secondary text-sm py-2">Log Metrics</Link>
            </div>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <HealthScore
                score={score}
                breakdown={breakdown}
                lastUpdated={new Date().toLocaleDateString()}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-3">
              {[
                { label: 'Total Check-ups', value: String(symptomHistory.length), icon: ClipboardList },
                { label: 'Last Check', value: lastCheck, icon: Calendar },
                { label: 'Days Tracked', value: String(metrics.length), icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="card flex items-center gap-4">
                  <stat.icon className="h-8 w-8 text-brand-blue" />
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <HealthChart data={weightChart.length ? weightChart : [{ name: 'No data', value: 0 }]} type="line" title="Weight (30 days)" yAxisLabel="kg" color="#3B82F6" />
            </div>
            <div className="card lg:col-span-1">
              <HealthChart data={sleepChart.length ? sleepChart : [{ name: 'No data', value: 0 }]} type="bar" title="Sleep per week" yAxisLabel="hours" color="#10B981" />
            </div>
            <div className="card lg:col-span-1">
              <HealthChart data={exerciseChart.length ? exerciseChart : [{ name: 'No data', value: 0 }]} type="area" title="Exercise trend" yAxisLabel="min" color="#8B5CF6" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <h2 className="mb-4 text-lg font-semibold">Recent Symptom Checks</h2>
              {symptomHistory.length === 0 ? (
                <p className="text-gray-500">No symptom checks yet. <Link href="/symptoms" className="text-brand-blue hover:underline">Try the checker</Link></p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Symptoms</th>
                        <th className="pb-3">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symptomHistory.slice(0, 5).map((s) => (
                        <tr key={s.id} className="border-b border-gray-100">
                          <td className="py-3 pr-4 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="py-3 pr-4 max-w-xs truncate">{s.symptoms_description}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                              s.severity === 'high' ? 'bg-red-100 text-red-800' :
                              s.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>{s.severity}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Latest AI Insights</h2>
                <button
                  onClick={handleGenerateInsights}
                  disabled={generatingInsights}
                  className="text-sm font-medium text-brand-blue hover:underline disabled:opacity-50"
                >
                  {generatingInsights ? 'Generating...' : 'Refresh'}
                </button>
              </div>
              {insight ? (
                <div className="space-y-4">
                  <p className="text-gray-700">{insight.insights}</p>
                  {insight.trends?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-600">Trends</p>
                      <ul className="space-y-1">
                        {insight.trends.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-green" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">Log some metrics first, then generate AI insights.</p>
                  <button onClick={handleGenerateInsights} disabled={generatingInsights} className="btn-primary mt-4 text-sm py-2">
                    Generate Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
