import React, { useState, useEffect, useCallback } from 'react';
import { festivalService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import ImageSlideshow from '../components/ImageSlideshow/ImageSlideshow';
import styles from './Festivals.module.css';

const CATEGORY_ICONS = {
  naadam:     'fas fa-flag',
  culture:    'fas fa-drum',
  religious:  'fas fa-temple',
  winter:     'fas fa-snowflake',
  food:       'fas fa-utensils',
  music:      'fas fa-music',
  other:      'fas fa-star',
};

const BASE = (import.meta?.env?.VITE_API_URL || '').replace('/api', '');

function resolveImages(fest) {
  const arr = fest.images?.length
    ? fest.images
    : fest.image
      ? [fest.image]
      : ['https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=600&q=80'];
  return arr.map(src => (src.startsWith('http') ? src : `${BASE}${src}`));
}

const FALLBACK = [
  {
    _id: 'f1', name: 'Naadam Festival', date: 'July 11–13',
    location: 'Ulaanbaatar', category: 'naadam',
    description: 'The grandest national festival of Mongolia featuring the "Three Games of Men" — wrestling, horse racing, and archery.',
    images: ['https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=600&q=80'],
  },
  {
    _id: 'f2', name: 'Tsagaan Sar', date: 'January / February',
    location: 'Nationwide', category: 'culture',
    description: 'Mongolian Lunar New Year — a time of family reunion, traditional feasts, and the gifting of fermented mare\'s milk.',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
  },
  {
    _id: 'f3', name: 'Eagle Festival', date: 'October',
    location: 'Bayan-Ölgii', category: 'culture',
    description: 'Kazakh eagle hunters showcase centuries-old traditions of falconry in the breathtaking Altai mountains.',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'],
  },
  {
    _id: 'f4', name: 'Ice Festival', date: 'March',
    location: 'Khövsgöl Lake', category: 'winter',
    description: 'Celebrate the frozen Khövsgöl lake with ice sculptures, reindeer sledding, and shamanic ceremonies.',
    images: ['https://images.unsplash.com/photo-1547369093-8a7e27cf5fd6?w=600&q=80'],
  },
];

/* ── Detail Modal ─────────────────────────────────────────── */
function FestivalModal({ fest, onClose, t, language }) {
  const tr = (key) => fest.translations?.[language]?.[key] || fest[key] || '';
  const imgs = resolveImages(fest);

  // Close on backdrop click
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.rmBackdrop} onClick={handleBackdrop}>
      <div className={styles.rmContent}>
        <button className={styles.rmClose} onClick={onClose} aria-label="Close">
          <i className="fas fa-times" />
        </button>

        {/* Slideshow */}
        <div className={styles.rmImgWrap}>
          <ImageSlideshow images={imgs} alt={fest.name} interval={5000} className={styles.rmSlideshow} />
          {fest.category && (
            <span className={`${styles.catBadge} ${styles['cat_' + fest.category] || ''}`}>
              <i className={CATEGORY_ICONS[fest.category] || 'fas fa-star'} /> {fest.category}
            </span>
          )}
        </div>

        <div className={styles.rmBody}>
          <h2 className={styles.rmTitle}>{tr('name')}</h2>
          <div className={styles.metaChips}>
            {fest.date && (
              <span className={styles.metaChip}>
                <i className="fas fa-calendar-alt" /> {fest.date}
              </span>
            )}
            {fest.location && (
              <span className={styles.metaChip}>
                <i className="fas fa-map-marker-alt" /> {fest.location}
              </span>
            )}
          </div>
          <p className={styles.rmText}>{tr('description')}</p>

          {fest.link && (
            <a
              href={fest.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.learnBtn}
            >
              <i className="fas fa-external-link-alt" /> {t('btn_learn_more')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Festivals() {
  const { t, language } = useLanguage();
  // Helper: return translated field for a festival item
  const tr = (fest, key) => fest.translations?.[language]?.[key] || fest[key] || '';
  const [festivals, setFestivals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [modalFest, setModalFest] = useState(null);
  const [heroContent, setHeroContent] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    festivalService.getAll()
      .then(r => {
        let data = r.data?.data || r.data?.festivals || r.data || [];
        if (!Array.isArray(data) || data.length === 0) data = FALLBACK;
        if (search)   data = data.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase()));
        if (category) data = data.filter(f => f.category === category);
        setFestivals(data);
      })
      .catch(() => setFestivals(FALLBACK))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    contentService.getAll({ section: 'festivals_hero' })
      .then((res) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const heroes = res.data?.content || res.data || [];
        const active = heroes.filter((h) => {
          if (!h.isActive) return false;
          if (!h.validFrom) return true;
          return new Date(h.validFrom) <= today;
        });
        if (active.length > 0) setHeroContent(active[0]);
      })
      .catch(() => {});
  }, []);

  const categories = [...new Set(FALLBACK.map(f => f.category))];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div
        className={styles.hero}
        style={heroContent?.imageUrl || heroContent?.image ? {
          backgroundImage: `url(${heroContent.imageUrl || heroContent.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">
            {heroContent?.eyebrow || t('section_festivals') || 'Culture & Celebration'}
          </span>
          <h1 className={styles.heroTitle}>
            {heroContent?.title || t('page_festivals') || 'Festivals of Mongolia'}
          </h1>
          <p className={styles.heroSub}>
            {heroContent?.subtitle || heroContent?.text || t('page_festivals_sub') || 'Experience the vibrant traditions and timeless celebrations of the Mongolian people'}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <form className={styles.filters} onSubmit={e => { e.preventDefault(); load(); }}>
          <div className={styles.filterSearch}>
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder={t('filter_search_ph') || 'Search festivals...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            <i className="fas fa-filter" /> {t('filter_btn') || 'Filter'}
          </button>
        </form>

        {/* States */}
        {loading && (
          <div className={styles.grid}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ margin: '32px 0' }}>
            <i className="fas fa-exclamation-circle" /> {error}
            <button className="btn btn-sm btn-secondary" onClick={load} style={{ marginLeft: 'auto' }}>{t('retry')}</button>
          </div>
        )}

        {!loading && festivals.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-search" />
            <h3>{t('no_packages') || 'No festivals found'}</h3>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>
              {t('clear_filters')}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && festivals.length > 0 && (
          <div className={styles.grid}>
            {festivals.map(fest => {
              const imgs = resolveImages(fest);
              return (
                <div key={fest._id} className={styles.card}>
                  <div className={styles.cardImg}>
                    <ImageSlideshow
                      images={imgs}
                      alt={fest.name}
                      interval={5000}
                      className={styles.cardSlideshow}
                    />
                    {/* bottom gradient overlay with title */}
                    <div className={styles.cardImgOverlay}>
                      {fest.category && (
                        <span className={`${styles.catBadge} ${styles['cat_' + fest.category] || ''}`}>
                          <i className={CATEGORY_ICONS[fest.category] || 'fas fa-star'} /> {fest.category}
                        </span>
                      )}
                      <h3 className={styles.cardImgTitle}>{tr(fest, 'name')}</h3>
                    </div>
                    {imgs.length > 1 && (
                      <span className={styles.imgCount}><i className="fas fa-images" /> {imgs.length}</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.metaChips}>
                      {fest.date && (
                        <span className={styles.metaChip}>
                          <i className="fas fa-calendar-alt" /> {fest.date}
                        </span>
                      )}
                      {fest.location && (
                        <span className={styles.metaChip}>
                          <i className="fas fa-map-marker-alt" /> {fest.location}
                        </span>
                      )}
                    </div>
                    {tr(fest, 'description') && (
                      <p className={styles.cardDesc}>
                        {tr(fest, 'description').slice(0, 100)}{tr(fest, 'description').length > 100 ? '…' : ''}
                      </p>
                    )}
                    <div className={styles.cardFooter}>
                      <button
                        className={styles.detailBtn}
                        onClick={() => setModalFest(fest)}
                      >
                        {t('btn_learn_more')} <i className="fas fa-arrow-right" />
                      </button>
                      {fest.link && (
                        <a
                          href={fest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkBtn}
                        >
                          <i className="fas fa-external-link-alt" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Festival detail modal */}
      {modalFest && (
        <FestivalModal fest={modalFest} onClose={() => setModalFest(null)} t={t} language={language} />
      )}
    </div>
  );
}
