import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { destinationService } from '../services/api';
import styles from './Destinations.module.css';

const CATEGORIES = ['All', 'Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Historical', 'Mountain', 'Desert'];

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expanded, setExpanded]         = useState(null);

  useEffect(() => {
    destinationService.getAll()
      .then((res) => setDestinations(res.data.destinations || res.data || []))
      .catch(() => setError('Failed to load destinations. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? destinations
    : destinations.filter((d) => d.category === activeCategory);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <p className={styles.heroEyebrow}><i className="fas fa-globe-americas" /> Explore the World</p>
          <h1 className={styles.heroTitle}>Discover Destinations</h1>
          <p className={styles.heroSub}>
            Immerse yourself in the world's most extraordinary places — rich in culture, history, and natural wonder.
          </p>
        </div>
        <div className={styles.heroCurve} />
      </section>

      {/* ── Category Filters ── */}
      <section className={styles.filterSection}>
        <div className={`container ${styles.filterBar}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Cards ── */}
      <section className={styles.cardsSection}>
        <div className="container">
          {loading && (
            <div className={styles.stateBox}>
              <span className="spinner spinner-dark" /> Loading destinations…
            </div>
          )}
          {error && !loading && (
            <div className="alert alert-error" style={{ textAlign: 'center' }}>
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className={styles.stateBox}>
              <i className="fas fa-map-pin" style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }} />
              <p>No destinations in this category yet.</p>
            </div>
          )}

          <div className={styles.grid}>
            {filtered.map((d) => {
              const isOpen = expanded === d._id;
              return (
                <div key={d._id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>

                  {/* Image */}
                  <div className={styles.cardImg}>
                    {d.image
                      ? <img src={d.image} alt={d.name} onError={(e) => e.target.style.display='none'} />
                      : <div className={styles.cardImgPlaceholder}><i className="fas fa-mountain" /></div>}
                    <span className={styles.categoryBadge}>{d.category}</span>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardLocation}>
                      <i className="fas fa-map-marker-alt" />
                      {[d.city, d.country].filter(Boolean).join(', ') || 'Unknown'}
                    </div>
                    <h3 className={styles.cardName}>{d.name}</h3>
                    {d.tagline && <p className={styles.cardTagline}>{d.tagline}</p>}
                    <p className={styles.cardDesc}>{d.description}</p>

                    {/* Highlights */}
                    {(d.highlights || []).length > 0 && (
                      <ul className={styles.highlights}>
                        {d.highlights.map((h, i) => (
                          <li key={i}><i className="fas fa-check" /> {h}</li>
                        ))}
                      </ul>
                    )}

                    {/* Expanded: cultural info + meta */}
                    {isOpen && (
                      <div className={styles.expandedZone}>
                        {d.culturalInfo && (
                          <div className={styles.culturalBox}>
                            <h4><i className="fas fa-landmark" /> Cultural &amp; Historical Info</h4>
                            <p>{d.culturalInfo}</p>
                          </div>
                        )}
                        <div className={styles.metaRow}>
                          {d.bestTime && (
                            <div className={styles.metaItem}>
                              <i className="fas fa-calendar-alt" />
                              <div>
                                <span className={styles.metaLabel}>Best Time to Visit</span>
                                <span className={styles.metaValue}>{d.bestTime}</span>
                              </div>
                            </div>
                          )}
                          {d.avgCost && (
                            <div className={styles.metaItem}>
                              <i className="fas fa-wallet" />
                              <div>
                                <span className={styles.metaLabel}>Average Cost</span>
                                <span className={styles.metaValue}>{d.avgCost}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <button
                        className={styles.learnBtn}
                        onClick={() => toggle(d._id)}
                      >
                        {isOpen ? <><i className="fas fa-chevron-up" /> Show Less</> : <><i className="fas fa-info-circle" /> Learn More</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className="container">
          <h2>Ready to Start Your Adventure?</h2>
          <p>Tell us your dream destination and we'll craft the perfect journey for you.</p>
          <div className={styles.ctaButtons}>
            <Link to="/booking" className="btn btn-primary">Book a Tour</Link>
            <Link to="/packages" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>View Packages</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Destinations;
