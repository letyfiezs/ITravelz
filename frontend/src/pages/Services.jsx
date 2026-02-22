import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/api';
import styles from './Services.module.css';

const FALLBACK = [
  { _id: '1', name: 'Bali, Indonesia',      category: 'Beach',     description: 'Tropical paradise with stunning temples, rice terraces, and world-class surfing.',     image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { _id: '2', name: 'Paris, France',        category: 'Culture',   description: 'The City of Light — art, cuisine, iconic landmarks and romantic boulevards.',            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { _id: '3', name: 'Santorini, Greece',    category: 'Romantic',  description: 'Whitewashed villages perched on volcanic cliffs above the deep blue Aegean Sea.',       image: 'https://images.unsplash.com/photo-1552832503-32d0d8c166c1?w=600&q=80' },
  { _id: '4', name: 'Tokyo, Japan',         category: 'Urban',     description: 'A hypnotic blend of ultra-modern skyscrapers, ancient shrines, and street food culture.',image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { _id: '5', name: 'Machu Picchu, Peru',   category: 'Adventure', description: 'Ancient Inca citadel set high in the Andes Mountains — a true wonder of the world.',   image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80' },
  { _id: '6', name: 'Cape Town, South Africa', category: 'Nature', description: 'Where the ocean meets dramatic mountains, with vibrant culture and stunning wildlife.', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80' },
  { _id: '7', name: 'New York, USA',        category: 'Urban',     description: 'The city that never sleeps — Broadway, world cuisine, iconic skyline and Central Park.',  image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80' },
  { _id: '8', name: 'Safari, Kenya',        category: 'Adventure', description: 'Witness the Great Migration and the Big Five in the Maasai Mara National Reserve.',     image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80' },
  { _id: '9', name: 'Maldives',             category: 'Beach',     description: 'Crystal-clear lagoons, overwater bungalows, and pristine coral reefs await.',           image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80' },
];

const CATEGORIES = ['All', 'Beach', 'Culture', 'Romantic', 'Urban', 'Adventure', 'Nature'];

const Services = () => {
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    serviceService.getAll()
      .then((res) => {
        const data = res.data?.data || res.data?.services || res.data || [];
        setServices(data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setServices(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchesTab = activeTab === 'All' || s.category === activeTab;
    const matchesSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">Destinations</span>
          <h1 className={styles.heroTitle}>Explore Our Destinations</h1>
          <p className={styles.heroSub}>Discover breathtaking places handpicked by our travel experts</p>

          {/* Search in hero */}
          <div className={styles.heroSearch}>
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Category tabs */}
        <div className={styles.tabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.tab} ${activeTab === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className={styles.resultCount}>
          <strong>{filtered.length}</strong> destination{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Loading */}
        {loading && (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {/* Results */}
        {!loading && filtered.length > 0 && (
          <div className={styles.grid}>
            {filtered.map(s => (
              <div key={s._id} className={styles.card}>
                <div className={styles.cardImg}>
                  <img src={s.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80'} alt={s.name} loading="lazy" />
                  <div className={styles.cardOverlay} />
                  {s.category && <span className={styles.catTag}>{s.category}</span>}
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>{s.name}</h3>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  {s.description && <p className={styles.desc}>{s.description}</p>}
                  <div className={styles.cardFooter}>
                    {s.price && (
                      <span className={styles.priceTag}>
                        <i className="fas fa-tag" /> From ${s.price}
                      </span>
                    )}
                    <Link to={`/packages?dest=${encodeURIComponent(s.name)}`} className="btn btn-primary btn-sm">
                      View Tours <i className="fas fa-arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-globe" />
            <h3>No destinations found</h3>
            <p>Try a different search or category.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setActiveTab('All'); }}>
              Show All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
