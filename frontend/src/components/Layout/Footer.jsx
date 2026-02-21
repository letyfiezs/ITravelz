import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      {/* Brand */}
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>
          <i className="fas fa-plane-departure"></i>
          <span>ITravelz</span>
        </Link>
        <p className={styles.tagline}>
          Crafting extraordinary travel experiences since 2020. Let us take you to the world.
        </p>
        <div className={styles.socials}>
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-x-twitter"></i></a>
          <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
        </div>
      </div>

      {/* Explore */}
      <div className={styles.col}>
        <h4>Explore</h4>
        <Link to="/">Home</Link>
        <Link to="/bookings">My Bookings</Link>
        <Link to="/booking/new">Book a Trip</Link>
        <Link to="/profile">Profile</Link>
      </div>

      {/* Destinations */}
      <div className={styles.col}>
        <h4>Destinations</h4>
        <a href="#">Dubai</a>
        <a href="#">Paris</a>
        <a href="#">Bali</a>
        <a href="#">New York</a>
        <a href="#">Tokyo</a>
      </div>

      {/* Contact */}
      <div className={styles.col}>
        <h4>Contact</h4>
        <p><i className="fas fa-envelope"></i> hello@itravelz.com</p>
        <p><i className="fas fa-phone"></i> +1 (800) TRAVELZ</p>
        <p><i className="fas fa-location-dot"></i> 123 Adventure Ave, NY</p>
      </div>
    </div>

    <div className={styles.bottom}>
      <p>© {new Date().getFullYear()} ITravelz. All rights reserved.</p>
      <div className={styles.bottomLinks}>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Cookies</a>
      </div>
    </div>
  </footer>
);

export default Footer;
