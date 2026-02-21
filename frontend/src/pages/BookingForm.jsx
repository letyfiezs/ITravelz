import React, { useState } from 'react';
import { useLanguage } from '../hooks/useContext';
import { useAuth } from '../hooks/useContext';
import { bookingService } from '../services/api';
import styles from './BookingForm.module.css';

const BookingForm = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    packageId: '',
    numberOfGuests: 1,
    travelDate: '',
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await bookingService.create(formData);
      setSuccess(true);
      setFormData({
        packageId: '',
        numberOfGuests: 1,
        travelDate: '',
        specialRequests: '',
      });
      setTimeout(() => {
        window.location.href = '/bookings';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bookingFormContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{t('booking_title')}</h1>
          <p>{t('booking_subtitle')}</p>
        </div>

        {success && (
          <div className={styles.successMessage}>
            <i className="fas fa-check-circle"></i>
            <h3>Booking Created Successfully!</h3>
            <p>Your booking has been confirmed. Redirecting to bookings page...</p>
          </div>
        )}

        {!success && (
          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="packageId">Select Package</label>
                <select
                  id="packageId"
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a package...</option>
                  <option value="1">Caribbean Island Escape - $1,500</option>
                  <option value="2">Alpine Peak Trek - $2,000</option>
                  <option value="3">Ancient Civilizations Tour - $2,500</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="numberOfGuests">Number of Guests</label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    name="numberOfGuests"
                    min="1"
                    max="10"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="travelDate">Travel Date</label>
                  <input
                    type="date"
                    id="travelDate"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or dietary restrictions..."
                  rows="4"
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Summary</label>
                <div className={styles.summary}>
                  <p><strong>Package:</strong> {formData.packageId || 'Pending'}</p>
                  <p><strong>Guests:</strong> {formData.numberOfGuests}</p>
                  <p><strong>Travel Date:</strong> {formData.travelDate || 'Not selected'}</p>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Processing...' : 'Complete Booking'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
