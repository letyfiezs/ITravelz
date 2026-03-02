import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { destinationService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import ImageSlideshow from '../components/ImageSlideshow/ImageSlideshow';
import styles from './Destinations.module.css';

const CATEGORIES = ['All', 'Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Historical', 'Mountain', 'Desert'];

/* ── Google Maps helpers ── */
const isGoogleMapsUrl  = (loc) => loc && (loc.includes('google.com/maps') || loc.includes('maps.google') || loc.includes('goo.gl/maps'));
const isIframeEmbed    = (loc) => loc && loc.trim().startsWith('<iframe');
const makeEmbedUrl     = (url) => {
  // Already an embed URL
  if (url.includes('/maps/embed') || url.includes('output=embed')) return url;
  if (url.includes('google.com/maps/place')) {
    const q = url.replace('https://www.google.com/maps/place/', '').split('/')[0];
    return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(q))}&output=embed`;
  }
  return url.replace('/maps?', '/maps/embed?').replace('/maps/', '/maps/embed/');
};

/* ── Read More Modal ── */
const ReadMoreModal = ({ dest, onClose }) => {
  const { language } = useLanguage();
  const tr = (key) => dest.translations?.[language]?.[key] || dest[key] || '';
  const images = (dest.images && dest.images.length > 0) ? dest.images : (dest.image ? [dest.image] : []);
  const loc = dest.location || '';

  const handleBackdrop = useCallback((e) => { if (e.target === e.currentTarget) onClose(); }, [onClose]);

  return (
    <div className={styles.rmBackdrop} onClick={handleBackdrop}>
      <div className={styles.rmContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.rmClose} onClick={onClose}><i className="fas fa-times" /></button>

        {/* Image gallery */}
        {images.length > 0 && (
          <div className={styles.rmImgWrap}>
            <ImageSlideshow images={images} fallback={dest.image} alt={dest.name} interval={5000} className={styles.rmSlideshow} />
          </div>
        )}

        <div className={styles.rmBody}>
          {/* Category + title */}
          <div className={styles.rmHeader}>
            <span className={styles.rmBadge}>{dest.category}</span>
            <h2 className={styles.rmTitle}>{tr('name')}</h2>
            {dest.tagline && <p className={styles.rmTagline}>{tr('tagline')}</p>}
          </div>

          {/* Location */}
          {loc && (
            <div className={styles.rmLocation}>
              <i className="fas fa-map-marker-alt" />
              {isIframeEmbed(loc) ? (
                <span>
                  <span className={styles.rmLocText}>{[dest.city, dest.country].filter(Boolean).join(', ')}</span>
                </span>
              ) : isGoogleMapsUrl(loc) ? (
                <a href={loc} target="_blank" rel="noopener noreferrer" className={styles.rmMapLink}>
                  <i className="fab fa-google" /> View on Google Maps
                </a>
              ) : (
                <span className={styles.rmLocText}>{loc}</span>
              )}
            </div>
          )}

          {/* Google Maps embed */}
          {loc && (isGoogleMapsUrl(loc) || isIframeEmbed(loc)) && (
            <div className={styles.rmMapEmbed}>
              {isIframeEmbed(loc) ? (
                <div dangerouslySetInnerHTML={{ __html: loc }} />
              ) : (
                <iframe
                  src={makeEmbedUrl(loc)}
                  title="Map"
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: 12 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          )}

          {/* Description */}
          {dest.description && (
            <div className={styles.rmSection}>
              <p className={styles.rmText}>{tr('description')}</p>
            </div>
          )}

          {/* Read More */}
          {dest.readMore && (
            <div className={styles.rmSection}>
              <h4 className={styles.rmSectionTitle}><i className="fas fa-book-open" /> Details</h4>
              <p className={styles.rmText}>{tr('readMore')}</p>
            </div>
          )}

          {/* Cultural Info */}
          {dest.culturalInfo && (
            <div className={styles.rmSection}>
              <h4 className={styles.rmSectionTitle}><i className="fas fa-landmark" /> Cultural &amp; Historical Info</h4>
              <p className={styles.rmText}>{tr('culturalInfo')}</p>
            </div>
          )}

          {/* Highlights */}
          {(dest.highlights || []).length > 0 && (
            <div className={styles.rmSection}>
              <h4 className={styles.rmSectionTitle}><i className="fas fa-star" /> Highlights</h4>
              <ul className={styles.rmHighlights}>
                {dest.highlights.map((h, i) => (
                  <li key={i}><i className="fas fa-check-circle" /> {h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta */}
          {(dest.bestTime || dest.avgCost) && (
            <div className={styles.rmMeta}>
              {dest.bestTime && (
                <div className={styles.rmMetaItem}>
                  <i className="fas fa-calendar-alt" />
                  <div>
                    <span className={styles.rmMetaLabel}>Best Time to Visit</span>
                    <span className={styles.rmMetaValue}>{dest.bestTime}</span>
                  </div>
                </div>
              )}
              {dest.avgCost && (
                <div className={styles.rmMetaItem}>
                  <i className="fas fa-wallet" />
                  <div>
                    <span className={styles.rmMetaLabel}>Average Cost</span>
                    <span className={styles.rmMetaValue}>{dest.avgCost}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const Destinations = () => {
  const { t, language } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalDest, setModalDest]       = useState(null);
  const [heroContent, setHeroContent]   = useState(null);

  useEffect(() => {
    // Fetch destinations and hero content in parallel
    Promise.all([
      destinationService.getAll(),
      contentService.getAll({ section: 'destinations_hero' }),
    ])
      .then(([destRes, contentRes]) => {
        setDestinations(destRes.data.destinations || destRes.data || []);
        // Pick the most relevant hero for today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const heroes = contentRes.data.content || contentRes.data || [];
        const active = heroes.filter((h) => {
          if (!h.isActive) return false;
          if (!h.validFrom) return true;
          return new Date(h.validFrom) <= today;
        });
        // Server already sorted validFrom desc, so first is the most recent
        if (active.length > 0) setHeroContent(active[0]);
      })
      .catch(() => setError('Failed to load destinations. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalDest) return;
    const handler = (e) => { if (e.key === 'Escape') setModalDest(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalDest]);

  const filtered = activeCategory === 'All'
    ? destinations
    : destinations.filter((d) => d.category === activeCategory);

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section
        className={styles.hero}
        style={heroContent?.imageUrl || heroContent?.image ? {
          backgroundImage: `url(${heroContent.imageUrl || heroContent.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <p className={styles.heroEyebrow}>
            <i className="fas fa-globe-americas" />{' '}
            {heroContent?.eyebrow || t('btn_explore')}
          </p>
          <h1 className={styles.heroTitle}>
            {heroContent?.title || t('page_destinations')}
          </h1>
          <p className={styles.heroSub}>
            {heroContent?.subtitle || heroContent?.text || t('page_dest_sub')}
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
              <span className="spinner spinner-dark" /> {t('loading')}
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
              const images = (d.images && d.images.length > 0) ? d.images : (d.image ? [d.image] : []);
              const locText = d.location && !isGoogleMapsUrl(d.location) && !isIframeEmbed(d.location)
                ? d.location
                : [d.city, d.country].filter(Boolean).join(', ');
              const displayName = d.translations?.[language]?.name || d.name;
              const displayTagline = d.translations?.[language]?.tagline || d.tagline;
              const rawDesc = d.translations?.[language]?.description || d.description || '';
              const desc = rawDesc.length > 110 ? rawDesc.slice(0, 110) + '\u2026' : rawDesc;

              return (
                <div key={d._id} className={styles.card}>
                  {/* Slideshow */}
                  <div className={styles.cardImg}>
                    {images.length > 0 ? (
                      <ImageSlideshow
                        images={images}
                        fallback={d.image}
                        alt={d.name}
                        interval={5000}
                        className={styles.cardSlideshow}
                      />
                    ) : (
                      <div className={styles.cardImgPlaceholder}><i className="fas fa-mountain" /></div>
                    )}
                    <span className={styles.categoryBadge}>{d.category}</span>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardLocation}>
                      <i className="fas fa-map-marker-alt" />
                      {locText || 'Unknown'}
                      {isGoogleMapsUrl(d.location) && (
                        <a href={d.location} target="_blank" rel="noopener noreferrer" className={styles.cardMapLink} onClick={(e) => e.stopPropagation()}>
                          <i className="fab fa-google" />
                        </a>
                      )}
                    </div>
                    <h3 className={styles.cardName}>{displayName}</h3>
                    {displayTagline && <p className={styles.cardTagline}>{displayTagline}</p>}
                    {desc && <p className={styles.cardDesc}>{desc}</p>}

                    <div className={styles.cardFooter}>
                      <button className={styles.learnBtn} onClick={() => setModalDest(d)}>
                        More <i className="fas fa-arrow-right" />
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
          <h2>{t('page_destinations')}</h2>
          <p>{t('page_dest_sub')}</p>
          <div className={styles.ctaButtons}>
            <Link to="/booking" className="btn btn-primary">{t('btn_book_tour')}</Link>
            <Link to="/packages" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>{t('page_packages')}</Link>
          </div>
        </div>
      </section>

      {/* ── Read More Modal ── */}
      {modalDest && <ReadMoreModal dest={modalDest} onClose={() => setModalDest(null)} />}

    </div>
  );
};

export default Destinations;
