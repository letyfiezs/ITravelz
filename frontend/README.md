# TravelHub Frontend - React Application

A modern, fully responsive React application for the ITravel travel booking platform.

## Features

- 🚀 Built with React 18 and Vite for fast development
- 🎨 Beautiful, responsive UI with dark mode support
- 🌍 Multi-language support (English, Arabic, Spanish)
- 🔐 Secure authentication with JWT tokens
- 📱 Mobile-first responsive design
- ♿ Accessibility features (WCAG compliant)
- 🎯 Modern routing with React Router v6
- 📦 Modular component architecture
- 🎭 Context API for state management
- 🔥 Fast performance with code splitting

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Component styling
- **Context API** - State management

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Forms/           # Form components
│   │   ├── Layout/          # Navbar, Footer
│   │   └── Routes/          # Route guards
│   ├── context/             # Context providers
│   │   ├── AuthContext      # Auth state
│   │   └── LanguageContext  # i18n state
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   │   └── *.module.css
│   ├── services/            # API services
│   ├── styles/              # Global styles
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` if needed:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

The production files will be in the `dist/` folder.

### Preview

Preview the production build locally:
```bash
npm run preview
```

## Component Guide

### Pages
- **Home** - Landing page with tours, destinations, features
- **Login** - User authentication
- **Signup** - User registration
- **Profile** - User profile management
- **Bookings** - View and manage bookings
- **BookingForm** - Create new booking
- **Admin** - Admin dashboard
- **ForgotPassword** - Password reset request
- **ResetPassword** - Password reset
- **VerifyEmail** - Email verification

### Layout Components
- **Navbar** - Navigation with language/theme switcher
- **Footer** - Footer with links
- **Layout** - Main layout wrapper

### Forms
- **ContactForm** - Contact form

## Hooks

### useAuth()
```javascript
const { user, token, isAuthenticated, login, signup, logout, loading, error } = useAuth();
```

### useLanguage()
```javascript
const { language, theme, t, toggleLanguage, toggleTheme } = useLanguage();
```

## API Integration

All API calls are handled through the `services/api.js` file:

```javascript
import { authService, packageService, bookingService } from './services/api';

// Login
const { user, token } = await authService.login(email, password);

// Get packages
const packages = await packageService.getAll();

// Create booking
const booking = await bookingService.create(bookingData);
```

## Styling

The application uses CSS Modules for component styling and global styles for:
- Color variables
- Theme system (light/dark mode)
- Responsive utilities
- Animation keyframes

Access theme variables:
```css
color: var(--color-primary);
background: var(--color-bg-secondary);
```

## Multi-language Support

Translations are managed through the LanguageContext. Add new translations in `context/LanguageContext.jsx`:

```javascript
const translations = {
  en: { /* English */ },
  ar: { /* Arabic */ },
  es: { /* Spanish */ }
};
```

Use translations in components:
```javascript
const { t } = useLanguage();
return <h1>{t('hero_title')}</h1>;
```

## Responsive Design

The application is fully responsive and tested on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with lazy loading
- CSS modules for scoped styles
- Optimized images and assets
- Efficient state management
- Memoized components

## Environment Variables

Create a `.env` file in the root:

```
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### API Connection Issues
- Ensure backend is running on the correct port
- Check VITE_API_URL in .env
- Verify CORS configuration on backend

### Style Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild with `npm run dev`
- Check CSS modules imports

### Auth Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify JWT secret on backend

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please check the main project README or contact the development team.
