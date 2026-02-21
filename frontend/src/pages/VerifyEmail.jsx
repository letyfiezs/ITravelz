import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useContext';
import { authService } from '../services/api';
import styles from './Auth.module.css';

const VerifyEmail = () => {
  const { t } = useLanguage();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.authHeader}>
          <h2>Email Verification</h2>
        </div>

        {loading ? (
          <div className={styles.loadingMessage}>
            <div className="loading"></div>
            <p>Verifying your email...</p>
          </div>
        ) : success ? (
          <div className={styles.successMessage}>
            <i className="fas fa-check-circle"></i>
            <h3>Email Verified!</h3>
            <p>Your email has been successfully verified. You can now log in to your account.</p>
            <Link to="/login" className={styles.submitBtn}>
              Go to Login
            </Link>
          </div>
        ) : (
          <div className={styles.errorMessageBox}>
            <i className="fas fa-exclamation-circle"></i>
            <h3>Verification Failed</h3>
            <p>{error}</p>
            <Link to="/signup" className={styles.submitBtn}>
              Sign Up Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
