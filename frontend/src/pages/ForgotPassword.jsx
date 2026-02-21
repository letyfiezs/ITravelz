import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await authService.forgotPassword({ email });
      setStatus('success');
      setMsg('Check your inbox! Password reset instructions have been sent to ' + email);
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
          <h2>Reset your password</h2>
          <p>Enter your email address and we will send you a link to reset your password securely.</p>
        </div>
        <div className={styles.authLeftOverlay} />
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Forgot password?</h1>
            <p>We will email you a reset link</p>
          </div>

          {status === 'success' && (
            <div className="alert alert-success"><i className="fas fa-check-circle" />{msg}</div>
          )}
          {status === 'error' && (
            <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{msg}</div>
          )}

          {status !== 'success' && (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className="form-group">
                <label>Email address</label>
                <div className={styles.inputWrap}>
                  <i className="fas fa-envelope" />
                  <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={status === 'loading'}>
                {status === 'loading' ? <><span className="spinner" /> Sending...</> : <>Send Reset Link <i className="fas fa-arrow-right" /></>}
              </button>
            </form>
          )}

          <p className={styles.switchText}>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
