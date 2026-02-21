import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services/api';
import styles from './Auth.module.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    authService.verifyEmail(token)
      .then(() => { setStatus('success'); setMsg('Your email has been verified! You can now sign in.'); })
      .catch((err) => { setStatus('error'); setMsg(err.response?.data?.message || 'Verification link is invalid or expired.'); });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {status === 'loading' && (
          <><div className="page-loader" style={{ minHeight: 'auto' }}><span className="spinner spinner-dark" />Verifying your email...</div></>
        )}
        {status === 'success' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 32, color: 'var(--success)' }}>
              <i className="fas fa-check-circle" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--text-dark)' }}>Email Verified!</h1>
            <p style={{ color: 'var(--text-body)' }}>{msg}</p>
            <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Sign In Now <i className="fas fa-arrow-right" /></Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 32, color: 'var(--error)' }}>
              <i className="fas fa-times-circle" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--text-dark)' }}>Verification Failed</h1>
            <p style={{ color: 'var(--text-body)' }}>{msg}</p>
            <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }}>Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
