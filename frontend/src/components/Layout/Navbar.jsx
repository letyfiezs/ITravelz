import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useContext';
import { useLanguage } from '../../hooks/useContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, toggleLanguage, theme, toggleTheme } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navBrand}>
          <i className="fas fa-globe"></i> TravelHub
        </Link>

        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </button>

        <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
          <li>
            <Link
              to="/"
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav_home')}
            </Link>
          </li>
          <li>
            <a href="/#tours" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              {t('nav_tours')}
            </a>
          </li>
          <li>
            <a href="/#destinations" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              {t('nav_destinations')}
            </a>
          </li>
          <li>
            <a href="/#itineraries" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              {t('nav_itineraries')}
            </a>
          </li>
          <li>
            <a href="/#contact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              {t('nav_contact')}
            </a>
          </li>
        </ul>

        <div className={styles.navControls}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle dark/light mode"
          >
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>

          <select
            value={language}
            onChange={(e) => toggleLanguage(e.target.value)}
            className={styles.langSelect}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="es">Español</option>
          </select>

          {isAuthenticated ? (
            <div className={styles.userProfile}>
              <button
                className={styles.userBtn}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-label="User menu"
              >
                <i className="fas fa-user-circle"></i>
                <span>{user?.name || 'User'}</span>
              </button>

              {isUserDropdownOpen && (
                <div className={styles.userDropdown}>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user"></i> {t('user_profile')}
                  </Link>
                  <Link
                    to="/bookings"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-calendar"></i> {t('user_bookings')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <i className="fas fa-cog"></i> Admin Panel
                    </Link>
                  )}
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i> {t('user_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.btnSecondary}>
                {t('nav_login') || 'Login'}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
