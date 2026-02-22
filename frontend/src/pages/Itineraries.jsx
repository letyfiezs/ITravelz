import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itineraryService } from '../services/api';
import styles from './Itineraries.module.css';

const FALLBACK = [
  { _id:'1', title:'Classic Bali Explorer', destination:'Bali, Indonesia', days: 7, highlights: ['Ubud Rice Terraces','Tanah Lot Temple','Mount Batur Sunrise','Seminyak Beach'], image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80', price: 1299, difficulty:'Easy' },
  { _id:'2', title:'Tokyo Deep Dive',        destination:'Tokyo, Japan',    days: 9, highlights: ['Shibuya Crossing','Tsukiji Market','Mount Fuji day trip','Akihabara'],          image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80', price: 2199, difficulty:'Easy' },
  { _id:'3', title:'Greek Islands Odyssey',  destination:'Greece',          days:10, highlights: ['Santorini caldera','Mykonos beaches','Athens Acropolis','Delphi ruins'],         image:'https://images.unsplash.com/photo-1552832503-32d0d8c166c1?w=500&q=80', price: 2899, difficulty:'Easy' },
  { _id:'4', title:'Inca Trail Adventure',   destination:'Peru',            days:12, highlights: ['Machu Picchu','Sacred Valley','Rainbow Mountain','Lake Titicaca'],              image:'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80', price: 1999, difficulty:'Challenging' },
  { _id:'5', title:'African Safari Journey', destination:'Kenya & Tanzania',days:10, highlights: ['Maasai Mara Migration','Serengeti plains','Ngorongoro Crater','Kilimanjaro'],   image:'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=500&q=80', price: 3499, difficulty:'Moderate' },
  { _id:'6', title:'Paris & French Riviera', destination:'France',          days: 8, highlights: ['Eiffel Tower','Louvre Museum','Monaco','Nice beaches'],                         image:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80', price: 2499, difficulty:'Easy' },
];

const DIFFICULTY_COLOR = { Easy: '#28c76f', Moderate: '#ff9f43', Challenging: '#ea5455' };

const Itineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [active,      setActive]      = useState(null);

  useEffect(() => {
    itineraryService.getAll()
      .then((res) => {
        const data = res.data?.data || res.data?.itineraries || res.data || [];
        setItineraries(data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setItineraries(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">Itineraries</span>
          <h1 className={styles.heroTitle}>Day-by-Day Travel Plans</h1>
          <p className={styles.heroSub}>Expertly crafted itineraries — every moment planned, every experience curated</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {loading && (
          <div className={styles.grid}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {!loading && (
          <div className={styles.grid}>
            {itineraries.map(itin => (
              <div key={itin._id} className={`${styles.card} ${active === itin._id ? styles.cardOpen : ''}`}>
                {/* Card image */}
                <div className={styles.cardImg}>
                  <img src={itin.image || 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500&q=80'} alt={itin.title} loading="lazy" />
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardTop}>
                    {itin.difficulty && (
                      <span className={styles.diffBadge} style={{ background: DIFFICULTY_COLOR[itin.difficulty] || '#888' }}>
                        {itin.difficulty}
                      </span>
                    )}
                    {itin.days && (
                      <span className={styles.daysBadge}>
                        <i className="fas fa-calendar-check" /> {itin.days} Days
                      </span>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className={styles.cardBody}>
                  {itin.destination && (
                    <p className={styles.dest}><i className="fas fa-map-marker-alt" /> {itin.destination}</p>
                  )}
                  <h3 className={styles.title}>{itin.title}</h3>

                  {/* Highlights accordion */}
                  {itin.highlights && itin.highlights.length > 0 && (
                    <div className={styles.highlights}>
                      <button className={styles.highlightBtn} onClick={() => setActive(a => a === itin._id ? null : itin._id)}>
                        <span><i className="fas fa-star" /> Highlights</span>
                        <i className={`fas fa-chevron-${active === itin._id ? 'up' : 'down'}`} />
                      </button>
                      {active === itin._id && (
                        <ul className={styles.highlightList}>
                          {itin.highlights.map((h, i) => (
                            <li key={i}><i className="fas fa-check-circle" /> {h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className={styles.footer}>
                    {itin.price && (
                      <div className={styles.price}>
                        <span>from</span>
                        <strong>${itin.price}</strong>
                        <span>/person</span>
                      </div>
                    )}
                    <Link
                      to={`/booking?package=${itin._id}&type=itinerary`}
                      className="btn btn-primary btn-sm"
                    >
                      Book This Trip
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={styles.cta}>
          <div className={styles.ctaOverlay} />
          <div className={styles.ctaContent}>
            <h2>Want a Personalized Itinerary?</h2>
            <p>Tell us your dream destination and travel style. Our experts will craft the perfect plan just for you.</p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              <i className="fas fa-headset" /> Talk to an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itineraries;
