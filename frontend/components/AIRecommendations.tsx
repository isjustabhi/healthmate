'use client';

import { AlertTriangle, Heart, Lightbulb, Stethoscope } from 'lucide-react';
import { AIRecommendationResponse } from '@/lib/types';

interface AIRecommendationsProps {
  response: AIRecommendationResponse;
  timestamp?: string;
}

const severityConfig = {
  low: { label: 'Low', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  medium: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  high: { label: 'High', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

export default function AIRecommendations({ response, timestamp }: AIRecommendationsProps) {
  const severity = severityConfig[response.severity] || severityConfig.low;

  return (
    <div className="animate-fade-in space-y-6">
      <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${severity.bg} ${severity.text} ${severity.border}`}>
        <Heart className="h-4 w-4" />
        <span className="font-semibold">Severity: {severity.label}</span>
      </div>

      {response.shouldSeeMD && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">See a Doctor</p>
            <p className="mt-1 text-sm text-red-700">
              Based on your symptoms, we recommend consulting a healthcare professional as soon as possible.
            </p>
          </div>
        </div>
      )}

      {response.severity === 'high' && !response.shouldSeeMD && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <p className="text-sm text-orange-800">
            Your symptoms may require medical attention. Please consult a doctor if symptoms persist or worsen.
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Lightbulb className="h-5 w-5 text-brand-blue" />
          Recommendations
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {response.recommendations.map((rec, i) => (
            <div key={i} className="card border-l-4 border-l-brand-blue py-4">
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Health Tips</h3>
        <ul className="space-y-2">
          {response.healthTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {timestamp && (
        <p className="text-xs text-gray-400">Checked at {timestamp}</p>
      )}
    </div>
  );
}
