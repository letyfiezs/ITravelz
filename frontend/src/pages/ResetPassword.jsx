import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import styles from './Auth.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setStatus('error'); setMsg('Passwords do not match.'); return; }
    if (form.password.length < 6) { setStatus('error'); setMsg('Password must be at least 6 characters.'); return; }
    setStatus('loading');
    try {
      await authService.resetPassword(token, { password: form.password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Reset link is invalid or expired.');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.authBrand}>
            <span className={styles.brandIcon}><i className="fas fa-paper-plane" /></span>
            <span className={styles.brandText}>I<span>Travelz</span></span>
          </Link>
          <h2>Create a new password</h2>
          <p>Choose a strong password to keep your ITravelz account secure.</p>
        </div>
        <div className={styles.authLeftOverlay} />
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Reset password</h1>
            <p>Enter your new password below</p>
          </div>
          {status === 'success' && (
            <div className="alert alert-success"><i className="fas fa-check-circle" />Password reset! Redirecting to login...</div>
          )}
          {status === 'error' && (
            <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{msg}</div>
          )}
          {status !== 'success' && (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className="form-group">
                <label>New password</label>
                <div className={styles.inputWrap}>
                  <i className="fas fa-lock" />
                  <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm new password</label>
                <div className={styles.inputWrap}>
                  <i className="fas fa-lock" />
                  <input className="form-input" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat new password" required />
                </div>
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={status === 'loading'}>
                {status === 'loading' ? <><span className="spinner" /> Resetting...</> : <>Set New Password <i className="fas fa-arrow-right" /></>}
              </button>
            </form>
          )}
          <p className={styles.switchText}><Link to="/login">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
