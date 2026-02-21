import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useContext';
import { Link } from 'react-router-dom';
import ContactForm from '../Forms/ContactForm';
import styles from './Home.module.css';

const Home = () => {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setPackages([
      {
        id: 1,
        name: t('package1_name'),
        description: t('package1_desc'),
        duration: t('package1_duration'),
        price: '$1,500',
        image: 'https://via.placeholder.com/300x200?text=Caribbean',
        tags: [t('tag_tropical'), t('feature_beach')],
        features: [t('feature_beach'), t('feature_lodging'), t('feature_meals')],
      },
      {
        id: 2,
        name: t('package2_name'),
        description: t('package2_desc'),
        duration: t('package2_duration'),
        price: '$2,000',
        image: 'https://via.placeholder.com/300x200?text=Alpine',
        tags: [t('tag_mountain'), t('feature_hiking')],
        features: [t('feature_hiking'), t('feature_camping'), t('feature_guide')],
      },
      {
        id: 3,
        name: t('package3_name'),
        description: t('package3_desc'),
        duration: t('package3_duration'),
        price: '$2,500',
        image: 'https://via.placeholder.com/300x200?text=Civilizations',
        tags: [t('tag_cultural'), t('feature_museum')],
        features: [t('feature_museum'), t('feature_local'), t('feature_guide')],
      },
    ]);
    setLoading(false);
  }, [t]);

  const destinations = [
    {
      id: 1,
      name: t('dest_bali'),
      description: t('dest_bali_desc'),
      image: 'https://via.placeholder.com/300x200?text=Bali',
    },
    {
      id: 2,
      name: t('dest_paris'),
      description: t('dest_paris_desc'),
      image: 'https://via.placeholder.com/300x200?text=Paris',
    },
    {
      id: 3,
      name: t('dest_tokyo'),
      description: t('dest_tokyo_desc'),
      image: 'https://via.placeholder.com/300x200?text=Tokyo',
    },
    {
      id: 4,
      name: t('dest_swiss'),
      description: t('dest_swiss_desc'),
      image: 'https://via.placeholder.com/300x200?text=Alps',
    },
    {
      id: 5,
      name: t('dest_egypt'),
      description: t('dest_egypt_desc'),
      image: 'https://via.placeholder.com/300x200?text=Egypt',
    },
    {
      id: 6,
      name: t('dest_maldives'),
      description: t('dest_maldives_desc'),
      image: 'https://via.placeholder.com/300x200?text=Maldives',
    },
  ];

  const features = [
    {
      icon: 'fa-users',
      title: t('feature1_title'),
      description: t('feature1_desc'),
    },
    {
      icon: 'fa-shield-alt',
      title: t('feature2_title'),
      description: t('feature2_desc'),
    },
    {
      icon: 'fa-dollar-sign',
      title: t('feature3_title'),
      description: t('feature3_desc'),
    },
    {
      icon: 'fa-headset',
      title: t('feature4_title'),
      description: t('feature4_desc'),
    },
    {
      icon: 'fa-handshake',
      title: t('feature5_title'),
      description: t('feature5_desc'),
    },
    {
      icon: 'fa-star',
      title: t('feature6_title'),
      description: t('feature6_desc'),
    },
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('hero_title')}</h1>
          <p className={styles.heroSubtitle}>{t('hero_subtitle')}</p>
          <button className={`btn btn-primary ${styles.ctaButton}`}>
            {t('cta_explore')}
          </button>
        </div>
        <div className={styles.heroImage}>
          <img
            src="https://via.placeholder.com/500x400?text=Travel+Hero"
            alt="Travel Adventure"
          />
        </div>
      </section>

      {/* Tours/Packages Section */}
      <section id="tours" className={styles.toursSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('tours_title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tours_subtitle')}</p>

          {loading ? (
            <div className={styles.loading}>
              <div className="loading"></div>
            </div>
          ) : (
            <div className={styles.packagesGrid}>
              {packages.map((pkg) => (
                <div key={pkg.id} className={styles.packageCard}>
                  <div className={styles.cardImage}>
                    <img src={pkg.image} alt={pkg.name} />
                    <div className={styles.tags}>
                      {pkg.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3>{pkg.name}</h3>
                    <p>{pkg.description}</p>
                    <ul className={styles.features}>
                      {pkg.features.map((feature, i) => (
                        <li key={i}>
                          <i className="fas fa-check"></i> {feature}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.cardFooter}>
                      <div>
                        <div className={styles.duration}>
                          <i className="fas fa-calendar"></i> {t('duration')} {pkg.duration}
                        </div>
                        <div className={styles.price}>
                          {t('price')} {pkg.price}
                        </div>
                      </div>
                      <Link to="/booking/new" className={styles.bookBtn}>
                        {t('btn_book')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className={styles.destinationsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('destinations_title')}</h2>
          <p className={styles.sectionSubtitle}>{t('destinations_subtitle')}</p>

          <div className={styles.destinationsGrid}>
            {destinations.map((dest) => (
              <div key={dest.id} className={styles.destinationCard}>
                <div className={styles.destImage}>
                  <img src={dest.image} alt={dest.name} />
                </div>
                <div className={styles.destContent}>
                  <h3>{dest.name}</h3>
                  <p>{dest.description}</p>
                  <button className={styles.exploreBtn}>
                    {t('cta_explore')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('features_title')}</h2>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('contact_title')}</h2>
          <p className={styles.sectionSubtitle}>{t('contact_subtitle')}</p>

          <div className={styles.contactContent}>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
