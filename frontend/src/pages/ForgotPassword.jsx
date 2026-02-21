import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useContext';
import { authService } from '../services/api';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.authHeader}>
          <h2>Reset Password</h2>
          <p>Enter your email to receive password reset instructions</p>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <i className="fas fa-check-circle"></i>
            <h3>Check your email</h3>
            <p>We've sent password reset instructions to your email address.</p>
            <Link to="/login" className={styles.submitBtn}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className={styles.divider}></div>

        <p className={styles.authFooter}>
          Remember your password?
          <Link to="/login"> Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
