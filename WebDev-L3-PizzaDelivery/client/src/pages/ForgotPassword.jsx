import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl mb-1">Forgot your password?</h1>
      <p className="font-body text-ash mb-8">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <div className="rounded-soft bg-basil/10 text-basil text-sm font-body px-4 py-3">
          If that email is registered, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
          {error && <div role="alert" className="rounded-soft bg-tomato/10 text-tomatodark text-sm px-4 py-3">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-tomato text-semolina rounded-soft py-2.5 font-medium hover:bg-tomatodark transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm font-body text-ash">
        <Link to="/login" className="text-tomato hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
