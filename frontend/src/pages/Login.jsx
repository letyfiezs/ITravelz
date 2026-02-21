import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';
import { useLanguage } from '../hooks/useContext';
import styles from './Auth.module.css';

const Login = () => {
  const { t } = useLanguage();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password:'' });
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      await login(formData.email, formData.password);
      if (remember) {
        localStorage.setItem('rememberEmail', formData.email);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.authHeader}>
          <h2>{t('login_title')}</h2>
          <p>{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.errorMessage}>{formError}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email">{t('login_email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">{t('login_password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.rememberForgot}>
            <label className={styles.rememberCheck}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>{t('login_remember') || 'Remember me'}</span>
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              {t('login_forgot') || 'Forgot password?'}
            </Link>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : t('login_button')}
          </button>
        </form>

        <div className={styles.divider}></div>

        <p className={styles.authFooter}>
          {t('login_signup') || "Don't have an account?"}
          <Link to="/signup"> Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
