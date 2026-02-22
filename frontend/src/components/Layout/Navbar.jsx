import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/',             label: 'Home'         },
  { to: '/packages',    label: 'Tours'         },
  { to: '/destinations',label: 'Destinations'  },
  { to: '/itineraries', label: 'Itineraries'   },
  { to: '/contact',     label: 'Contact'       },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '?';

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
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile-only auth */}
          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <Link to="/profile" className={`btn btn-secondary btn-sm`}>My Profile</Link>
                <button onClick={handleLogout} className={`btn btn-primary btn-sm`}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login"  className={`btn btn-secondary btn-sm`}>Sign In</Link>
                <Link to="/signup" className={`btn btn-primary  btn-sm`}>Register</Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop right controls */}
        <div className={styles.actions}>
          <button
            className={styles.langBtn}
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            title="Switch language"
          >
            <i className="fas fa-globe" />
            <span>{language.toUpperCase()}</span>
          </button>

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
                  <Link to="/profile"   className={styles.dropItem}><i className="fas fa-user"/>   Profile</Link>
                  <Link to="/bookings"  className={styles.dropItem}><i className="fas fa-ticket-alt"/> My Bookings</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin"   className={styles.dropItem}><i className="fas fa-shield-alt"/> Admin</Link>
                  )}
                  <div className={styles.dropDivider} />
                  <button onClick={handleLogout} className={`${styles.dropItem} ${styles.dropLogout}`}>
                    <i className="fas fa-sign-out-alt"/> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"  className={styles.signInBtn}>Sign In</Link>
              <Link to="/signup" className={`btn btn-primary btn-sm ${styles.registerBtn}`}>Register</Link>
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
