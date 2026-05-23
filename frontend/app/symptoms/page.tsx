'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import SymptomChecker from '@/components/SymptomChecker';
import { getSymptomHistory } from '@/lib/api';
import { AIRecommendationResponse, SymptomRecord } from '@/lib/types';

export default function SymptomsPage() {
  const [history, setHistory] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSymptomHistory()
      .then((res) => setHistory(res.history))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = () => {
    getSymptomHistory().then((res) => setHistory(res.history)).catch(console.error);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Symptom Checker</h1>
            <p className="text-gray-600">
              Describe your symptoms for AI-powered wellness recommendations. This is not a medical diagnosis.
            </p>
          </div>

          <SymptomChecker onComplete={handleComplete} />

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Check History</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-500">No previous checks. Your results are saved automatically.</p>
            ) : (
              <div className="space-y-4">
                {history.map((record) => {
                  const ai = record.ai_recommendations as AIRecommendationResponse;
                  return (
                    <div key={record.id} className="card">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.symptoms_description}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(record.created_at).toLocaleString()} · Age {record.age}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          record.severity === 'high' ? 'bg-red-100 text-red-800' :
                          record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>{record.severity}</span>
                      </div>
                      {ai?.recommendations?.[0] && (
                        <p className="mt-3 text-sm text-gray-600">{ai.recommendations[0]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
