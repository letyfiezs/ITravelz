import React, { useState, useEffect, useCallback } from 'react';
import { aboutService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import ImageSlideshow from '../components/ImageSlideshow/ImageSlideshow';
import styles from './AboutMongolia.module.css';

const CAT_ICONS = {
  culture:  'fas fa-palette',
  nature:   'fas fa-mountain',
  history:  'fas fa-landmark',
  food:     'fas fa-utensils',
  nomad:    'fas fa-campground',
  misc:     'fas fa-compass',
};

const BASE = (import.meta?.env?.VITE_API_URL || '').replace('/api', '');
const resolveImages = (item) => {
  const arr = item.images?.length
    ? item.images
    : item.image
      ? [item.image]
      : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'];
  return arr.map(src => src.startsWith('http') ? src : `${BASE}${src}`);
};

const FALLBACK = [
  {
    _id: 'a1', title: 'Nomadic Life', category: 'nomad',
    description: 'Nearly a third of Mongolians still live as nomads, herding livestock across vast steppes and moving their ger (yurt) homes with the seasons.',
    readMore: 'Mongolian nomads follow seasonal migration routes passed down for millennia. Their portable felt homes — gers — can be assembled in under an hour. The nomadic lifestyle revolves around the "five snouts": horses, cattle, camels, sheep, and goats. It is a way of life deeply tied to nature, hospitality, and spiritual traditions.',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
  },
  {
    _id: 'a2', title: 'The Gobi Desert', category: 'nature',
    description: 'The Gobi stretches across southern Mongolia — a land of dramatic sand dunes, dinosaur fossils, and rare snow leopards.',
    readMore: 'The Gobi Desert is one of Asia\'s largest deserts, covering over 1.3 million km². Despite its name, much of the Gobi is not sandy but rocky and cold. It is home to the Flaming Cliffs where Roy Andrews discovered the first dinosaur eggs ever found, Khongoryn Els singing sand dunes, and tough Bactrian camels. Temperatures swing from -40°C in winter to +45°C in summer.',
    images: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80'],
  },
  {
    _id: 'a3', title: 'Genghis Khan Legacy', category: 'history',
    description: 'Mongolia is the birthplace of Genghis Khan, who founded the largest contiguous land empire in history in the 13th century.',
    readMore: 'Born Temüjin around 1162, Genghis Khan unified the nomadic tribes of northeast Asia and launched the Mongol conquests that created an empire spanning from the Pacific Ocean to Eastern Europe. His Yasa code introduced trade protections, religious tolerance, and one of the world\'s first postal systems. Mongolians revere him as the founding father of their nation.',
    images: ['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&q=80'],
  },
  {
    _id: 'a4', title: 'Traditional Cuisine', category: 'food',
    description: 'Mongolian cuisine revolves around meat and dairy — try tsuivan (stir-fried noodles), khorkhog (stone barbecue), and airag (fermented mare\'s milk).',
    readMore: 'Mongolian food reflects the nomadic lifestyle — hearty, energy-rich, and based on what the land provides. Buuz are steamed mutton dumplings eaten during Tsagaan Sar. Aaruul (dried curds) are a popular snack. Khorkhog, meat cooked with hot stones inside a sealed container, is a celebratory dish. Airag (fermented mare\'s milk) is mildly alcoholic and offered to guests as a sign of hospitality.',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'],
  },
  {
    _id: 'a5', title: 'Mongolian Throat Singing', category: 'culture',
    description: 'Khoomei (throat singing) is a unique vocal art where singers produce multiple pitches simultaneously — a UNESCO Intangible Cultural Heritage.',
    readMore: 'Khoomei has been practiced for centuries in western Mongolia and the Tuvan regions. Singers manipulate their vocal tract to produce a drone and a melodic whistle simultaneously, mimicking the sounds of nature. Different styles include sygyt (high whistle), kargyraa (deep rumble), and khoomei (mid-range). It is performed at festivals, ceremonies, and for spiritual purposes.',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80'],
  },
  {
    _id: 'a6', title: 'Khövsgöl Lake', category: 'nature',
    description: 'Known as the "Blue Pearl of Mongolia," Khövsgöl holds nearly 70% of Mongolia\'s freshwater and is surrounded by pristine taiga forests.',
    readMore: 'Khövsgöl Lake is 136 km long, up to 262 m deep, and one of the 17 ancient lakes in the world. It is the world\'s 14th largest freshwater lake by volume. The lake remains frozen from January to May. The Tsaatan (reindeer herders) live in the surrounding forests. Activities include horse trekking, fishing, kayaking in summer, and dog sledding and ice fishing in winter.',
    images: ['https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=600&q=80'],
  },
];

const CATEGORIES = ['culture', 'nature', 'history', 'food', 'nomad', 'misc'];

/* ── Read More Modal ──────────────────────────────────────── */
function ReadMoreModal({ item, onClose, language }) {
  const imgs = resolveImages(item);
  const tr = (key) => item.translations?.[language]?.[key] || item[key] || '';
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className={styles.rmBackdrop} onClick={handleBackdrop}>
      <div className={styles.rmContent}>
        <button className={styles.rmClose} onClick={onClose} aria-label="Close"><i className="fas fa-times"/></button>
        <div className={styles.rmImgWrap}>
          <ImageSlideshow images={imgs} alt={item.title} interval={5000} className={styles.rmSlideshow}/>
          {item.category && (
            <span className={`${styles.catBadge} ${styles['cat_'+item.category]||''}`}>
              <i className={CAT_ICONS[item.category]||'fas fa-compass'}/> {item.category}
            </span>
          )}
        </div>
        <div className={styles.rmBody}>
          <h2 className={styles.rmTitle}>{tr('title')}</h2>
          <p className={styles.rmText}>{tr('readMore') || tr('description')}</p>
        </div>
      </div>
    </div>
  );
}

