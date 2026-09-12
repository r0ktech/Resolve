import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      login(data.token, data.user, data.organization, data.role);
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          Create your business workspace
        </h2>
        <p className="mt-1 text-xs text-surface-500">
          Set up an AI-powered customer support agent for your company.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 transition-colors"
                placeholder="Alex Rivera"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 transition-colors"
                placeholder="Acme Technologies"
              />
            </div>

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
                placeholder="alex@acme.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
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
              {loading ? 'Creating workspace...' : 'Start building'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-surface-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-surface-900 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
