import React from 'react';
import { useLanguage } from '../../hooks/useContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>TravelHub</h3>
          <p>{t('footer_tagline')}</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>{t('footer_links') || 'Quick Links'}</h4>
          <ul>
            <li><a href="/#tours">{t('nav_tours')}</a></li>
            <li><a href="/#destinations">{t('nav_destinations')}</a></li>
            <li><a href="/#itineraries">{t('nav_itineraries')}</a></li>
            <li><a href="/#contact">{t('nav_contact')}</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Contact</h4>
          <p>
            <i className="fas fa-map-marker-alt"></i>
            123 Travel Street, Adventure City
          </p>
          <p>
            <i className="fas fa-phone"></i>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </p>
          <p>
            <i className="fas fa-envelope"></i>
            <a href="mailto:info@travelhub.com">info@travelhub.com</a>
          </p>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} TravelHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
