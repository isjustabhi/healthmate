'use client';

interface HealthScoreProps {
  score: number;
  lastUpdated?: string;
  breakdown?: {
    exercise: number;
    sleep: number;
    consistency: number;
    trends: number;
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

export function calculateHealthScore(metrics: {
  sleep_hours: number | null;
  exercise_minutes: number | null;
}[], daysTracked: number): { score: number; breakdown: { exercise: number; sleep: number; consistency: number; trends: number } } {
  if (metrics.length === 0) {
    return { score: 50, breakdown: { exercise: 50, sleep: 50, consistency: 0, trends: 50 } };
  }

  const recent = metrics.slice(0, 14);
  const avgSleep = recent.reduce((s, m) => s + (m.sleep_hours || 0), 0) / recent.length;
  const avgExercise = recent.reduce((s, m) => s + (m.exercise_minutes || 0), 0) / recent.length;

  const sleepScore = Math.min(100, Math.round((avgSleep / 8) * 100));
  const exerciseScore = Math.min(100, Math.round((avgExercise / 30) * 100));
  const consistencyScore = Math.min(100, Math.round((daysTracked / 30) * 100));

  let trendScore = 70;
  if (metrics.length >= 7) {
    const firstHalf = metrics.slice(Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const firstEx = firstHalf.reduce((s, m) => s + (m.exercise_minutes || 0), 0) / firstHalf.length;
    const secondEx = secondHalf.reduce((s, m) => s + (m.exercise_minutes || 0), 0) / (secondHalf.length || 1);
    if (secondEx >= firstEx) trendScore = 85;
    else trendScore = 55;
  }

  const score = Math.round(
    sleepScore * 0.25 + exerciseScore * 0.25 + consistencyScore * 0.25 + trendScore * 0.25
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      exercise: exerciseScore,
      sleep: sleepScore,
      consistency: consistencyScore,
      trends: trendScore,
    },
  };
}

export default function HealthScore({ score, lastUpdated, breakdown }: HealthScoreProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card flex flex-col items-center">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Health Score</h2>
      <div className="relative">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r="45" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="80"
            cy="80"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
      </div>
      {breakdown && (
        <div className="mt-6 w-full space-y-2">
          {[
            { label: 'Exercise', value: breakdown.exercise, color: '#3B82F6' },
            { label: 'Sleep', value: breakdown.sleep, color: '#10B981' },
            { label: 'Consistency', value: breakdown.consistency, color: '#8B5CF6' },
            { label: 'Trends', value: breakdown.trends, color: '#F59E0B' },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-gray-600">{item.label} (25%)</span>
                <span className="font-medium">{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {lastUpdated && (
        <p className="mt-4 text-xs text-gray-400">Updated {lastUpdated}</p>
      )}
    </div>
  );
}
