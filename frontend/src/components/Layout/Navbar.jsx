import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useContext';
import { useLanguage } from '../../hooks/useContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoIcon}><i className="fas fa-plane-departure"></i></span>
          <span className={styles.logoText}>ITravelz</span>
        </Link>

        {/* Desktop nav links */}
        <nav className={styles.links}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
          <NavLink to="/bookings" className={({ isActive }) => isActive ? styles.active : ''}>Bookings</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? styles.active : ''}>Admin</NavLink>
          )}
        </nav>

        {/* Right section */}
        <div className={styles.right}>
          {/* Language toggle */}
          <button className={styles.langBtn} onClick={toggleLanguage} title="Change language">
            <i className="fas fa-globe"></i>
            <span>{language.toUpperCase()}</span>
          </button>

          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.avatar}
                onClick={() => setDropdownOpen(v => !v)}
                aria-expanded={dropdownOpen}
              >
                {initials}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <Link to="/bookings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-suitcase"></i> My Bookings
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-shield-halved"></i> Admin Panel
                    </Link>
                  )}
                  <hr className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <i className="fas fa-right-from-bracket"></i> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
              <Link to="/signup" className={styles.signupBtn}>Sign up</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/bookings" onClick={() => setMenuOpen(false)}>Bookings</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
