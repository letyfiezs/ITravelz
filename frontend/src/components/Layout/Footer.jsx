import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const explore = [
  { to: '/', label: 'Home' },
  { to: '/packages', label: 'Tour Packages' },
  { to: '/services', label: 'Destinations' },
  { to: '/itineraries', label: 'Itineraries' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const destinations = ['Bali, Indonesia', 'Paris, France', 'Santorini, Greece', 'Tokyo, Japan', 'New York, USA', 'Cape Town, SA'];

const socials = [
  { icon: 'fab fa-facebook-f', href: '#', label: 'Facebook' },
  { icon: 'fab fa-instagram',  href: '#', label: 'Instagram' },
  { icon: 'fab fa-twitter',    href: '#', label: 'Twitter' },
  { icon: 'fab fa-youtube',    href: '#', label: 'YouTube' },
  { icon: 'fab fa-tiktok',     href: '#', label: 'TikTok' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}><i className="fas fa-plane-departure"/></span>
            <span className={styles.logoText}>I<em>Travelz</em></span>
          </Link>
          <p className={styles.tagline}>
            Crafting extraordinary journeys around the world. Let us turn your travel dreams into unforgettable memories.
          </p>
          <div className={styles.socials}>
            {socials.map(({ icon, href, label }) => (
              <a key={label} href={href} className={styles.social} aria-label={label} target="_blank" rel="noreferrer">
                <i className={icon}/>
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Explore</h4>
          <ul className={styles.colList}>
            {explore.map(({ to, label }) => (
              <li key={to}><Link to={to} className={styles.colLink}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Destinations */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Destinations</h4>
          <ul className={styles.colList}>
            {destinations.map(d => (
              <li key={d}><span className={styles.colLink}>{d}</span></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li><i className="fas fa-map-marker-alt"/><span>123 Travel Lane, Wanderlust City</span></li>
            <li><i className="fas fa-phone"/><a href="tel:+1234567890">+1 (234) 567-890</a></li>
            <li><i className="fas fa-envelope"/><a href="mailto:hello@itravelz.com">hello@itravelz.com</a></li>
            <li><i className="fas fa-clock"/><span>Mon  Fri: 9 AM  6 PM</span></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} ITravelz. All rights reserved.</p>
          <div className={styles.legal}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