export default function AboutMongolia() {
  const { t, language } = useLanguage();
  // Helper: return translated field
  const tr = (item, key) => item.translations?.[language]?.[key] || item[key] || '';
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [heroContent, setHeroContent] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    aboutService.getAll()
      .then(r => {
        let data = r.data?.items || r.data?.data || r.data?.about || r.data || [];
        if (!Array.isArray(data) || data.length === 0) data = FALLBACK;
        if (search)   data = data.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()));
        if (category) data = data.filter(a => a.category === category);
        setItems(data);
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    contentService.getAll({ section: 'about_hero' })
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
            {heroContent?.eyebrow || t('section_about_mongolia') || 'Discover Mongolia'}
          </span>
          <h1 className={styles.heroTitle}>
            {heroContent?.title || t('page_about_mongolia') || 'About Mongolia'}
          </h1>
          <p className={styles.heroSub}>
            {heroContent?.subtitle || heroContent?.text || t('page_about_mongolia_sub') || 'Land of eternal blue skies, nomadic heritage, and untamed wilderness'}
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
              placeholder={t('filter_search_ph') || 'Search topics...'}
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
            >{t('btn_view_all') || 'All'}</button>
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
            <h3>{t('no_packages') || 'Nothing found'}</h3>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>
              {t('clear_filters')}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <div className={styles.grid}>
            {items.map(item => {
              const imgs = resolveImages(item);
              return (
                <div key={item._id} className={`${styles.card} ${styles['cat_' + item.category]}`}>
                  <div className={styles.cardImg}>
                    <ImageSlideshow
                      images={imgs}
                      alt={item.title}
                      interval={5000}
                      className={styles.cardSlideshow}
                    />
                    <div className={styles.cardImgOverlay}>
                      {item.category && (
                        <span className={styles.catBadge}>
                          <i className={CAT_ICONS[item.category] || 'fas fa-compass'} /> {item.category}
                        </span>
                      )}
                      <h3 className={styles.cardImgTitle}>{tr(item, 'title')}</h3>
                    </div>
                    {imgs.length > 1 && (
                      <span className={styles.imgCount}><i className="fas fa-images"/> {imgs.length}</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardDesc}>
                      {tr(item, 'description')?.slice(0, 120)}{(tr(item, 'description')?.length || 0) > 120 ? '…' : ''}
                    </p>
                    <button
                      className={styles.readMoreBtn}
                      onClick={() => setModalItem(item)}
                    >
                      {t('btn_learn_more')} <i className="fas fa-arrow-right"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalItem && <ReadMoreModal item={modalItem} onClose={() => setModalItem(null)} language={language}/>}
    </div>
  );
}
