import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const passwordStrong = form.password.length >= 8;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!passwordStrong) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Check your inbox</h1>
        <p className="font-body text-ash">
          We've sent a verification link to <strong className="text-char">{form.email}</strong>. Click it to
          activate your account, then come back and log in.
        </p>
        <Link to="/login" className="inline-block mt-6 text-tomato font-body hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl mb-1">Create your account</h1>
      <p className="font-body text-ash mb-8">Join Forno and start building your perfect pizza.</p>

      {error && (
        <div role="alert" className="mb-5 rounded-soft bg-tomato/10 text-tomatodark text-sm font-body px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
          <p className={`text-xs mt-1 ${passwordStrong || !form.password ? 'text-ash' : 'text-tomatodark'}`}>
            At least 8 characters
          </p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-tomato text-semolina rounded-soft py-2.5 font-medium hover:bg-tomatodark transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm font-body text-ash">
        Already have an account? <Link to="/login" className="text-tomato hover:underline">Log in</Link>
      </p>
    </div>
  );
}
