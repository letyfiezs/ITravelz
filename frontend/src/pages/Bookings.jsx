import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import styles from './Bookings.module.css';

const STATUS_COLORS = {
  confirmed:  'badge-success',
  pending:    'badge-accent',
  cancelled:  'badge-error',
  completed:  'badge-primary',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    bookingService.getAll()
      .then((res) => setBookings(res.data.bookings || res.data || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancel(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('Could not cancel booking. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Bookings</h1>
            <p className={styles.subtitle}>Manage all your travel reservations</p>
          </div>
          <Link to="/booking/new" className="btn btn-primary">
            <i className="fas fa-plus" /> New Booking
          </Link>
        </div>

        {loading && <div className="page-loader" style={{ minHeight: 300 }}><span className="spinner spinner-dark" />Loading bookings...</div>}
        {error   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-suitcase-rolling" />
            <h3>No bookings yet</h3>
            <p>Start planning your first adventure!</p>
            <Link to="/booking/new" className="btn btn-primary">Book a Tour</Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className={styles.list}>
            {bookings.map((b) => (
              <div key={b._id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <span className={`badge ${STATUS_COLORS[b.status] || 'badge-primary'}`}>{b.status}</span>
                  <h3 className={styles.cardTitle}>{b.packageName || 'Tour Package'}</h3>
                  <div className={styles.meta}>
                    <span><i className="fas fa-calendar" /> {new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span><i className="fas fa-users" /> {b.numberOfGuests} guest{b.numberOfGuests !== 1 ? 's' : ''}</span>
                    {b.totalPrice && <span><i className="fas fa-tag" /> ${b.totalPrice.toLocaleString()}</span>}
                  </div>
                  {b.specialRequests && <p className={styles.notes}><i className="fas fa-sticky-note" /> {b.specialRequests}</p>}
                </div>
                <div className={styles.cardActions}>
                  {b.status === 'pending' || b.status === 'confirmed' ? (
                    <button className="btn btn-outline btn-sm" onClick={() => handleCancel(b._id)} style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                      <i className="fas fa-times" /> Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
