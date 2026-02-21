import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, packageService } from '../services/api';
import styles from './BookingForm.module.css';

const BookingForm = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    packageId: '',
    travelDate: '',
    numberOfGuests: 1,
    specialRequests: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    packageService.getAll()
      .then((res) => setPackages(res.data.packages || res.data || []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await bookingService.create(form);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.header}>
            <span className="section-label">Almost there!</span>
            <h1 className={styles.title}>Book Your Tour</h1>
            <p className={styles.subtitle}>Fill in the details below and our team will confirm your reservation shortly.</p>
          </div>

          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label>Tour Package</label>
              <select className="form-input" value={form.packageId} onChange={set('packageId')} required>
                <option value="">Select a package</option>
                {packages.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} — ${p.price}</option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className="form-group">
                <label>Travel Date</label>
                <input className="form-input" type="date" min={today} value={form.travelDate} onChange={set('travelDate')} required />
              </div>
              <div className="form-group">
                <label>Number of Guests</label>
                <input className="form-input" type="number" min="1" max="20" value={form.numberOfGuests} onChange={set('numberOfGuests')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Special Requests <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="form-input" rows={4} value={form.specialRequests} onChange={set('specialRequests')} placeholder="Dietary requirements, accessibility needs, preferences..." />
            </div>

            <div className={styles.actions}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/bookings')}>
                <i className="fas fa-arrow-left" /> Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Confirming...</> : <><i className="fas fa-check" /> Confirm Booking</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
