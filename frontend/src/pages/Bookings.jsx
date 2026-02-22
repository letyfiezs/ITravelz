import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService, packageService } from '../services/api';
import styles from './Bookings.module.css';

const STATUS_CFG = {
  approved:   { bg: '#10b981', label: 'Approved',   icon: 'fa-check-circle'      },
  pending:    { bg: '#f59e0b', label: 'Pending',    icon: 'fa-clock'             },
  cancelled:  { bg: '#ef4444', label: 'Cancelled',  icon: 'fa-times-circle'      },
  completed:  { bg: '#6366f1', label: 'Completed',  icon: 'fa-flag-checkered'    },
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pkgMap, setPkgMap]     = useState({});   // serviceName â†’ { image, destination }
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      bookingService.getAll(),
      packageService.getAll(),
    ])
      .then(([bRes, pRes]) => {
        const bList = bRes.data.data || bRes.data.bookings || bRes.data || [];
        const pList = pRes.data.packages || pRes.data.data || pRes.data || [];
        // Build lookup: package name (lowercase) â†’ { image, destination }
        const map = {};
        pList.forEach((p) => { if (p.name) map[p.name.toLowerCase()] = { image: p.image, destination: p.destination }; });
        setBookings(bList);
        setPkgMap(map);
      })
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'â€”';
  const fmtTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':');
    if (!h) return t;
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const getPkg = (name) => pkgMap[(name || '').toLowerCase()] || {};

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Bookings</h1>
            <p className={styles.subtitle}>Manage all your travel reservations</p>
          </div>
          <Link to="/booking" className="btn btn-primary">
            <i className="fas fa-plus" /> New Booking
          </Link>
        </div>

        {loading && <div className="page-loader" style={{ minHeight: 300 }}><span className="spinner spinner-dark" /> Loading bookings...</div>}
        {error   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-suitcase-rolling" />
            <h3>No bookings yet</h3>
            <p>Start planning your first adventure!</p>
            <Link to="/booking" className="btn btn-primary">Book a Tour</Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className={styles.list}>
            {bookings.map((b) => {
              const cfg = STATUS_CFG[b.status] || STATUS_CFG.pending;
              const pkg = getPkg(b.serviceName || b.packageName);
              const img = pkg.image || FALLBACK_IMG;

              return (
                <div key={b._id} className={styles.card}>

                  {/* Package image */}
                  <div className={styles.cardImg}>
                    <img
                      src={img}
                      alt={b.serviceName || 'Tour'}
                      onError={(e) => { e.target.src = FALLBACK_IMG; }}
                    />
                    <div className={styles.cardImgOverlay} />
                    {/* status badge overlaid on image */}
                    <span
                      className={styles.statusBadge}
                      style={{ background: cfg.bg }}
                    >
                      <i className={`fas ${cfg.icon}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div>
                        <h3 className={styles.cardTitle}>{b.serviceName || b.packageName || 'Tour Package'}</h3>
                        {(pkg.destination) && (
                          <p className={styles.cardDest}><i className="fas fa-map-marker-alt" /> {pkg.destination}</p>
                        )}
                        {b.bookingId && <p className={styles.bookingId}># {b.bookingId}</p>}
                      </div>
                      <div className={styles.priceTag}>
                        {(b.totalPrice || b.price) ? (
                          <><span className={styles.priceFrom}>Total</span><span className={styles.price}>${Number(b.totalPrice || b.price).toLocaleString()}</span></>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <i className="fas fa-calendar-alt" />
                        <div>
                          <span className={styles.metaLabel}>Travel Date</span>
                          <span className={styles.metaValue}>{fmt(b.bookingDate || b.travelDate)}</span>
                        </div>
                      </div>
                      {b.bookingTime && (
                        <div className={styles.metaItem}>
                          <i className="fas fa-clock" />
                          <div>
                            <span className={styles.metaLabel}>Time</span>
                            <span className={styles.metaValue}>{fmtTime(b.bookingTime)}</span>
                          </div>
                        </div>
                      )}
                      <div className={styles.metaItem}>
                        <i className="fas fa-users" />
                        <div>
                          <span className={styles.metaLabel}>Guests</span>
                          <span className={styles.metaValue}>{b.numberOfPeople || b.numberOfGuests || 1} {(b.numberOfPeople || b.numberOfGuests || 1) === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>
                      {b.duration && (
                        <div className={styles.metaItem}>
                          <i className="fas fa-hourglass-half" />
                          <div>
                            <span className={styles.metaLabel}>Duration</span>
                            <span className={styles.metaValue}>{b.duration}</span>
                          </div>
                        </div>
                      )}
                      <div className={styles.metaItem}>
                        <i className="fas fa-calendar-plus" />
                        <div>
                          <span className={styles.metaLabel}>Booked On</span>
                          <span className={styles.metaValue}>{fmt(b.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {(b.notes || b.specialRequests) && (
                      <p className={styles.notes}><i className="fas fa-sticky-note" /> {b.notes || b.specialRequests}</p>
                    )}
                  </div>

                  {/* Cancel action */}
                  {(b.status === 'pending' || b.status === 'approved') && (
                    <div className={styles.cardActions}>
                      <button className={styles.cancelBtn} onClick={() => handleCancel(b._id)}>
                        <i className="fas fa-times" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
