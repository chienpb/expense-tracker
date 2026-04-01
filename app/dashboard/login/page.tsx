'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Wrong password');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Expense Tracker
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tighter text-foreground">
          Sign in
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your password to continue
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            autoFocus
          />
          {error && (
            <p className="text-sm" style={{ color: 'hsl(0 72% 51%)' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-sm bg-foreground text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
