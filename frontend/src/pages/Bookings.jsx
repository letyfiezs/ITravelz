import React, { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useContext';
import { bookingService } from '../services/api';
import styles from './Bookings.module.css';

const Bookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancel(bookingId);
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.container}>
        <h1>{t('user_bookings')}</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>
            <div className="loading"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-calendar-times"></i>
            <h3>No Bookings Yet</h3>
            <p>You haven't made any bookings yet. Start your adventure today!</p>
            <a href="/booking/new" className={styles.ctaButton}>
              Book Now
            </a>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <h3>{booking.packageName}</h3>
                  <span className={`${styles.status} ${styles[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Booking Date:</span>
                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Travel Date:</span>
                    <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Guests:</span>
                    <span>{booking.numberOfGuests}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Total Price:</span>
                    <span className={styles.price}>${booking.totalPrice}</span>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  <button className={styles.viewBtn}>View Details</button>
                  {booking.status === 'pending' && (
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
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
