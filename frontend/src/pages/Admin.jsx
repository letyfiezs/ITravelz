import React, { useState } from 'react';
import { useLanguage } from '../hooks/useContext';
import styles from './Admin.module.css';

const Admin = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSidebar}>
        <h2>Admin Panel</h2>
        <nav className={styles.adminNav}>
          <button
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'packages' ? styles.active : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <i className="fas fa-box"></i> Packages
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar"></i> Bookings
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i> Users
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'content' ? styles.active : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <i className="fas fa-file-alt"></i> Content
          </button>
        </nav>
      </div>

      <div className={styles.adminContent}>
        {activeTab === 'dashboard' && (
          <div className={styles.section}>
            <h2>Dashboard</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <i className="fas fa-users"></i>
                <h3>Total Users</h3>
                <p className={styles.statValue}>1,234</p>
              </div>
              <div className={styles.statCard}>
                <i className="fas fa-calendar"></i>
                <h3>Total Bookings</h3>
                <p className={styles.statValue}>567</p>
              </div>
              <div className={styles.statCard}>
                <i className="fas fa-dollar-sign"></i>
                <h3>Revenue</h3>
                <p className={styles.statValue}>$45,678</p>
              </div>
              <div className={styles.statCard}>
                <i className="fas fa-star"></i>
                <h3>Average Rating</h3>
                <p className={styles.statValue}>4.8/5</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className={styles.section}>
            <h2>Packages</h2>
            <p>Manage travel packages here.</p>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className={styles.section}>
            <h2>Bookings</h2>
            <p>View and manage all bookings.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.section}>
            <h2>Users</h2>
            <p>Manage user accounts and permissions.</p>
          </div>
        )}

        {activeTab === 'content' && (
          <div className={styles.section}>
            <h2>Content Management</h2>
            <p>Edit website content and pages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
