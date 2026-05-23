'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HeartPulse, Loader2 } from 'lucide-react';
import { register } from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register(email, password);
      setAuth(token, user);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Health<span className="text-brand-green">Mate</span></span>
          </Link>
        </div>
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="mt-2 text-gray-600">Start tracking your health today</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="confirm" className="label">Confirm Password</label>
              <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Repeat password" required minLength={6} autoComplete="new-password" />
            </div>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Account created! Redirecting...</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating account...</> : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
