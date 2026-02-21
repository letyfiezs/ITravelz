import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <i className="fas fa-map-marked-alt" />
        </div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.desc}>Looks like this destination does not exist on our map. Let us help you find your way back.</p>
        <div className={styles.actions}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Go Back
          </button>
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
