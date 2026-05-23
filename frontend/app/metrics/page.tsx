'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import HealthChart from '@/components/HealthChart';
import HealthMetrics from '@/components/HealthMetrics';
import { deleteMetric, getMetrics, trackMetrics } from '@/lib/api';
import { HealthMetric, MetricsResponse, Mood } from '@/lib/types';

const MOODS: Mood[] = ['Great', 'Good', 'Okay', 'Bad'];

export default function MetricsPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    sleep_hours: '',
    exercise_minutes: '',
    mood: 'Good' as Mood,
    notes: '',
  });

  const loadMetrics = async () => {
    try {
      const res = await getMetrics();
      setData(res);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await trackMetrics({
        date: form.date,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : undefined,
        exercise_minutes: form.exercise_minutes ? parseInt(form.exercise_minutes, 10) : undefined,
        mood: form.mood,
        notes: form.notes || undefined,
      });
      setMessage({ type: 'success', text: 'Metrics saved successfully!' });
      setForm((f) => ({ ...f, weight: '', sleep_hours: '', exercise_minutes: '', notes: '' }));
      await loadMetrics();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteMetric(id);
      setMessage({ type: 'success', text: 'Entry deleted.' });
      await loadMetrics();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  const metrics = data?.metrics || [];
  const weightChart = [...metrics].reverse().filter((m) => m.weight).map((m) => ({
    name: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(m.weight),
  }));
  const sleepChart = [...metrics].reverse().filter((m) => m.sleep_hours).map((m) => ({
    name: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(m.sleep_hours),
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Health Metrics</h1>
            <p className="text-gray-600">Log and track your daily wellness data</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : (
            <>
              {data && <div className="mb-8"><HealthMetrics data={data} /></div>}

              <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <form onSubmit={handleSubmit} className="card space-y-4">
                  <h2 className="text-lg font-semibold">Log Today&apos;s Metrics</h2>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Weight (kg)</label>
                      <input type="number" step="0.1" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" placeholder="70.5" />
                    </div>
                    <div>
                      <label className="label">Sleep (hours)</label>
                      <input type="number" step="0.5" min="0" max="24" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} className="input-field" placeholder="7.5" />
                    </div>
                    <div>
                      <label className="label">Exercise (minutes)</label>
                      <input type="number" min="0" value={form.exercise_minutes} onChange={(e) => setForm({ ...form, exercise_minutes: e.target.value })} className="input-field" placeholder="30" />
                    </div>
                    <div>
                      <label className="label">Mood</label>
                      <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value as Mood })} className="input-field">
                        {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" rows={3} placeholder="Optional notes..." />
                  </div>
                  {message.text && (
                    <div className={`rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {message.text}
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin inline" />Saving...</> : 'Save Metrics'}
                  </button>
                </form>

                <div className="space-y-6">
                  <div className="card">
                    <HealthChart data={weightChart.length ? weightChart : [{ name: '—', value: 0 }]} type="line" title="Weight Trend" color="#3B82F6" />
                  </div>
                  <div className="card">
                    <HealthChart data={sleepChart.length ? sleepChart : [{ name: '—', value: 0 }]} type="area" title="Sleep Trend" color="#10B981" />
                  </div>
                </div>
              </div>

              <div className="card overflow-hidden">
                <h2 className="mb-4 text-lg font-semibold">Last 30 Days</h2>
                {metrics.length === 0 ? (
                  <p className="text-gray-500">No metrics logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Weight</th>
                          <th className="pb-3 pr-4">Sleep</th>
                          <th className="pb-3 pr-4">Exercise</th>
                          <th className="pb-3 pr-4">Mood</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((m: HealthMetric) => (
                          <tr key={m.id} className="border-b border-gray-100">
                            <td className="py-3 pr-4">{new Date(m.date).toLocaleDateString()}</td>
                            <td className="py-3 pr-4">{m.weight ? `${m.weight} kg` : '—'}</td>
                            <td className="py-3 pr-4">{m.sleep_hours ? `${m.sleep_hours}h` : '—'}</td>
                            <td className="py-3 pr-4">{m.exercise_minutes ? `${m.exercise_minutes}m` : '—'}</td>
                            <td className="py-3 pr-4">{m.mood || '—'}</td>
                            <td className="py-3">
                              <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
