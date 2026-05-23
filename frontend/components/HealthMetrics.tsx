'use client';

import { Activity, Moon, Scale } from 'lucide-react';
import { MetricsResponse } from '@/lib/types';

interface HealthMetricsProps {
  data: MetricsResponse;
}

export default function HealthMetrics({ data }: HealthMetricsProps) {
  const { averages, metrics } = data;

  const stats = [
    {
      label: 'Avg Weight',
      value: averages.weight ? `${averages.weight} kg` : '—',
      icon: Scale,
      color: 'text-brand-blue',
      bg: 'bg-blue-50',
    },
    {
      label: 'Avg Sleep',
      value: averages.sleep_hours ? `${averages.sleep_hours} hrs` : '—',
      icon: Moon,
      color: 'text-brand-green',
      bg: 'bg-green-50',
    },
    {
      label: 'Avg Exercise',
      value: averages.exercise_minutes ? `${Math.round(averages.exercise_minutes)} min` : '—',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Days Logged',
      value: String(metrics.length),
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card flex items-center gap-4">
          <div className={`rounded-lg p-3 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
