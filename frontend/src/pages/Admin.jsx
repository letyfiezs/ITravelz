import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import styles from './Admin.module.css';

const TABS = ['overview', 'bookings', 'users'];

const Admin = () => {
  const [tab, setTab]         = useState('overview');
  const [stats, setStats]     = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getBookings(),
      adminService.getUsers(),
    ])
      .then(([s, b, u]) => {
        setStats(s.data);
        setBookings(b.data.bookings || b.data || []);
        setUsers(u.data.users || u.data || []);
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
    } catch {
      alert('Update failed.');
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage the ITravelz platform</p>
          </div>
        </div>

        {loading && <div className="page-loader" style={{ minHeight: 300 }}><span className="spinner spinner-dark" />Loading...</div>}
        {error   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{error}</div>}

        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className={styles.tabs}>
              {TABS.map((t) => (
                <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && stats && (
              <div className={styles.statsGrid}>
                {[
                  { icon: 'fa-users',          label: 'Total Users',    val: stats.totalUsers    ?? '—' },
                  { icon: 'fa-calendar-check', label: 'Total Bookings', val: stats.totalBookings ?? '—' },
                  { icon: 'fa-dollar-sign',    label: 'Total Revenue',  val: stats.totalRevenue  ? `$${stats.totalRevenue.toLocaleString()}` : '—' },
                  { icon: 'fa-box-open',       label: 'Packages',       val: stats.totalPackages ?? '—' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className={styles.statCard}>
                    <div className={styles.statIcon}><i className={`fas ${icon}`} /></div>
                    <div><strong>{val}</strong><span>{label}</span></div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings */}
            {tab === 'bookings' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Package</th><th>Date</th><th>Guests</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td>{b.packageName || 'Package'}</td>
                        <td>{new Date(b.travelDate).toLocaleDateString()}</td>
                        <td>{b.numberOfGuests}</td>
                        <td><span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'error' : 'accent'}`}>{b.status}</span></td>
                        <td>
                          <select
                            value={b.status}
                            onChange={(e) => updateStatus(b._id, e.target.value)}
                            className={styles.select}
                          >
                            {['pending','confirmed','completed','cancelled'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-accent'}`}>{u.role}</span></td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
