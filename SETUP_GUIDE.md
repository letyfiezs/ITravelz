# INSTALLATION & SETUP GUIDE

## Backend Setup

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

This will install all required packages:

- Express.js - Web framework
- MongoDB/Mongoose - Database
- Nodemailer - Email service
- JWT - Authentication
- bcryptjs - Password hashing
- dotenv - Environment variables
- CORS - Cross-origin support
- Helmet - Security headers
- Express Rate Limit - API rate limiting

### 2. Configure Environment Variables

Copy the example .env file and add your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/travelhub

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRE=7d

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

FROM_EMAIL=noreply@travelhub.com
FROM_NAME=TravelHub

# Server Configuration
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@travelhub.com
ADMIN_PASSWORD=admin123

BOOKING_CONFIRMATION_REQUIRED=true
```

### 3. Setup Gmail for Email Sending

1. Go to https://myaccount.google.com/security
2. Look for "App passwords" section
3. If 2FA is not enabled, enable it first
4. Go to https://myaccount.google.com/apppasswords
5. Select "Mail" and "Windows Computer"
6. Click "Generate"
7. Copy the 16-character password generated
8. Paste it into `SMTP_PASS` in your `.env` file

### 4. Setup MongoDB Database

**Option A: Local MongoDB**

```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add to `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travelhub
   ```

### 5. Start the Backend Server

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server will run on `http://localhost:5000`

You should see:

```
Server running on port 5000
Environment: development
MongoDB connected
Email service ready
```

---

## Frontend Setup

### 1. Update API URL

In your frontend files, update the API_URL to match your backend:

```javascript
const API_URL = "http://localhost:5000/api";
```

Update in:

- `login.html` - Line with API_URL variable
- `signup.html` - Line with API_URL variable
- `script.js` - For any API calls

### 2. Add Links to Navigation

Update login.html to include links to signup and password reset:

```html
<!-- In login.html tab content -->
<div class="auth-footer">
  Don't have an account? <a href="signup.html">Sign up here</a>
</div>

<!-- Password reset link -->
<a class="forgot-password" href="forgot-password.html">Forgot Password?</a>
```

### 3. Update index.html Navigation

Add signup link to the navbar:

```html
<a href="signup.html" class="nav-link">Sign Up</a>
```

---

## Testing the System

### Test User Registration

1. Go to `http://localhost:3000/signup.html`
2. Fill in the form with:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `TestPass123!`
3. Click "Create Account"
4. Check your email for verification link
5. Click the verification link
6. You'll be redirected to login

### Test Login

1. Go to `http://localhost:3000/login.html`
2. Use the client tab:
   - Email: `john@example.com`
   - Password: `TestPass123!`
3. Click "Sign In as Client"
4. You should be redirected to the website dashboard

### Test Forgot Password

1. Go to `http://localhost:3000/forgot-password.html`
2. Enter your registered email
3. Check email for password reset link
4. Click the link (valid for 30 minutes)
5. Enter your new password
6. Login with new password

### Test Booking with Email

1. Login to the website
2. Click "Book Now" on any package
3. Fill in booking details
4. Submit the booking
5. Check email for booking confirmation

---

## API Testing with Postman

### 1. Create a Collection

Import these requests into Postman:

#### Sign Up

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "TestPass123!",
  "confirmPassword": "TestPass123!"
}
```

#### Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "TestPass123!"
}
```

Save the returned `token` to use in auth headers

#### Create Booking

```
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "packageId": "pkg_001",
  "packageName": "Caribbean Island Escape",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "numberOfPeople": 2,
  "travelDate": "2026-06-15",
  "duration": "7 Days",
  "price": 1299,
  "specialRequests": "Window seat preferred"
}
```

---

## File Structure

```
backend/
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── API_DOCUMENTATION.md         # Complete API docs
├── config/
│   └── emailService.js         # Email configuration
├── models/
│   ├── User.js                 # User schema
│   ├── Booking.js              # Booking schema
│   └── Package.js              # Package schema
├── controllers/
│   ├── authController.js       # Auth logic
│   └── bookingController.js    # Booking logic
├── routes/
│   ├── auth.js                 # Auth endpoints
│   └── bookings.js             # Booking endpoints
└── middleware/
    └── auth.js                 # JWT verification

frontend/
├── index.html                   # Main website
├── login.html                   # Login page
├── signup.html                  # Signup page
├── verify-email.html           # Email verification
├── forgot-password.html        # Forgot password
├── reset-password.html         # Reset password
├── admin.html                  # Admin panel
├── script.js                   # Website logic
├── style.css                   # Website styles
├── admin-script.js             # Admin logic
└── admin-style.css             # Admin styles
```

---

## Troubleshooting

### MongoDB Connection Error

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Email Not Sending

```
Error: Invalid login: 534, https://accounts.google.com/signin/continue?...
```

**Solution:**

1. Enable 2-Factor Authentication on Gmail
2. Generate new App Password
3. Update `.env` with the new password
4. Restart the server

### CORS Error

```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Solution:** Check `.env` CLIENT_URL matches your frontend URL:

```env
CLIENT_URL=http://localhost:3000
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Use a different port:

```env
PORT=5001
```

---

## Email Templates

The system includes beautiful email templates for:

1. **Email Verification**
   - Professional TravelHub branding
   - 24-hour expiration timer
   - Direct verification link

2. **Welcome Email**
   - Sent after email verification
   - Lists features available

3. **Password Reset**
   - 30-minute expiration
   - Security warnings
   - Clear reset instructions

4. **Booking Confirmation**
   - Booking reference number
   - Complete booking details
   - Next steps information

---

## Security Features

✅ **Password Security**

- Bcryptjs hashing (10 salt rounds)
- Strong password requirements
- Password strength indicator

✅ **Email Verification**

- Hashed verification tokens
- 24-hour expiration
- Prevents spam accounts

✅ **Password Reset**

- Hashed reset tokens
- 30-minute expiration
- Email verification required

✅ **JWT Authentication**

- Secure token-based auth
- Automatic token expiration
- Protected endpoints

✅ **API Security**

- CORS protection
- Rate limiting (100 requests per 15 min)
- Security headers (Helmet.js)
- Input validation

---

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update NODE_ENV to "production"
- [ ] Use production MongoDB URL
- [ ] Set up production email domain
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Setup backups for database
- [ ] Enable rate limiting
- [ ] Setup error logging
- [ ] Configure monitoring
- [ ] Test all email flows
- [ ] Update API_URL and CLIENT_URL

---

## Support & Documentation

- **API Docs:** See `API_DOCUMENTATION.md`
- **Email Setup:** See Gmail configuration section
- **Database Models:** See `models/` directory
- **Email Templates:** See `config/emailService.js`

---

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# View logs
tail -f logs/error.log

# Test API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!","confirmPassword":"Test123!"}'
```

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** Production Ready
