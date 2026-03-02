import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { packageService, destinationService, festivalService, aboutService, contentService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import styles from './Home.module.css';

const STATS = [
  { icon: 'fas fa-users',          value: '15K+', key: 'stat_travelers'    },
  { icon: 'fas fa-map-marker-alt', value: '120+', key: 'stat_destinations' },
  { icon: 'fas fa-trophy',         value: '8+',   key: 'stat_experience'   },
  { icon: 'fas fa-star',           value: '4.9',  key: 'stat_rating'       },
];

const FALLBACK_PKGS = [
  { _id:'p1', name:'Naadam Festival Tour',   destination:'Ulaanbaatar', price:1299, duration:'6 Days', image:'https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=500&q=80' },
  { _id:'p2', name:'Gobi Desert Expedition', destination:'Gobi Desert', price:1599, duration:'8 Days', image:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80' },
  { _id:'p3', name:'Eagle Festival Journey', destination:'Bayan-Ölgii', price:1899, duration:'7 Days', image:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80' },
  { _id:'p4', name:'Khövsgöl Lake Retreat',  destination:'Khövsgöl',    price:1099, duration:'5 Days', image:'https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=500&q=80' },
];

const FALLBACK_DESTS = [
  { _id:'d1', name:'Ulaanbaatar',   country:'Mongolia', category:'Urban',     image:'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80' },
  { _id:'d2', name:'Gobi Desert',   country:'Mongolia', category:'Nature',    image:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80' },
  { _id:'d3', name:'Khövsgöl Lake', country:'Mongolia', category:'Nature',    image:'https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=500&q=80' },
  { _id:'d4', name:'Terelj Park',   country:'Mongolia', category:'Adventure', image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
];

const FALLBACK_FESTIVALS = [
  { _id:'f1', name:'Naadam Festival', date:'July 11–13', location:'Ulaanbaatar', category:'naadam',  image:'https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=500&q=80' },
  { _id:'f2', name:'Tsagaan Sar',     date:'Jan / Feb',  location:'Nationwide',  category:'culture', image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
  { _id:'f3', name:'Eagle Festival',  date:'October',    location:'Bayan-Ölgii', category:'culture', image:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80' },
  { _id:'f4', name:'Ice Festival',    date:'March',      location:'Khövsgöl',    category:'winter',  image:'https://images.unsplash.com/photo-1547369093-8a7e27cf5fd6?w=500&q=80' },
];

const FALLBACK_ABOUT = [
  { _id:'a1', title:'Nomadic Life',        category:'nomad',   image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80',   description:'Nearly a third of Mongolians still live as nomads, herding livestock across vast steppes.' },
  { _id:'a2', title:'The Gobi Desert',     category:'nature',  image:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80',   description:'A land of dramatic sand dunes, dinosaur fossils, and rare snow leopards.' },
  { _id:'a3', title:'Genghis Khan Legacy', category:'history', image:'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80',   description:'Birthplace of the founder of the largest contiguous land empire in history.' },
  { _id:'a4', title:'Throat Singing',      category:'culture', image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80',   description:'Khoomei — a unique UNESCO-recognised vocal art where singers produce multiple pitches.' },
];

/* ─── Scroll Row helper ─────────────────────────────────────── */
function ScrollRow({ children, label, viewAllTo, t }) {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };
  return (
    <div className={styles.scrollSection}>
      <div className={`${styles.sectionHead} container`}>
        <h2 className={styles.sectionTitle}>{label}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="btn btn-outline btn-sm">
            {t('btn_view_all')} <i className="fas fa-arrow-right" />
          </Link>
        )}
      </div>
      <div className={styles.scrollRow}>
        <button className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`} onClick={() => scroll(-1)} aria-label="Previous">
          <i className="fas fa-chevron-left" />
        </button>
        <div className={styles.scrollTrack} ref={trackRef}>
          {children}
        </div>
        <button className={`${styles.scrollArrow} ${styles.scrollArrowRight}`} onClick={() => scroll(1)} aria-label="Next">
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ─── Main component ─────────────────────────────────────────── */
export default function Home() {
  const { t } = useLanguage();

  const [heroSlogan,     setHeroSlogan]     = useState('');
  const [heroImage,      setHeroImage]      = useState('');
  const [heroIntro,      setHeroIntro]      = useState('');
  const [heroVideo,      setHeroVideo]      = useState('');
  const [heroFrontType,  setHeroFrontType]  = useState('image');
  const [heroFrontText,  setHeroFrontText]  = useState('');
  const [heroFrontImage, setHeroFrontImage] = useState('');

  const [packages,  setPackages]  = useState(shuffle(FALLBACK_PKGS));
  const [dests,     setDests]     = useState(shuffle(FALLBACK_DESTS));
  const [festivals, setFestivals] = useState(shuffle(FALLBACK_FESTIVALS));
  const [abouts,    setAbouts]    = useState(shuffle(FALLBACK_ABOUT));

  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Hero content
    contentService.getAll({ section: 'hero' })
      .then(r => {
        const items = r.data?.data || r.data?.content || r.data || [];
        const find = (key) => items.find(c => c.key === key);
        if (find('home_slogan')) setHeroSlogan(find('home_slogan').text || find('home_slogan').title || '');
        if (find('home_image'))       setHeroImage(find('home_image').image || find('home_image').imageUrl || '');
        if (find('home_video'))       setHeroVideo(find('home_video').text || '');
        if (find('home_intro'))       setHeroIntro(find('home_intro').text || '');
        if (find('home_front_type'))  setHeroFrontType(find('home_front_type').text || 'image');
        if (find('home_front_text'))  setHeroFrontText(find('home_front_text').text || '');
        if (find('home_front_image')) setHeroFrontImage(find('home_front_image').image || find('home_front_image').imageUrl || '');
      })
      .catch(() => {});

    packageService.getAll()
      .then(r => { const d = r.data?.data || r.data?.packages || r.data || []; setPackages(shuffle(Array.isArray(d) && d.length >= 3 ? d : FALLBACK_PKGS).slice(0, 6)); })
      .catch(() => {});

    destinationService.getAll()
      .then(r => { const d = r.data?.destinations || r.data?.data || r.data || []; setDests(shuffle(Array.isArray(d) && d.length >= 3 ? d : FALLBACK_DESTS).slice(0, 6)); })
      .catch(() => {});

    festivalService.getAll()
      .then(r => { const d = r.data?.data || r.data?.festivals || r.data || []; setFestivals(shuffle(Array.isArray(d) && d.length >= 3 ? d : FALLBACK_FESTIVALS).slice(0, 6)); })
      .catch(() => {});

    aboutService.getAll()
      .then(r => { const d = r.data?.data || r.data?.about || r.data || []; setAbouts(shuffle(Array.isArray(d) && d.length >= 3 ? d : FALLBACK_ABOUT).slice(0, 6)); })
      .catch(() => {});
  }, []);

  const slogan = heroSlogan || t('home_slogan') || 'Discover Mongolia, Explore the World';
  const intro  = heroIntro  || t('home_intro')  || 'The land of ancient nomads — a place that stays forever in the hearts of travellers.';
  const bgImg  = heroImage  || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90';

  const handleSubscribe = (e) => { e.preventDefault(); setSubscribed(true); setEmail(''); };

  return (
    <main className={styles.main}>

      {/* ── SECTION 1: HERO ─────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBg} style={{ backgroundImage: `url("${bgImg}")` }} />

        <div className={`${styles.heroContent} container`}>
          {/* Slogan at top — 2× font size */}
          <h1 className={styles.heroSlogan}>{slogan}</h1>

          {/* Media in the middle */}
          <div className={styles.heroMedia}>
            {heroVideo ? (
              <video src={heroVideo} className={styles.heroMediaEl} autoPlay muted loop playsInline />
            ) : heroFrontType === 'text' && heroFrontText ? (
              <div className={styles.heroMediaText}>
                <p>{heroFrontText}</p>
              </div>
            ) : (
              <img src={heroFrontImage || bgImg} alt={slogan} className={styles.heroMediaEl} />
            )}
          </div>

          {/* Intro text below media */}
          <p className={styles.heroIntro}>{intro}</p>

          <div className={styles.heroCta}>
            <Link to="/packages" className="btn btn-primary btn-lg">
              <i className="fas fa-compass" /> {t('btn_explore')}
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">
              <i className="fas fa-headset" /> {t('btn_contact_us')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className={`${styles.statsCard} container`}>
          {STATS.map(({ icon, value, key }) => (
            <div key={key} className={styles.statItem}>
              <div className={styles.statIcon}><i className={icon} /></div>
              <div>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{t(key)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: TOURS ─────────────────────────────────── */}
      <ScrollRow label={t('section_packages') || 'Featured Tours'} viewAllTo="/packages" t={t}>
        {packages.map(pkg => (
          <div key={pkg._id} className={styles.scrollCard}>
            <div className={styles.scrollCardImg}>
              <img src={pkg.images?.[0] || pkg.image || FALLBACK_PKGS[0].image} alt={pkg.name} loading="lazy" />
              {(pkg.duration || pkg.dur) && (
                <span className={styles.scrollCardBadge}>
                  <i className="fas fa-clock" /> {pkg.duration || pkg.dur}
                </span>
              )}
            </div>
            <div className={styles.scrollCardBody}>
              {(pkg.destination || pkg.dest) && (
                <p className={styles.scrollCardMeta}><i className="fas fa-map-marker-alt" /> {pkg.destination || pkg.dest}</p>
              )}
              <h3 className={styles.scrollCardTitle}>{pkg.name}</h3>
              <div className={styles.scrollCardFooter}>
                <span className={styles.scrollCardPrice}>
                  {t('from_price')} <strong>${pkg.price}</strong>
                </span>
                <Link to={`/booking?package=${pkg._id}`} className="btn btn-primary btn-sm">{t('btn_book_now')}</Link>
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* ── SECTION 3: DESTINATIONS ──────────────────────────── */}
      <ScrollRow label={t('section_dest_title') || 'Top Destinations'} viewAllTo="/destinations" t={t}>
        {dests.map(dest => {
          const name    = dest.name || dest.title || '';
          const country = [dest.city, dest.country].filter(Boolean).join(', ') || dest.country || '';
          const img     = dest.image || dest.img || FALLBACK_DESTS[0].image;
          const tag     = dest.category || dest.tag || '';
          return (
            <Link key={dest._id} to="/destinations" className={`${styles.scrollCard} ${styles.destScrollCard}`}>
              <div className={`${styles.scrollCardImg} ${styles.destImgWrap}`}>
                <img src={img} alt={name} loading="lazy" />
                <div className={styles.destOverlay} />
                {tag && <span className={styles.destTagBadge}>{tag}</span>}
                <div className={styles.destInfo}>
                  <h3 className={styles.destName}>{name}</h3>
                  {country && <p className={styles.destCountry}><i className="fas fa-map-marker-alt" /> {country}</p>}
                </div>
              </div>
            </Link>
          );
        })}
      </ScrollRow>

      {/* ── SECTION 4: FESTIVALS ─────────────────────────────── */}
      <ScrollRow label={t('section_festivals') || 'Festivals & Celebrations'} viewAllTo="/festivals" t={t}>
        {festivals.map(fest => (
          <div key={fest._id} className={styles.scrollCard}>
            <div className={styles.scrollCardImg}>
              <img src={fest.image || FALLBACK_FESTIVALS[0].image} alt={fest.name} loading="lazy" />
              {fest.category && <span className={styles.scrollCardBadge}>{fest.category}</span>}
            </div>
            <div className={styles.scrollCardBody}>
              <p className={styles.scrollCardMeta}>
                {fest.date && <><i className="fas fa-calendar-alt" /> {fest.date}</>}
                {fest.location && <> &bull; <i className="fas fa-map-marker-alt" /> {fest.location}</>}
              </p>
              <h3 className={styles.scrollCardTitle}>{fest.name}</h3>
              <div className={styles.scrollCardFooter}>
                <Link to="/festivals" className="btn btn-outline btn-sm">{t('btn_learn_more')}</Link>
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* ── SECTION 5: ABOUT MONGOLIA ────────────────────────── */}
      <ScrollRow label={t('section_about_mongolia') || 'Discover Mongolia'} viewAllTo="/about-mongolia" t={t}>
        {abouts.map(item => (
          <div key={item._id} className={styles.scrollCard}>
            <div className={styles.scrollCardImg}>
              <img src={item.image || FALLBACK_ABOUT[0].image} alt={item.title} loading="lazy" />
              {item.category && <span className={styles.scrollCardBadge}>{item.category}</span>}
            </div>
            <div className={styles.scrollCardBody}>
              <h3 className={styles.scrollCardTitle}>{item.title}</h3>
              {item.description && (
                <p className={styles.scrollCardDesc}>
                  {item.description.slice(0, 90)}{item.description.length > 90 ? '…' : ''}
                </p>
              )}
              <div className={styles.scrollCardFooter}>
                <Link to="/about-mongolia" className="btn btn-outline btn-sm">{t('btn_learn_more')}</Link>
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.nlOverlay} />
        <div className={`${styles.nlContent} container`}>
          <span className="section-label">{t('section_newsletter')}</span>
          <h2 className={styles.nlTitle}>{t('section_newsletter')}</h2>
          <p className={styles.nlSub}>{t('section_newsletter_sub')}</p>
          {subscribed ? (
            <div className={styles.subSuccess}><i className="fas fa-check-circle" /> {t('newsletter_success')}</div>
          ) : (
            <form className={styles.subForm} onSubmit={handleSubscribe}>
              <input type="email" placeholder={t('newsletter_ph')} value={email} onChange={e => setEmail(e.target.value)} required className={styles.subInput} />
              <button type="submit" className={`btn btn-primary ${styles.subBtn}`}>{t('newsletter_btn')} <i className="fas fa-arrow-right" /></button>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}

