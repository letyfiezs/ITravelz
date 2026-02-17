# TravelHub Backend - API Documentation

## Overview

Complete backend system for TravelHub travel agency website with authentication, email verification, password reset, and booking management.

## Setup Instructions

### 1. Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- Gmail account with App Password (for email service)

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Configure the `.env` file with your settings:

```env
# Database
MONGO_URI=mongodb://localhost:27017/travelhub

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

FROM_EMAIL=noreply@travelhub.com
FROM_NAME=TravelHub

# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@travelhub.com
ADMIN_PASSWORD=admin123
```

### 4. Getting Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Generate and copy the 16-character password
4. Use this as `SMTP_PASS` in your `.env` file

### 5. Start the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. **Sign Up**

- **POST** `/api/auth/signup`
- **Description**: Register a new user account
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false
  }
}
```

#### 2. **Verify Email**

- **GET** `/api/auth/verify-email?token=verification_token&email=user@example.com`
- **Description**: Verify user email from verification link
- **Response**:

```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

#### 3. **Login**

- **POST** `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true
  }
}
```

#### 4. **Forgot Password**

- **POST** `/api/auth/forgot-password`
- **Description**: Request password reset link
- **Body**:

```json
{
  "email": "john@example.com"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Password reset link sent to your email. Check your inbox."
}
```

#### 5. **Reset Password**

- **POST** `/api/auth/reset-password`
- **Description**: Reset password using token from email
- **Body**:

```json
{
  "token": "reset_token_from_email",
  "email": "john@example.com",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Password reset successfully! You can now login with your new password."
}
```

#### 6. **Get Profile** (Protected)

- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "isEmailVerified": true,
    "role": "user"
  }
}
```

#### 7. **Update Profile** (Protected)

- **PUT** `/api/auth/profile`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:

```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

#### 8. **Change Password** (Protected)

- **PUT** `/api/auth/change-password`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Booking Routes (`/api/bookings`)

#### 1. **Create Booking**

- **POST** `/api/bookings`
- **Description**: Create a new booking
- **Body**:

```json
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

- **Response**:

```json
{
  "success": true,
  "message": "Booking created successfully! Confirmation email sent.",
  "data": {
    "bookingId": "BK1613098765432",
    "packageName": "Caribbean Island Escape",
    "customerName": "John Doe",
    "status": "confirmed",
    "totalPrice": 2598,
    "travelDate": "2026-06-15T00:00:00.000Z"
  }
}
```

#### 2. **Get All Bookings** (Admin - Protected)

- **GET** `/api/bookings`
- **Query Parameters**: `status=confirmed&paymentStatus=completed`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

#### 3. **Get User Bookings** (Protected)

- **GET** `/api/bookings/my-bookings`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "count": 2,
  "data": [ ... ]
}
```

#### 4. **Get Single Booking** (Protected)

- **GET** `/api/bookings/:id`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "data": { ... }
}
```

#### 5. **Update Booking** (Protected)

- **PUT** `/api/bookings/:id`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:

```json
{
  "status": "confirmed",
  "paymentStatus": "completed",
  "notes": "Customer confirmed arrival details"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": { ... }
}
```

#### 6. **Cancel Booking** (Protected)

- **PATCH** `/api/bookings/:id/cancel`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": { ... }
}
```

#### 7. **Delete Booking** (Admin - Protected)

- **DELETE** `/api/bookings/:id`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Response**:

```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

## Email Features

### 1. **Signup Verification Email**

- Sent when user signs up
- Contains verification link (valid for 24 hours)
- Professional HTML template with TravelHub branding

### 2. **Welcome Email**

- Sent after email verification
- Confirms account activation
- Lists available features

### 3. **Password Reset Email**

- Sent on forgot password request
- Contains reset link (valid for 30 minutes)
- Security warning about link expiration

### 4. **Booking Confirmation Email**

- Sent immediately after booking creation
- Contains booking details and reference number
- Professional template with booking summary

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid token)
- **403**: Forbidden (email not verified)
- **404**: Not Found
- **500**: Server Error

---

## Testing with cURL

### Create User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "pkg_001",
    "packageName": "Caribbean Island Escape",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "numberOfPeople": 2,
    "travelDate": "2026-06-15",
    "duration": "7 Days",
    "price": 1299
  }'
```

---

## Database Models

### User Schema

- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `phone`: String
- `address`: String
- `city`: String
- `country`: String
- `isEmailVerified`: Boolean
- `emailVerificationToken`: String
- `passwordResetToken`: String
- `passwordResetExpires`: Date
- `role`: Enum['user', 'admin']
- `createdAt`: Date
- `updatedAt`: Date

### Booking Schema

- `bookingId`: String (unique)
- `userId`: ObjectId (ref: User)
- `packageId`: String
- `packageName`: String
- `customerName`: String
- `customerEmail`: String
- `customerPhone`: String
- `numberOfPeople`: Number
- `travelDate`: Date
- `duration`: String
- `price`: Number
- `totalPrice`: Number
- `specialRequests`: String
- `status`: Enum['pending', 'confirmed', 'cancelled', 'completed']
- `paymentStatus`: Enum['pending', 'completed', 'failed', 'refunded']
- `notes`: String
- `createdAt`: Date
- `updatedAt`: Date

---

## Troubleshooting

### Email Not Sending

1. Check `.env` file has correct SMTP credentials
2. Verify Gmail App Password is correct
3. Check MongoDB connection
4. Look at server console logs for error messages

### Token Expired

1. Login again to get a new token
2. Use the token in Authorization header as: `Bearer token_here`

### Database Connection Error

1. Ensure MongoDB is running
2. Check `MONGO_URI` in `.env` file
3. Verify database server is accessible

---

## Security Features

✅ Password hashing with bcryptjs  
✅ JWT-based authentication  
✅ Email verification on signup  
✅ Secure password reset via email tokens  
✅ Rate limiting on all endpoints  
✅ CORS protection  
✅ Security headers with Helmet  
✅ Input validation and sanitization

---

## Support

For issues or questions, please contact: support@travelhub.com
