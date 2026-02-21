import React, { createContext, useState, useCallback, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    nav_home: "Home",
    nav_tours: "Tours",
    nav_destinations: "Destinations",
    nav_itineraries: "Itineraries",
    nav_contact: "Contact",
    user_profile: "My Profile",
    user_bookings: "My Bookings",
    user_settings: "Settings",
    user_logout: "Logout",
    hero_title: "Discover Your Next Adventure",
    hero_subtitle: "Explore the world's most beautiful destinations with exclusive travel packages",
    cta_explore: "Explore Now",
    tours_title: "Featured Travel Packages",
    tours_subtitle: "Choose from our carefully curated travel experiences",
    tag_tropical: "Tropical Paradise",
    tag_mountain: "Mountain Adventure",
    tag_cultural: "Cultural Heritage",
    package1_name: "Caribbean Island Escape",
    package1_desc: "Experience pristine beaches, turquoise waters, and tropical culture in the heart of the Caribbean.",
    package1_duration: "7 Days",
    package2_name: "Alpine Peak Trek",
    package2_desc: "Challenge yourself with a breathtaking journey through majestic mountain ranges and remote villages.",
    package2_duration: "10 Days",
    package3_name: "Ancient Civilizations Tour",
    package3_desc: "Immerse yourself in the rich history and culture of ancient civilizations across multiple continents.",
    package3_duration: "12 Days",
    duration: "Duration:",
    price: "From:",
    feature_beach: "Beach activities",
    feature_lodging: "5-star lodging",
    feature_meals: "All meals included",
    feature_guide: "Expert guide",
    feature_hiking: "Expert hiking",
    feature_camping: "Mountain camping",
    feature_museum: "Museum tours",
    feature_local: "Local experiences",
    btn_book: "Book Now",
    destinations_title: "Popular Destinations",
    destinations_subtitle: "Explore handpicked locations around the globe",
    dest_bali: "Bali, Indonesia",
    dest_bali_desc: "Tropical paradise with stunning temples and beaches",
    dest_paris: "Paris, France",
    dest_paris_desc: "The city of love, art, and world-class cuisine",
    dest_tokyo: "Tokyo, Japan",
    dest_tokyo_desc: "Modern marvels blend seamlessly with ancient traditions",
    dest_swiss: "Swiss Alps",
    dest_swiss_desc: "Snow-capped peaks and picturesque mountain villages",
    dest_egypt: "Cairo, Egypt",
    dest_egypt_desc: "Ancient wonders and timeless historical treasures",
    dest_maldives: "Maldives",
    dest_maldives_desc: "Crystal clear waters and luxury island resorts",
    itineraries_title: "Travel Guides & Itineraries",
    itineraries_subtitle: "Detailed guides for unforgettable journeys",
    guide1_title: "European Grand Tour",
    guide1_desc: "A 14-day journey through Europe's most iconic cities",
    guide1_duration: "14 Days",
    guide1_cities: "6 Cities",
    guide1_day1: "Arrive in London, explore Big Ben and Westminster Abbey",
    guide1_day4: "Paris - Eiffel Tower and Louvre Museum",
    guide1_day8: "Amsterdam - Canal tours and Anne Frank House",
    guide1_day10: "Berlin - Historical landmarks and museums",
    guide1_day12: "Vienna - Imperial palaces and classical music",
    guide1_day14: "Return home with unforgettable memories",
    contact_title: "Get in Touch",
    contact_subtitle: "Have questions? We're here to help!",
    form_name: "Your Name",
    form_email: "Your Email",
    form_message: "Your Message",
    form_submit: "Send Message",
    features_title: "Why Choose TravelHub?",
    feature1_title: "Expert Guides",
    feature1_desc: "Our experienced guides ensure unforgettable experiences",
    feature2_title: "Safety First",
    feature2_desc: "Your safety and security are our top priorities",
    feature3_title: "Best Value",
    feature3_desc: "Competitive prices with premium quality service",
    feature4_title: "24/7 Support",
    feature4_desc: "Round-the-clock customer support in multiple languages",
    feature5_title: "Community",
    feature5_desc: "Join thousands of satisfied travelers worldwide",
    feature6_title: "Verified Reviews",
    feature6_desc: "Transparent ratings from real travelers",
    footer_tagline: "Discover the world with confidence and passion",
    login_title: "Welcome Back",
    login_subtitle: "Sign in to your account",
    login_email: "Email Address",
    login_password: "Password",
    login_remember: "Remember me",
    login_forgot: "Forgot password?",
    login_button: "Sign In",
    login_signup: "Don't have an account? Sign up",
    signup_title: "Create Account",
    signup_subtitle: "Join our travel community",
    signup_name: "Full Name",
    signup_email: "Email Address",
    signup_password: "Password",
    signup_confirm: "Confirm Password",
    signup_button: "Create Account",
    signup_login: "Already have an account? Login",
    booking_title: "Book Your Adventure",
    booking_subtitle: "Complete your travel reservation",
    profile_title: "My Profile",
    profile_info: "Profile Information",
    profile_bookings: "My Bookings",
    profile_settings: "Settings",
    profile_about: "About",
    logout: "Logout",
  },
  ar: {
    nav_home: "الرئيسية",
    nav_tours: "الجولات",
    nav_destinations: "الوجهات",
    nav_itineraries: "المسارات",
    nav_contact: "اتصل بنا",
    user_profile: "ملفي الشخصي",
    user_bookings: "حجوزاتي",
    user_settings: "الإعدادات",
    user_logout: "تسجيل الخروج",
    hero_title: "اكتشف مغامرتك القادمة",
    hero_subtitle: "استكشف أجمل وجهات العالم مع حزم السفر الحصرية",
    cta_explore: "اكتشف الآن",
    tours_title: "حزم السفر المميزة",
    tours_subtitle: "اختر من تجارب السفر المختارة بعناية",
    tag_tropical: "جنة استوائية",
    tag_mountain: "مغامرة جبلية",
    tag_cultural: "تراث ثقافي",
    package1_name: "هروب جزيرة البحر الكاريبي",
    package1_desc: "استمتع بالشواطئ الرملية النقية والمياه الزرقاء الفيروزية والثقافة الاستوائية",
    package1_duration: "7 أيام",
    duration: "المدة:",
    price: "من:",
    btn_book: "احجز الآن",
    destinations_title: "الوجهات الشهيرة",
    destinations_subtitle: "استكشف المواقع المختارة بعناية حول العالم",
    dest_bali: "بالي، إندونيسيا",
    dest_bali_desc: "جنة استوائية مع معابد وشواطئ مذهلة",
    contact_title: "تواصل معنا",
    contact_subtitle: "هل لديك أسئلة؟ نحن هنا للمساعدة!",
    form_name: "اسمك",
    form_email: "بريدك الإلكتروني",
    form_message: "رسالتك",
    form_submit: "إرسال الرسالة",
    login_title: "أهلا وسهلا",
    login_subtitle: "سجل الدخول إلى حسابك",
    login_email: "عنوان البريد الإلكتروني",
    login_password: "كلمة المرور",
    login_button: "تسجيل الدخول",
    signup_title: "إنشاء حساب",
    signup_subtitle: "انضم إلى مجتمع السفر لدينا",
    signup_name: "الاسم الكامل",
    logout: "تسجيل الخروج",
  },
  es: {
    nav_home: "Inicio",
    nav_tours: "Tours",
    nav_destinations: "Destinos",
    nav_itineraries: "Itinerarios",
    nav_contact: "Contacto",
    hero_title: "Descubre tu próxima aventura",
    hero_subtitle: "Explora los destinos más hermosos del mundo con paquetes de viaje exclusivos",
    cta_explore: "Explorar ahora",
    tours_title: "Paquetes de viaje destacados",
    tours_subtitle: "Elige entre nuestras experiencias de viaje cuidadosamente seleccionadas",
    btn_book: "Reservar ahora",
    login_title: "Bienvenido",
    login_subtitle: "Inicia sesión en tu cuenta",
    login_email: "Correo electrónico",
    login_password: "Contraseña",
    login_button: "Iniciar sesión",
    logout: "Cerrar sesión",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        theme,
        t,
        toggleLanguage,
        toggleTheme,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
