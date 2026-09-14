import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Invalid reset link</h1>
        <p className="font-body text-ash mb-6">This link is missing required information.</p>
        <Link to="/forgot-password" className="text-tomato font-body hover:underline">Request a new one</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email, password, confirmPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Password updated</h1>
        <p className="font-body text-ash">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl mb-1">Set a new password</h1>
      <p className="font-body text-ash mb-8">For {email}</p>

      {error && <div role="alert" className="mb-5 rounded-soft bg-tomato/10 text-tomatodark text-sm font-body px-4 py-3">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">New password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-tomato text-semolina rounded-soft py-2.5 font-medium hover:bg-tomatodark transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
