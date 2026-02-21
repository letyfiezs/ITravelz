import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';
import styles from './Auth.module.css';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.message || 'Registration failed. Please try again.');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.authBrand}>
            <span className={styles.brandIcon}><i className="fas fa-paper-plane" /></span>
            <span className={styles.brandText}>I<span>Travelz</span></span>
          </Link>
          <h2>Start your adventure today</h2>
          <p>Create your free account and unlock access to exclusive deals, curated itineraries, and a world of possibilities.</p>
          <ul className={styles.authFeatures}>
            <li><i className="fas fa-check-circle" /> Free to join, no credit card needed</li>
            <li><i className="fas fa-check-circle" /> Exclusive member-only deals</li>
            <li><i className="fas fa-check-circle" /> Personalized travel recommendations</li>
          </ul>
        </div>
        <div className={styles.authLeftOverlay} />
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Create account</h1>
            <p>Join ITravelz and explore the world your way</p>
          </div>
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{error}</div>}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label>Full name</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-user" />
                <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="John Doe" required />
              </div>
            </div>
            <div className="form-group">
              <label>Email address</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-envelope" />
                <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-lock" />
                <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-lock" />
                <input className="form-input" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" required />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account...</> : <>Create Account <i className="fas fa-arrow-right" /></>}
            </button>
          </form>
          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
