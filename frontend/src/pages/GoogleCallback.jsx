import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';

/**
 * Landing page for the Google OAuth redirect.
 * URL: /auth/google/callback?token=JWT&user=BASE64_JSON
 * Reads the token + user from query params, stores them, and redirects home.
 */
export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const raw   = params.get('user');
    const error = params.get('error');

    if (error || !token || !raw) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(atob(raw));
      loginWithToken(token, user);
      navigate('/', { replace: true });
    } catch {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
      <p style={{ color: 'var(--text-secondary)' }}>Signing you in with Google…</p>
    </div>
  );
}
