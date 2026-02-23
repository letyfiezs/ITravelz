import React, { useState, useEffect, useCallback } from 'react';
import { festivalService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
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

const FALLBACK = [
  {
    _id: 'f1', name: 'Naadam Festival', date: 'July 11–13',
    location: 'Ulaanbaatar', category: 'naadam',
    description: 'The grandest national festival of Mongolia featuring the "Three Games of Men" — wrestling, horse racing, and archery.',
    image: 'https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=600&q=80',
  },
  {
    _id: 'f2', name: 'Tsagaan Sar', date: 'January / February',
    location: 'Nationwide', category: 'culture',
    description: 'Mongolian Lunar New Year — a time of family reunion, traditional feasts, and the gifting of fermented mare\'s milk.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  {
    _id: 'f3', name: 'Eagle Festival', date: 'October',
    location: 'Bayan-Ölgii', category: 'culture',
    description: 'Kazakh eagle hunters showcase centuries-old traditions of falconry in the breathtaking Altai mountains.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
  },
  {
    _id: 'f4', name: 'Ice Festival', date: 'March',
    location: 'Khövsgöl Lake', category: 'winter',
    description: 'Celebrate the frozen Khövsgöl lake with ice sculptures, reindeer sledding, and shamanic ceremonies.',
    image: 'https://images.unsplash.com/photo-1547369093-8a7e27cf5fd6?w=600&q=80',
  },
];

export default function Festivals() {
  const { t } = useLanguage();
  const [festivals, setFestivals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');

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

  const categories = [...new Set(FALLBACK.map(f => f.category))];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">{t('section_festivals') || 'Culture & Celebration'}</span>
          <h1 className={styles.heroTitle}>{t('page_festivals') || 'Festivals of Mongolia'}</h1>
          <p className={styles.heroSub}>{t('page_festivals_sub') || 'Experience the vibrant traditions and timeless celebrations of the Mongolian people'}</p>
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
            <button className="btn btn-sm btn-secondary" onClick={load} style={{ marginLeft: 'auto' }}>Retry</button>
          </div>
        )}

        {!loading && festivals.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-search" />
            <h3>No festivals found</h3>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>
              {t('clear_filters') || 'Clear Filters'}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && festivals.length > 0 && (
          <div className={styles.grid}>
            {festivals.map(fest => (
              <div key={fest._id} className={styles.card}>
                <div className={styles.cardImg}>
                  <img
                    src={fest.image || 'https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=600&q=80'}
                    alt={fest.name}
                    loading="lazy"
                  />
                  {fest.category && (
                    <span className={styles.catBadge}>
                      <i className={CATEGORY_ICONS[fest.category] || 'fas fa-star'} /> {fest.category}
                    </span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    {fest.date && (
                      <span className={styles.metaItem}>
                        <i className="fas fa-calendar-alt" /> {fest.date}
                      </span>
                    )}
                    {fest.location && (
                      <span className={styles.metaItem}>
                        <i className="fas fa-map-marker-alt" /> {fest.location}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{fest.name}</h3>
                  {fest.description && (
                    <p className={styles.cardDesc}>
                      {fest.description.slice(0, 120)}{fest.description.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
