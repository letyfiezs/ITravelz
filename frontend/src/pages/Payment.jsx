import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import styles from './Payment.module.css';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setFetchError('Ð‘ÑƒÑ€ÑƒÑƒ Ñ…Ð¾Ð»Ð±Ð¾Ð¾Ñ. Booking ID Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹.');
      setLoading(false);
      return;
    }
    bookingService
      .getByRef(bookingId)
      .then((res) => {
        const b = res.data.data;
        if (b.status !== 'approved') {
          setFetchError('Ð­Ð½Ñ Ð·Ð°Ñ…Ð¸Ð°Ð»Ð³Ð° Ñ‚Ó©Ð»Ð±Ó©Ñ€ Ñ‚Ó©Ð»Ó©Ñ… Ð±Ð¾Ð»Ð¾Ð¼Ð¶Ð³Ò¯Ð¹. (Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: ' + b.status + ')');
        } else if (b.paymentStatus === 'paid') {
          setFetchError('Ð­Ð½Ñ Ð·Ð°Ñ…Ð¸Ð°Ð»Ð³Ñ‹Ð½ Ñ‚Ó©Ð»Ð±Ó©Ñ€ Ð°Ð»ÑŒ Ñ…ÑÐ´Ð¸Ð¹Ð½ Ñ‚Ó©Ð»Ó©Ð³Ð´ÑÓ©Ð½ Ð±Ð°Ð¹Ð½Ð°.');
        }
        setBooking(b);
      })
      .catch(() => setFetchError('Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ð° Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹. Ð¥Ð¾Ð»Ð±Ð¾Ð¾Ñ Ð±ÑƒÑ€ÑƒÑƒ Ð±Ð°Ð¹Ð¶ Ð±Ð¾Ð»Ð·Ð¾ÑˆÐ³Ò¯Ð¹.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPayError('');
    setRedirecting(true);
    try {
      const res = await bookingService.createCheckoutSession({ bookingId });
      window.location.href = res.data.url; // redirect to Stripe hosted checkout
    } catch (err) {
      setPayError(err.response?.data?.message || 'ÐÐ»Ð´Ð°Ð° Ð³Ð°Ñ€Ð»Ð°Ð°. Ð”Ð°Ñ…Ð¸Ð½ Ð¾Ñ€Ð¾Ð»Ð´Ð¾Ð½Ð¾ ÑƒÑƒ.');
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ð° ÑƒÐ½ÑˆÐ¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>âš ï¸</div>
          <p className={styles.errorMsg}>{fetchError}</p>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            ÐÒ¯Ò¯Ñ€ Ñ…ÑƒÑƒÐ´Ð°Ñ
          </button>
        </div>
      </div>
    );
  }

  const amount =
    booking.totalPrice ||
    booking.price * booking.numberOfPeople ||
    booking.price ||
    0;

  const travelDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'â€”';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>âœˆï¸ ÐÑÐ»Ð°Ð» Ð‘Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶ÑƒÑƒÐ»Ð°Ñ…</h1>
        <p className={styles.subtitle}>
          Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ð°Ð° Ð±Ð°Ñ‚Ð°Ð»Ð³Ð°Ð°Ð¶ÑƒÑƒÐ»Ð°Ñ…Ñ‹Ð½ Ñ‚ÑƒÐ»Ð´ Ð´Ð¾Ð¾Ñ€Ñ… Ñ‚Ð¾Ð²Ñ‡Ð¸Ð¹Ð³ Ð´Ð°Ñ€Ð¶ Ñ‚Ó©Ð»Ð±Ó©Ñ€ Ñ…Ð¸Ð¹Ð½Ñ Ò¯Ò¯.
        </p>

        {/* Booking summary */}
        <div className={styles.summary}>
          <h3 className={styles.sectionLabel}>Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ñ‹Ð½ Ð¼ÑÐ´ÑÑÐ»ÑÐ»</h3>
          <div className={styles.row}>
            <span>Ð—Ð°Ñ…Ð¸Ð°Ð»Ð³Ñ‹Ð½ Ð´ÑƒÐ³Ð°Ð°Ñ€</span><strong>{booking.bookingId}</strong>
          </div>
          <div className={styles.row}>
            <span>Ð‘Ð°Ð³Ñ† / ÐÑÐ»Ð°Ð»</span><strong>{booking.serviceName}</strong>
          </div>
          <div className={styles.row}>
            <span>ÐžÐ³Ð½Ð¾Ð¾</span><strong>{travelDate}</strong>
          </div>
          {booking.bookingTime && (
            <div className={styles.row}>
              <span>Ð¦Ð°Ð³</span><strong>{booking.bookingTime}</strong>
            </div>
          )}
          <div className={styles.row}>
            <span>Ð¥Ò¯Ð½Ð¸Ð¹ Ñ‚Ð¾Ð¾</span><strong>{booking.numberOfPeople}</strong>
          </div>
          {booking.duration && booking.duration !== 'N/A' && (
            <div className={styles.row}>
              <span>Ð¥ÑƒÐ³Ð°Ñ†Ð°Ð°</span><strong>{booking.duration}</strong>
            </div>
          )}
          {amount > 0 && (
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>ÐÐ¸Ð¹Ñ‚ Ð´Ò¯Ð½</span>
              <strong className={styles.amount}>${amount.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {payError && <p className={styles.payError}>{payError}</p>}

        <button
          className={styles.payBtn}
          onClick={handlePay}
          disabled={redirecting}
        >
          {redirecting ? 'Stripe Ñ€Ò¯Ò¯ ÑˆÐ¸Ð»Ð¶Ð¸Ð¶ Ð±Ð°Ð¹Ð½Ð°...' : `ðŸ’³ $${amount.toLocaleString()} â€” Stripe-ÑÑÑ€ Ñ‚Ó©Ð»Ó©Ñ…`}
        </button>

        <p className={styles.stripeNote}>
          ðŸ”’ Ð¢Ð° Stripe-Ð¸Ð¹Ð½ Ð°ÑŽÑƒÐ»Ð³Ò¯Ð¹ Ñ…ÑƒÑƒÐ´Ð°Ñ Ñ€ÑƒÑƒ ÑˆÐ¸Ð»Ð¶Ð¸Ñ… Ð±Ó©Ð³Ó©Ó©Ð´ ÐºÐ°Ñ€Ñ‚Ñ‹Ð½ Ð¼ÑÐ´ÑÑÐ»ÑÐ» ÑÐ½Ñ ÑÐ°Ð¹Ñ‚Ð°Ð´ Ñ…Ð°Ð´Ð³Ð°Ð»Ð°Ð³Ð´Ð°Ñ…Ð³Ò¯Ð¹.
        </p>
      </div>
    </div>
  );
};

export default Payment;
