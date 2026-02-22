import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packageService } from '../services/api';
import styles from './Home.module.css';

const STATS = [
  { icon: 'fas fa-users',          value: '15K+', label: 'Happy Travelers'  },
  { icon: 'fas fa-map-marker-alt', value: '120+', label: 'Destinations'     },
  { icon: 'fas fa-trophy',         value: '8+',   label: 'Years Experience' },
  { icon: 'fas fa-star',           value: '4.9',  label: 'Average Rating'   },
];

const DESTINATIONS = [
  { name: 'Bali',        country: 'Indonesia',     tag: 'Beach',     img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { name: 'Paris',       country: 'France',        tag: 'Culture',   img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { name: 'Santorini',   country: 'Greece',        tag: 'Romantic',  img: 'https://images.unsplash.com/photo-1552832503-32d0d8c166c1?w=600&q=80' },
  { name: 'Tokyo',       country: 'Japan',         tag: 'Urban',     img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { name: 'Machu Picchu',country: 'Peru',          tag: 'Adventure', img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80' },
  { name: 'Cape Town',   country: 'South Africa',  tag: 'Nature',    img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', location: 'New York, USA',  rating: 5, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Absolutely incredible experience! ITravelz planned every detail perfectly. Our Bali honeymoon was beyond our wildest dreams.' },
  { name: 'Marco Rossi',   location: 'Milan, Italy',   rating: 5, avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   text: "The Tokyo itinerary was flawlessly executed. Every hotel, every tour was top-notch. I've already booked my next trip!" },
  { name: 'Amara Diallo',  location: 'Paris, France',  rating: 5, avatar: 'https://randomuser.me/api/portraits/women/68.jpg', text: 'Professional, responsive, and genuinely passionate about travel. The Santorini package was worth every penny.' },
];

const WHY_US = [
  { icon: 'fas fa-shield-alt',  color: '#4f75ff', title: 'Safe & Insured',       desc: 'All trips include travel insurance and 24/7 emergency support.'          },
  { icon: 'fas fa-dollar-sign', color: '#28c76f', title: 'Best Price Guarantee', desc: "Find the same trip cheaper and we'll beat any price, guaranteed."        },
  { icon: 'fas fa-headset',     color: '#ff9f43', title: '24/7 Support',         desc: 'Our travel experts are available around the clock to assist you.'        },
  { icon: 'fas fa-route',       color: '#ea5455', title: 'Custom Itineraries',   desc: 'Tailor-made travel plans built around your preferences and budget.'      },
];

const FALLBACK_PKGS = [
  { id: '1', name: 'Bali Paradise Escape', dest: 'Bali, Indonesia',    price: 1299, dur: '7 Days', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80' },
  { id: '2', name: 'Paris Romance Tour',   dest: 'Paris, France',      price: 1899, dur: '5 Days', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80' },
  { id: '3', name: 'Tokyo Explorer',       dest: 'Tokyo, Japan',       price: 2199, dur: '9 Days', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80' },
];

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages]     = useState([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [searchDest, setSearchDest]       = useState('');
  const [searchDate, setSearchDate]       = useState('');
  const [searchGuests, setSearchGuests]   = useState('');
  const [email, setEmail]       = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    packageService.getAll()
      .then(r => setPackages((r.data?.data || r.data || []).slice(0, 3)))
      .catch(() => setPackages([]))
      .finally(() => setPkgLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/packages' + (searchDest ? '?dest=' + encodeURIComponent(searchDest) : ''));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  const displayPkgs = packages.length > 0 ? packages : FALLBACK_PKGS;

  return (
    <main className={styles.main}>

      {/*  HERO  */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBg} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">Discover The World</span>
          <h1 className={styles.heroTitle}>
            Explore The World<br/><em>Your Way</em>
          </h1>
          <p className={styles.heroSub}>
            Unforgettable journeys tailored to your dreams. From tropical beaches to historic cities  adventure awaits.
          </p>
          <form className={styles.searchWidget} onSubmit={handleSearch}>
            <div className={styles.searchField}>
              <label><i className="fas fa-map-marker-alt" /> Destination</label>
              <input type="text" placeholder="Where to?" value={searchDest} onChange={e => setSearchDest(e.target.value)} />
            </div>
            <div className={styles.searchDivider} />
            <div className={styles.searchField}>
              <label><i className="fas fa-calendar-alt" /> Travel Date</label>
              <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
            </div>
            <div className={styles.searchDivider} />
            <div className={styles.searchField}>
              <label><i className="fas fa-users" /> Guests</label>
              <input type="number" placeholder="1 Guest" min="1" value={searchGuests} onChange={e => setSearchGuests(e.target.value)} />
            </div>
            <button type="submit" className={styles.searchBtn}>
              <i className="fas fa-search" /> Search
            </button>
          </form>
        </div>
        <div className={styles.scrollHint}><span /></div>
      </section>

      {/*  STATS  */}
      <section className={styles.statsSection}>
        <div className={`${styles.statsCard} container`}>
          {STATS.map(({ icon, value, label }) => (
            <div key={label} className={styles.statItem}>
              <div className={styles.statIcon}><i className={icon} /></div>
              <div>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  DESTINATIONS  */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <span className="section-label">Top Picks</span>
              <h2 className="section-title">Popular Destinations</h2>
            </div>
            <Link to="/services" className="btn btn-outline btn-sm">View All <i className="fas fa-arrow-right" /></Link>
          </div>
          <div className={styles.destGrid}>
            {DESTINATIONS.map(({ name, country, img, tag }) => (
              <div key={name} className={styles.destCard}>
                <img src={img} alt={name} loading="lazy" />
                <div className={styles.destOverlay} />
                <span className={styles.destTag}>{tag}</span>
                <div className={styles.destInfo}>
                  <h3 className={styles.destName}>{name}</h3>
                  <p className={styles.destCountry}><i className="fas fa-map-marker-alt" /> {country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  PACKAGES  */}
      <section className={`${styles.packSection} section`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <span className="section-label">Our Offers</span>
              <h2 className="section-title">Featured Tour Packages</h2>
            </div>
            <Link to="/packages" className="btn btn-outline btn-sm">All Packages <i className="fas fa-arrow-right" /></Link>
          </div>
          {pkgLoading ? (
            <div className={styles.packGrid}>{[1,2,3].map(i => <div key={i} className={styles.packSkeleton} />)}</div>
          ) : (
            <div className={styles.packGrid}>
              {displayPkgs.map(pkg => (
                <div key={pkg._id || pkg.id} className={styles.packCard}>
                  <div className={styles.packImg}>
                    <img src={pkg.image || pkg.img || 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500&q=80'} alt={pkg.name} />
                    {(pkg.duration || pkg.dur) && <span className={styles.durBadge}><i className="fas fa-clock" /> {pkg.duration || pkg.dur}</span>}
                  </div>
                  <div className={styles.packBody}>
                    {(pkg.destination || pkg.dest) && <p className={styles.packDest}><i className="fas fa-map-marker-alt" /> {pkg.destination || pkg.dest}</p>}
                    <h3 className={styles.packName}>{pkg.name}</h3>
                    <div className={styles.packRating}>
                      {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < (pkg.rating||5) ? styles.starred : styles.unstarred}`} />)}
                      <span className={styles.ratingCount}>({pkg.reviews || 24})</span>
                    </div>
                    <div className={styles.packFooter}>
                      <div className={styles.priceGroup}>
                        <span className={styles.priceFrom}>from</span>
                        <span className={styles.price}>${pkg.price}</span>
                        <span className={styles.pricePer}>/person</span>
                      </div>
                      <Link to={pkg._id ? `/booking?package=${pkg._id}` : '/packages'} className="btn btn-primary btn-sm">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/*  WHY US  */}
      <section className={`${styles.whySection} section`}>
        <div className="container">
          <div className={styles.whyInner}>
            <div className={styles.whyLeft}>
              <span className="section-label">Why ITravelz</span>
              <h2 className="section-title">We Make Your Travel<br />Dreams Come True</h2>
              <p className="section-subtitle" style={{marginTop:'16px'}}>With over 8 years of experience crafting bespoke travel experiences, we know what it takes to make every journey extraordinary.</p>
              <Link to="/packages" className="btn btn-primary" style={{marginTop:'32px', display:'inline-flex'}}>Explore Packages <i className="fas fa-arrow-right" style={{marginLeft:'8px'}} /></Link>
            </div>
            <div className={styles.whyRight}>
              {WHY_US.map(({ icon, color, title, desc }) => (
                <div key={title} className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{'--fi-color': color}}><i className={icon} /></div>
                  <div>
                    <h4 className={styles.featureTitle}>{title}</h4>
                    <p className={styles.featureDesc}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*  TESTIMONIALS  */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionCenter}>
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">What Our Travelers Say</h2>
          </div>
          <div className={styles.testiGrid}>
            {TESTIMONIALS.map(({ name, location, rating, text, avatar }) => (
              <div key={name} className={styles.testiCard}>
                <div className={styles.testiStars}>{[...Array(rating)].map((_,i) => <i key={i} className={`fas fa-star ${styles.starred}`} />)}</div>
                <p className={styles.testiText}>&ldquo;{text}&rdquo;</p>
                <div className={styles.testiAuthor}>
                  <img src={avatar} alt={name} className={styles.testiAvatar} />
                  <div>
                    <span className={styles.testiName}>{name}</span>
                    <span className={styles.testiLoc}><i className="fas fa-map-marker-alt" /> {location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  NEWSLETTER  */}
      <section className={styles.newsletter}>
        <div className={styles.nlOverlay} />
        <div className={`${styles.nlContent} container`}>
          <span className="section-label">Newsletter</span>
          <h2 className={styles.nlTitle}>Get Exclusive Travel Deals</h2>
          <p className={styles.nlSub}>Subscribe and be the first to receive special offers, destination guides, and travel inspiration.</p>
          {subscribed ? (
            <div className={styles.subSuccess}><i className="fas fa-check-circle" /> You are subscribed. Thank you!</div>
          ) : (
            <form className={styles.subForm} onSubmit={handleSubscribe}>
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required className={styles.subInput} />
              <button type="submit" className={`btn btn-primary ${styles.subBtn}`}>Subscribe <i className="fas fa-arrow-right" /></button>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
