import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';
import styles from './Auth.module.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate(from, { replace: true });
    else setError(result.message || 'Invalid email or password');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.authBrand}>
            <span className={styles.brandIcon}><i className="fas fa-paper-plane" /></span>
            <span className={styles.brandText}>I<span>Travelz</span></span>
          </Link>
          <h2>Your next adventure awaits</h2>
          <p>Join thousands of travelers discovering the world with ITravelz. Personalized itineraries, expert guides, and unforgettable experiences.</p>
          <ul className={styles.authFeatures}>
            <li><i className="fas fa-check-circle" /> 120+ handpicked destinations</li>
            <li><i className="fas fa-check-circle" /> Secure and transparent pricing</li>
            <li><i className="fas fa-check-circle" /> 24/7 travel support</li>
          </ul>
        </div>
        <div className={styles.authLeftOverlay} />
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue your journey</p>
          </div>
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{error}</div>}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label>Email address</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-envelope" />
                <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </div>
            </div>
            <div className="form-group">
              <label>
                Password
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </label>
              <div className={styles.inputWrap}>
                <i className="fas fa-lock" />
                <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Enter your password" required />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : <>Sign In <i className="fas fa-arrow-right" /></>}
            </button>
          </form>
          <p className={styles.switchText}>
            New to ITravelz? <Link to="/signup">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
