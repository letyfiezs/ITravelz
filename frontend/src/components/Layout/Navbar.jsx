import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useContext';
import { useLanguage } from '../../hooks/useContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, toggleLanguage, theme, toggleTheme } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}><i className="fas fa-paper-plane" /></span>
          <span className={styles.brandText}>I<span>Travelz</span></span>
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.links}>
          {[
            { to: '/', label: t('nav_home') || 'Home' },
            { to: '/#tours', label: t('nav_tours') || 'Tours', hash: true },
            { to: '/#destinations', label: t('nav_destinations') || 'Destinations', hash: true },
            { to: '/#itineraries', label: t('nav_itineraries') || 'Itineraries', hash: true },
            { to: '/#contact', label: t('nav_contact') || 'Contact', hash: true },
          ].map(({ to, label, hash }) => (
            <li key={to}>
              {hash
                ? <a href={to} className={styles.link}>{label}</a>
                : <Link to={to} className={`${styles.link} ${isActive(to) ? styles.linkActive : ''}`}>{label}</Link>
              }
            </li>
          ))}
        </ul>

        {/* Controls */}
        <div className={styles.controls}>
          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`} />
          </button>
          <button className={styles.iconBtn} onClick={() => toggleLanguage(language === 'en' ? 'ar' : language === 'ar' ? 'es' : 'en')} title="Change language" aria-label="Change language">
            <i className="fas fa-globe" />
          </button>

          {isAuthenticated ? (
            <div className={styles.userWrap} ref={dropRef}>
              <button className={styles.avatar} onClick={() => setDropOpen(!dropOpen)}>
                <span className={styles.avatarInitial}>{(user?.name?.[0] || 'U').toUpperCase()}</span>
                <i className={`fas fa-chevron-${dropOpen ? 'up' : 'down'}`} />
              </button>
              {dropOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropHeader}>
                    <strong>{user?.name || 'User'}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <div className={styles.dropDivider} />
                  <Link to="/profile"  className={styles.dropItem} onClick={() => setDropOpen(false)}><i className="fas fa-user" /> My Profile</Link>
                  <Link to="/bookings" className={styles.dropItem} onClick={() => setDropOpen(false)}><i className="fas fa-calendar-alt" /> My Bookings</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className={styles.dropItem} onClick={() => setDropOpen(false)}><i className="fas fa-shield-alt" /> Admin Panel</Link>
                  )}
                  <div className={styles.dropDivider} />
                  <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={() => { logout(); setDropOpen(false); }}>
                    <i className="fas fa-sign-out-alt" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
              <i className="fas fa-sign-in-alt" /> Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <ul>
          {[
            { to: '/', label: 'Home' },
            { to: '/#tours', label: 'Tours', hash: true },
            { to: '/#destinations', label: 'Destinations', hash: true },
            { to: '/#contact', label: 'Contact', hash: true },
          ].map(({ to, label, hash }) => (
            <li key={to}>
              {hash
                ? <a href={to} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{label}</a>
                : <Link to={to} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{label}</Link>
              }
            </li>
          ))}
          {!isAuthenticated && (
            <li><Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
