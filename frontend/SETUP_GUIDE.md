# React Frontend - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend running on http://localhost:5000
- Git (optional)

### Installation Steps

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Update API URL in `.env` (if needed):**
```
VITE_API_URL=http://localhost:5000/api
```

5. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📚 Project Structure Explained

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── Forms/              # Form components (ContactForm)
│   │   ├── Layout/             # Navbar, Footer, Layout wrapper
│   │   └── Routes/             # PrivateRoute guard
│   │
│   ├── context/                # Global state (Context API)
│   │   ├── AuthContext.jsx     # Authentication state
│   │   └── LanguageContext.jsx # Language/theme state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useContext.js       # useAuth, useLanguage hooks
│   │
│   ├── pages/                  # Page components
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Registration page
│   │   ├── Profile.jsx         # User profile
│   │   ├── Bookings.jsx        # Bookings list
│   │   ├── BookingForm.jsx     # Create booking
│   │   ├── Admin.jsx           # Admin dashboard
│   │   ├── ForgotPassword.jsx  # Password reset request
│   │   ├── ResetPassword.jsx   # Password reset
│   │   ├── VerifyEmail.jsx     # Email verification
│   │   └── NotFound.jsx        # 404 page
│   │
│   ├── services/               # API services
│   │   └── api.js              # Axios instance & API calls
│   │
│   ├── styles/                 # Global styles
│   │   └── global.css          # CSS variables, base styles
│   │
│   ├── App.jsx                 # Root app component
│   └── main.jsx                # React entry point
│
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies & scripts
├── README.md                   # Project documentation
└── .env.example                # Environment template
```

## 🔑 Key Features Implemented

### ✅ Authentication
- User login/signup with JWT tokens
- Protected routes with PrivateRoute component
- Auto token validation on app load
- Password reset & email verification
- Token stored in localStorage

### ✅ Responsive Design
- Mobile-first approach
- Tested on 320px, 768px, 1024px+ screens
- Flexbox and CSS Grid based layouts
- Touch-friendly buttons and inputs

### ✅ Dark Mode & Multi-language
- Toggle dark/light theme
- 3 languages: English, Arabic (RTL), Spanish
- Persistent storage of preferences
- Theme variables throughout app

### ✅ State Management
- Context API for auth and language
- Custom hooks (useAuth, useLanguage)
- No Redux needed - simple & efficient

### ✅ API Integration
- Centralized API service with Axios
- Response interceptors for auth
- Automatic token injection
- Error handling throughout

### ✅ Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Alt text for images

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```
Runs on http://localhost:3000 with hot reload

### Build for Production
```bash
npm run build
```
Creates optimized build in `dist/` folder

### Preview Production Build
```bash
npm run preview
```
Test production build locally

### Format Code
```bash
npm run format
```
Formats code with Prettier

### Lint Code
```bash
npm run lint
```
Check for code issues with ESLint

## 🌐 Connecting to Backend

The frontend connects to the backend API through the `services/api.js` file:

```javascript
// services/api.js
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Update this if your backend runs on a different port:**

`.env`:
```
VITE_API_URL=http://localhost:YOUR_PORT/api
```

### Available API Services

All API calls are organized by feature:

```javascript
import { authService, packageService, bookingService, userService } from './services/api';

// Authentication
await authService.login(email, password)
await authService.register(data)
await authService.forgotPassword(email)

// Bookings
await bookingService.create(data)
await bookingService.getMyBookings()
await bookingService.cancel(id)

// User
await userService.getProfile()
await userService.updateProfile(data)

// Packages
await packageService.getAll()
```

## 📦 Building for Production

### Step 1: Build
```bash
npm run build
```

### Step 2: Test Build
```bash
npm run preview
```
Test at http://localhost:4173

### Step 3: Deploy
Copy the `dist/` folder to your hosting:

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Traditional Server
```bash
# Copy dist folder to server
scp -r dist/ user@server:/var/www/travelhub-frontend
```

For production, update `.env`:
```
VITE_API_URL=https://api.yourdomain.com/api
```

## 🔐 Environment Variables

Create `.env` file with:

```env
# Development
VITE_API_URL=http://localhost:5000/api

# Production
# VITE_API_URL=https://api.yourdomain.com/api
```

## 📱 Testing Responsive Design

Test on different screen sizes in Chrome DevTools:
- Mobile: 320px, 375px, 425px
- Tablet: 768px, 820px
- Desktop: 1024px, 1440px, 1920px

## 🐛 Troubleshooting

### Hot Reload Not Working
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API Connection Error
- Check backend is running: `http://localhost:5000`
- Verify VITE_API_URL in `.env`
- Check CORS settings on backend

### Login Issues
- Clear localStorage: `localStorage.clear()`
- Check token in browser DevTools
- Verify backend auth endpoint

### Build Fails
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3001
```

## 📊 Performance Tips

1. **Images**: Use optimized formats (WebP, lazy loading)
2. **Code Splitting**: Already enabled with lazy routes
3. **Bundle Size**: Check with `npm run build`
4. **Caching**: Use .env for cache busting

## 🔄 Updating Dependencies

Check for updates:
```bash
npm outdated
```

Update safely:
```bash
npm update
```

## 📝 Adding New Pages

1. Create file in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout/Navbar.jsx`
4. Create CSS module: `NewPage.module.css`

Example:
```javascript
// src/pages/NewPage.jsx
import styles from './NewPage.module.css';

export default function NewPage() {
  return <div className={styles.container}>Content</div>;
}
```

```javascript
// src/App.jsx
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

## 🎨 Styling Guide

### Theme Colors
Access in CSS:
```css
background: var(--color-primary);    /* #3b82f6 */
color: var(--color-text-primary);    /* #333333 */
border: 1px solid var(--color-border); /* #e5e7eb */
```

### Dark Mode
Automatically applied when `html[data-theme="dark"]` is set.

### Utilities
```css
.card { /* Predefined card styles */ }
.btn-primary { /* Primary button */ }
.loading { /* Loading spinner */ }
.error { /* Error message */ }
```

## 📞 Support

For issues:
1. Check this guide first
2. Check [README.md](README.md)
3. Review error messages in browser console
4. Check Network tab in DevTools

## ✨ Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure API URL: Update `.env`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test features: Navigate app
5. ✅ Build for production: `npm run build`
6. ✅ Deploy to hosting

**Happy coding! 🚀**
