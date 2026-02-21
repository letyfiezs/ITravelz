import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav_home: 'Home', nav_tours: 'Tours', nav_destinations: 'Destinations',
    nav_itineraries: 'Itineraries', nav_contact: 'Contact', nav_login: 'Login',
    user_profile: 'My Profile', user_bookings: 'My Bookings', user_logout: 'Sign Out',
  },
  ar: {
    nav_home: 'الرئيسية', nav_tours: 'الجولات', nav_destinations: 'الوجهات',
    nav_itineraries: 'خطط السفر', nav_contact: 'اتصل بنا', nav_login: 'تسجيل الدخول',
    user_profile: 'ملفي', user_bookings: 'حجوزاتي', user_logout: 'تسجيل الخروج',
  },
  es: {
    nav_home: 'Inicio', nav_tours: 'Tours', nav_destinations: 'Destinos',
    nav_itineraries: 'Itinerarios', nav_contact: 'Contacto', nav_login: 'Iniciar sesión',
    user_profile: 'Mi Perfil', user_bookings: 'Mis Reservas', user_logout: 'Cerrar sesión',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const [theme, setTheme]       = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', language);
  }, [theme, language]);

  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key;
  const toggleTheme = () => setTheme((p) => (p === 'light' ? 'dark' : 'light'));
  const toggleLanguage = (lang) => setLanguage(lang);

  return (
    <LanguageContext.Provider value={{ language, theme, t, toggleTheme, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
