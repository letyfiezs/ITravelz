import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useContext';
import { LANGUAGES } from '../../context/LanguageContext';
import styles from './Navbar.module.css';

const NAV_KEYS = [
  { to: '/',              key: 'nav_home'         },
  { to: '/packages',     key: 'nav_tours'         },
  { to: '/destinations', key: 'nav_destinations'  },
  { to: '/contact',      key: 'nav_contact'       },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const [langOpen,  setLangOpen]  = useState(false);
  const dropRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setLangOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '?';

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[1];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}><i className="fas fa-plane-departure" /></span>
          <span className={styles.logoText}>I<em>Travelz</em></span>
        </Link>

        {/* Desktop nav */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          {NAV_KEYS.map(({ to, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {t(key)}
            </NavLink>
          ))}

          {/* Mobile-only auth */}
          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <Link to="/profile" className={`btn btn-secondary btn-sm`}>{t('nav_profile')}</Link>
                <button onClick={handleLogout} className={`btn btn-primary btn-sm`}>{t('nav_signout')}</button>
              </>
            ) : (
              <>
                <Link to="/login"  className={`btn btn-secondary btn-sm`}>{t('nav_signin')}</Link>
                <Link to="/signup" className={`btn btn-primary  btn-sm`}>{t('nav_register')}</Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop right controls */}
        <div className={styles.actions}>
          {/* Language Picker */}
          <div className={styles.langMenu} ref={langRef}>
            <button
              className={styles.langBtn}
              onClick={() => setLangOpen(p => !p)}
              title="Switch language"
              aria-expanded={langOpen}
            >
              <span className={styles.langFlag}>{currentLang.flag}</span>
              <span className={styles.langCode}>{currentLang.code.toUpperCase()}</span>
              <i className={`fas fa-chevron-down ${styles.langChevron} ${langOpen ? styles.langChevronOpen : ''}`} />
            </button>
            {langOpen && (
              <div className={styles.langDropdown}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`${styles.langOption} ${language === lang.code ? styles.langOptionActive : ''}`}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  >
                    <span className={styles.langFlag}>{lang.flag}</span>
                    <span className={styles.langLabel}>{lang.label}</span>
                    {language === lang.code && <i className="fas fa-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className={styles.userMenu} ref={dropRef}>
              <button
                className={styles.avatar}
                onClick={() => setDropOpen(p => !p)}
                aria-expanded={dropOpen}
              >
                {initials}
              </button>
              {dropOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropUser}>
                    <span className={styles.dropName}>{user.name}</span>
                    <span className={styles.dropEmail}>{user.email}</span>
                  </div>
                  <div className={styles.dropDivider} />
                  <Link to="/profile"   className={styles.dropItem}><i className="fas fa-user"/>   {t('nav_profile')}</Link>
                  <Link to="/bookings"  className={styles.dropItem}><i className="fas fa-ticket-alt"/> {t('nav_bookings')}</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin"   className={styles.dropItem}><i className="fas fa-shield-alt"/> {t('nav_admin')}</Link>
                  )}
                  <div className={styles.dropDivider} />
                  <button onClick={handleLogout} className={`${styles.dropItem} ${styles.dropLogout}`}>
                    <i className="fas fa-sign-out-alt"/> {t('nav_signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"  className={styles.signInBtn}>{t('nav_signin')}</Link>
              <Link to="/signup" className={`btn btn-primary btn-sm ${styles.registerBtn}`}>{t('nav_register')}</Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile nav overlay */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
