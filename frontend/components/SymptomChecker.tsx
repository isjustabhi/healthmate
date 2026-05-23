'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getHealthRecommendations } from '@/lib/api';
import { AIRecommendationResponse } from '@/lib/types';
import AIRecommendations from './AIRecommendations';

const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'None',
];

interface SymptomCheckerProps {
  onComplete?: (response: AIRecommendationResponse) => void;
  showSaveButton?: boolean;
  onSave?: (response: AIRecommendationResponse, symptoms: string, age: number, conditions: string[]) => void;
}

export default function SymptomChecker({
  onComplete,
  showSaveButton = false,
  onSave,
}: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState(30);
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<AIRecommendationResponse | null>(null);
  const [timestamp, setTimestamp] = useState('');

  const toggleCondition = (condition: string) => {
    if (condition === 'None') {
      setConditions(['None']);
      return;
    }
    setConditions((prev) => {
      const filtered = prev.filter((c) => c !== 'None');
      if (filtered.includes(condition)) {
        return filtered.filter((c) => c !== condition);
      }
      return [...filtered, condition];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (symptoms.trim().length < 10) {
      setError('Please describe your symptoms in at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const history = conditions.length > 0 ? conditions : ['None'];
      const result = await getHealthRecommendations(symptoms.trim(), age, history);
      setResponse(result);
      setTimestamp(new Date().toLocaleString());
      onComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label htmlFor="symptoms" className="label">
            Describe your symptoms
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={5}
            className="input-field resize-none"
            placeholder="E.g., I've had a mild headache and fatigue for the past two days..."
            required
            minLength={10}
          />
          <p className="mt-1 text-xs text-gray-400">{symptoms.length}/10 characters minimum</p>
        </div>

        <div>
          <label htmlFor="age" className="label">Age</label>
          <select
            id="age"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="input-field"
          >
            {Array.from({ length: 91 }, (_, i) => i + 10).map((a) => (
              <option key={a} value={a}>{a} years</option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Medical conditions</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MEDICAL_CONDITIONS.map((condition) => (
              <label
                key={condition}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                  conditions.includes(condition)
                    ? 'border-brand-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={conditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Check Symptoms'
          )}
        </button>
      </form>

      {response && (
        <div className="card">
          <AIRecommendations response={response} timestamp={timestamp} />
          {showSaveButton && onSave && (
            <button
              type="button"
              onClick={() => onSave(response, symptoms, age, conditions.length ? conditions : ['None'])}
              className="btn-secondary mt-6"
            >
              Save to History
            </button>
          )}
        </div>
      )}
    </div>
  );
}
