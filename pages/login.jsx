import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@acmecloud.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response error. Please verify Vercel environment variables.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('Invalid credentials or missing token');
      }

      login(data.token, data.user, data.organization, data.role);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-md bg-surface-900 text-white font-bold flex items-center justify-center text-lg">
            R
          </div>
          <span className="text-2xl font-bold tracking-tight text-surface-900">Resolve</span>
        </Link>
        <h2 className="text-xl font-bold text-surface-900 tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-xs text-surface-500">
          Enter your credentials or choose a pre-configured demo role below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-surface-200 rounded-lg shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 transition-colors"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-surface-700">
                  Password
                </label>
                <a href="#" className="text-2xs text-surface-500 hover:text-surface-900">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-surface-900 hover:bg-surface-800 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-surface-200">
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
              Quick Demo Accounts (Acme Cloud)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('alex@acmecloud.io')}
                className="px-2 py-1.5 rounded bg-surface-100 hover:bg-surface-200 text-2xs text-surface-800 font-medium text-center border border-surface-200"
              >
                Owner (Alex)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('sarah@acmecloud.io')}
                className="px-2 py-1.5 rounded bg-surface-100 hover:bg-surface-200 text-2xs text-surface-800 font-medium text-center border border-surface-200"
              >
                Agent (Sarah)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('david@acmecloud.io')}
                className="px-2 py-1.5 rounded bg-surface-100 hover:bg-surface-200 text-2xs text-surface-800 font-medium text-center border border-surface-200"
              >
                Viewer (David)
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-surface-600">
          Don't have a workspace yet?{' '}
          <Link href="/signup" className="font-semibold text-surface-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
