import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useContext';
import styles from './Shop.module.css';

const FEATURED = [
  { icon: 'fas fa-tshirt',       label: 'Mongolian Apparel',   desc: 'Traditional deel, modern streetwear & souvenirs' },
  { icon: 'fas fa-gem',          label: 'Handcrafted Jewelry', desc: 'Silver, coral and turquoise from Mongolian artisans' },
  { icon: 'fas fa-book',         label: 'Travel Guides',       desc: 'Maps, phrasebooks and coffee-table books about Mongolia' },
  { icon: 'fas fa-camera',       label: 'Photography Prints',  desc: 'Stunning prints of the Mongolian landscape' },
];

export default function Shop() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">{t('nav_shop') || 'Shop'}</span>
          <h1 className={styles.heroTitle}>{t('page_shop') || 'ITravelz Shop'}</h1>
          <p className={styles.heroSub}>Authentic Mongolian goods, travel accessories &amp; more</p>
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        {/* Coming soon badge */}
        <div className={styles.comingSoon}>
          <div className={styles.csIcon}><i className="fas fa-store" /></div>
          <h2 className={styles.csTitle}>Opening Soon</h2>
          <p className={styles.csText}>
            We are curating a collection of authentic Mongolian products, handcrafted souvenirs and
            exclusive travel gear. Be the first to know when the shop goes live!
          </p>
          <Link to="/contact" className="btn btn-primary">
            <i className="fas fa-bell" /> Notify Me
          </Link>
        </div>

        {/* Preview categories */}
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>What to Expect</h3>
          <div className={styles.previewGrid}>
            {FEATURED.map(item => (
              <div key={item.label} className={styles.previewCard}>
                <div className={styles.previewIcon}><i className={item.icon} /></div>
                <h4>{item.label}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
