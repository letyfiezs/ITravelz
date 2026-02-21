import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.col}>
            <Link to="/" className={styles.brand}>
              <span className={styles.brandIcon}><i className="fas fa-paper-plane" /></span>
              <span className={styles.brandText}>I<span>Travelz</span></span>
            </Link>
            <p className={styles.tagline}>Your gateway to extraordinary journeys. We craft unforgettable travel experiences across the globe.</p>
            <div className={styles.socials}>
              {[
                { icon: 'fab fa-facebook-f', href: '#' },
                { icon: 'fab fa-instagram',  href: '#' },
                { icon: 'fab fa-twitter',    href: '#' },
                { icon: 'fab fa-youtube',    href: '#' },
              ].map(({ icon, href }) => (
                <a key={icon} href={href} className={styles.social} target="_blank" rel="noopener noreferrer">
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.list}>
              <li><Link to="/">Home</Link></li>
              <li><a href="/#tours">Tours & Packages</a></li>
              <li><a href="/#destinations">Destinations</a></li>
              <li><a href="/#itineraries">Itineraries</a></li>
              <li><a href="/#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Services</h4>
            <ul className={styles.list}>
              <li><a href="#">Flight Booking</a></li>
              <li><a href="#">Hotel Reservations</a></li>
              <li><a href="#">Tour Packages</a></li>
              <li><a href="#">Travel Insurance</a></li>
              <li><a href="#">24/7 Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Get in Touch</h4>
            <ul className={styles.contactList}>
              <li><i className="fas fa-map-marker-alt" /><span>123 Travel Street, Dubai, UAE</span></li>
              <li><i className="fas fa-phone" /><span>+971 4 000 0000</span></li>
              <li><i className="fas fa-envelope" /><span>hello@itravelz.com</span></li>
            </ul>
            <div className={styles.badge}>
              <i className="fas fa-shield-alt" /> Trusted by 50,000+ travelers
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {year} ITravelz. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
