import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useContext';
import ContactForm from '../components/Forms/ContactForm';
import styles from './Home.module.css';

const destinations = [
  { id: 1, name: 'Dubai',     country: 'UAE',       img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', tag: 'Luxury' },
  { id: 2, name: 'Paris',     country: 'France',    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', tag: 'Romance' },
  { id: 3, name: 'Bali',      country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Adventure' },
  { id: 4, name: 'Tokyo',     country: 'Japan',     img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Culture' },
  { id: 5, name: 'Santorini', country: 'Greece',    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80', tag: 'Scenic' },
  { id: 6, name: 'New York',  country: 'USA',       img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80', tag: 'City' },
];
const packages = [
  { id: 1, name: 'Desert Safari & Luxury Stay', dest: 'Dubai', days: 7,  price: 1299, rating: 4.9, reviews: 312, img: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&q=80' },
  { id: 2, name: 'Romantic Paris Getaway',      dest: 'Paris', days: 5,  price: 1099, rating: 4.8, reviews: 274, img: 'https://images.unsplash.com/photo-1431274172761-fcdab704a698?w=600&q=80' },
  { id: 3, name: 'Bali Spirit and Culture',     dest: 'Bali',  days: 10, price: 899,  rating: 4.9, reviews: 198, img: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80' },
];
const features = [
  { icon: 'fa-headset',        title: '24/7 Support',   desc: 'Round-the-clock assistance wherever you are in the world.' },
  { icon: 'fa-shield-alt',     title: 'Safe and Secure', desc: 'Fully insured trips with vetted partners and transparent pricing.' },
  { icon: 'fa-map-marked-alt', title: 'Expert Guides',  desc: 'Local expert guides with insider knowledge to elevate every journey.' },
  { icon: 'fa-tags',           title: 'Best Price',     desc: 'Price-match guarantee. We beat any comparable package, every time.' },
];
const stats = [
  { value: '50K+', label: 'Happy Travelers' },
  { value: '120+', label: 'Destinations' },
  { value: '15+',  label: 'Years Experience' },
  { value: '4.9',  label: 'Average Rating' },
];

const Home = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className="section-label">Trusted by 50,000+ Travelers</span>
          <h1 className={styles.heroTitle}>Explore the World<br /><span>Your Way</span></h1>
          <p className={styles.heroSub}>Discover handcrafted itineraries, luxury packages, and hidden gems across 120+ destinations worldwide.</p>
          <div className={styles.heroSearch}>
            <div className={styles.searchBox}>
              <i className="fas fa-search" />
              <input type="text" placeholder="Where do you want to go?" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <a href="#tours" className="btn btn-primary btn-lg">Search Tours</a>
          </div>
          <div className={styles.heroBadges}>
            {['No hidden fees', 'Free cancellation', 'Instant confirmation'].map((item) => (
              <span key={item} className={styles.heroBadge}><i className="fas fa-check-circle" /> {item}</span>
            ))}
          </div>
        </div>
        <div className={styles.heroScroll}><span>Scroll to explore</span><i className="fas fa-chevron-down" /></div>
      </section>

      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map(({ value, label }) => (
              <div key={label} className={styles.statItem}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="destinations">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <span className="section-label">Top Picks</span>
              <h2 className="section-title">Popular Destinations</h2>
              <p className="section-subtitle">From iconic landmarks to hidden paradises, find your next dream destination.</p>
            </div>
            <a href="#tours" className="btn btn-outline">View All <i className="fas fa-arrow-right" /></a>
          </div>
          <div className={styles.destGrid}>
            {destinations.map((d) => (
              <div key={d.id} className={styles.destCard}>
                <img src={d.img} alt={d.name} loading="lazy" />
                <div className={styles.destOverlay}>
                  <span className={styles.destTag}>{d.tag}</span>
                  <div className={styles.destInfo}><h3>{d.name}</h3><p><i className="fas fa-map-marker-alt" /> {d.country}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.packSection}`} id="tours">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <span className="section-label">Curated For You</span>
              <h2 className="section-title">Featured Tour Packages</h2>
              <p className="section-subtitle">Expertly crafted packages with everything included.</p>
            </div>
            <Link to="/bookings" className="btn btn-outline">All Packages <i className="fas fa-arrow-right" /></Link>
          </div>
          <div className={styles.packGrid}>
            {packages.map((p) => (
              <div key={p.id} className={styles.packCard}>
                <div className={styles.packImg}>
                  <img src={p.img} alt={p.name} loading="lazy" />
                  <span className={styles.packBadge}>{p.days} Days</span>
                </div>
                <div className={styles.packBody}>
                  <p className={styles.packDest}><i className="fas fa-map-marker-alt" /> {p.dest}</p>
                  <h3 className={styles.packName}>{p.name}</h3>
                  <div className={styles.packMeta}>
                    <span className={styles.rating}><i className="fas fa-star" /> {p.rating} <em>({p.reviews} reviews)</em></span>
                  </div>
                  <div className={styles.packFooter}>
                    <div className={styles.price}><span>From</span><strong>${p.price}</strong><span>/ person</span></div>
                    <Link to="/booking/new" className="btn btn-primary btn-sm">Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div className={styles.whyInner}>
            <div className={styles.whyLeft}>
              <span className="section-label">Why ITravelz</span>
              <h2 className="section-title">Travel With Confidence</h2>
              <p className="section-subtitle">We go beyond booking to deliver seamless, memorable journeys tailored to you.</p>
              <Link to="/signup" className="btn btn-secondary" style={{marginTop:'16px'}}>Start Your Journey <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className={styles.whyRight}>
              {features.map(({ icon, title, desc }) => (
                <div key={title} className={styles.featureCard}>
                  <div className={styles.featureIcon}><i className={`fas ${icon}`} /></div>
                  <div><h4>{title}</h4><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.contactSection}`} id="contact">
        <div className="container">
          <div className={styles.contactInner}>
            <div className={styles.contactLeft}>
              <span className="section-label">Get In Touch</span>
              <h2 className="section-title" style={{color:'#fff'}}>Plan Your Dream Trip</h2>
              <p style={{color:'rgba(255,255,255,.7)',lineHeight:'1.7',margin:'0'}}>Our travel experts are ready to craft the perfect itinerary for you. Drop us a message and we will get back within 24 hours.</p>
              <ul className={styles.contactInfoList}>
                {[
                  { icon: 'fa-envelope', text: 'hello@itravelz.com' },
                  { icon: 'fa-phone',    text: '+971 4 000 0000' },
                  { icon: 'fa-clock',    text: 'Mon to Fri, 9am to 6pm GST' },
                ].map(({ icon, text }) => (<li key={text}><i className={`fas ${icon}`} /><span>{text}</span></li>))}
              </ul>
            </div>
            <div className={styles.contactRight}><ContactForm /></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
