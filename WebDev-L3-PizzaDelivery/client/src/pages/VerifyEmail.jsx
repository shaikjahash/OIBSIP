import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | already | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('This verification link is missing required information.');
      return;
    }

    api
      .get(`/auth/verify-email`, { params: { token, email } })
      .then(({ data }) => {
        setStatus(data.alreadyVerified ? 'already' : 'success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [params]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      {status === 'loading' && <LoadingSpinner label="Verifying your email…" />}

      {status === 'success' && (
        <>
          <h1 className="font-display text-3xl mb-3">You're verified!</h1>
          <p className="font-body text-ash mb-6">{message}</p>
          <Link to="/login" className="inline-block bg-tomato text-semolina rounded-soft px-5 py-2.5 font-body hover:bg-tomatodark transition-colors">
            Log in
          </Link>
        </>
      )}

      {status === 'already' && (
        <>
          <h1 className="font-display text-3xl mb-3">Already verified</h1>
          <p className="font-body text-ash mb-6">{message}</p>
          <Link to="/login" className="inline-block bg-tomato text-semolina rounded-soft px-5 py-2.5 font-body hover:bg-tomatodark transition-colors">
            Log in
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="font-display text-3xl mb-3">Link expired or invalid</h1>
          <p className="font-body text-ash mb-6">{message}</p>
          <Link to="/register" className="text-tomato font-body hover:underline">
            Request a new verification email
          </Link>
        </>
      )}
    </div>
  );
}
