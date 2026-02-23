import React, { useState, useEffect, useCallback } from 'react';
import { aboutService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import styles from './AboutMongolia.module.css';

const CAT_ICONS = {
  culture:  'fas fa-palette',
  nature:   'fas fa-mountain',
  history:  'fas fa-landmark',
  food:     'fas fa-bowl-food',
  nomad:    'fas fa-campground',
  misc:     'fas fa-compass',
};

const FALLBACK = [
  {
    _id: 'a1', title: 'Nomadic Life', category: 'nomad',
    description: 'Nearly a third of Mongolians still live as nomads, herding livestock across vast steppes and moving their ger (yurt) homes with the seasons.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  {
    _id: 'a2', title: 'The Gobi Desert', category: 'nature',
    description: 'The Gobi stretches across southern Mongolia — a land of dramatic sand dunes, dinosaur fossils, and rare snow leopards.',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
  },
  {
    _id: 'a3', title: 'Genghis Khan Legacy', category: 'history',
    description: 'Mongolia is the birthplace of Genghis Khan, who founded the largest contiguous land empire in history in the 13th century.',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&q=80',
  },
  {
    _id: 'a4', title: 'Traditional Cuisine', category: 'food',
    description: 'Mongolian cuisine revolves around meat and dairy — try tsuivan (stir-fried noodles), khorkhog (stone barbecue), and airag (fermented mare\'s milk).',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  },
  {
    _id: 'a5', title: 'Mongolian Throat Singing', category: 'culture',
    description: 'Khoomei (throat singing) is a unique vocal art where singers produce multiple pitches simultaneously — a UNESCO Intangible Cultural Heritage.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  },
  {
    _id: 'a6', title: 'Khövsgöl Lake', category: 'nature',
    description: 'Known as the "Blue Pearl of Mongolia," Khövsgöl holds nearly 70% of Mongolia\'s freshwater and is surrounded by pristine taiga forests.',
    image: 'https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=600&q=80',
  },
];

const CATEGORIES = ['culture', 'nature', 'history', 'food', 'nomad', 'misc'];

export default function AboutMongolia() {
  const { t } = useLanguage();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    aboutService.getAll()
      .then(r => {
        let data = r.data?.data || r.data?.about || r.data || [];
        if (!Array.isArray(data) || data.length === 0) data = FALLBACK;
        if (search)   data = data.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()));
        if (category) data = data.filter(a => a.category === category);
        setItems(data);
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">{t('section_about_mongolia') || 'Discover Mongolia'}</span>
          <h1 className={styles.heroTitle}>{t('page_about_mongolia') || 'About Mongolia'}</h1>
          <p className={styles.heroSub}>{t('page_about_mongolia_sub') || 'Land of eternal blue skies, nomadic heritage, and untamed wilderness'}</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <form className={styles.filters} onSubmit={e => { e.preventDefault(); load(); }}>
          <div className={styles.filterSearch}>
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.catTabs}>
            <button
              type="button"
              className={`${styles.catTab} ${category === '' ? styles.catTabActive : ''}`}
              onClick={() => setCategory('')}
            >All</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                className={`${styles.catTab} ${category === c ? styles.catTabActive : ''}`}
                onClick={() => setCategory(c)}
              >
                <i className={CAT_ICONS[c] || 'fas fa-compass'} /> {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </form>

        {/* States */}
        {loading && (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ margin: '32px 0' }}>
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-search" />
            <h3>Nothing found</h3>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>
              {t('clear_filters') || 'Clear Filters'}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item._id} className={`${styles.card} ${styles['cat_' + item.category]}`}>
                <div className={styles.cardImg}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'}
                    alt={item.title}
                    loading="lazy"
                  />
                  {item.category && (
                    <span className={styles.catBadge}>
                      <i className={CAT_ICONS[item.category] || 'fas fa-compass'} /> {item.category}
                    </span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>
                    {item.description?.slice(0, 140)}{item.description?.length > 140 ? '…' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
