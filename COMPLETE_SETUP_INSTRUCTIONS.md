# 🚀 COMPLETE STEP-BY-STEP INSTRUCTIONS TO RUN EVERYTHING

## ⚠️ IMPORTANT: You Need Node.js Installed!

### Check if Node.js is installed:

```powershell
node --version
npm --version
```

If you see errors, **install Node.js from: https://nodejs.org/**

---

## 📋 PREREQUISITE CHECKLIST

Before starting, make sure you have:

- ✅ Node.js installed (check above)
- ✅ MongoDB running locally OR using MongoDB Atlas
- ✅ Gmail App Password configured in `.env` (for email verification)
- ✅ Backend folder has `node_modules` (dependencies installed)

---

## 🎯 RUN EVERYTHING IN THIS EXACT ORDER

### TERMINAL 1: Start MongoDB

```powershell
# If MongoDB is installed locally, run:
mongod

# If using MongoDB Atlas, skip this (just make sure MONGO_URI in .env points to Atlas)
```

**Expected Output:**

```
[initandlisten] waiting for connections on port 27017
```

**⚠️ If mongod command not found:**

- Install MongoDB from: https://www.mongodb.com/try/download/community
- Or create `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travelhub` in `.env` for MongoDB Atlas

---

### TERMINAL 2: Start Backend Server

```powershell
# Navigate to backend folder
cd c:\Users\User\Music\website-main\backend

# Start the server
node server.js
```

**Expected Output:**

```
MongoDB connected
Server running on port 5000
Environment: development
API running at: http://localhost:5000
Client URL: http://localhost:3000
```

**If you see errors:**

- Check `.env` file (MONGO_URI, JWT_SECRET must be set)
- Check MongoDB is running (from Terminal 1)
- Check port 5000 is not in use

---

### TERMINAL 3: Start Frontend Server

```powershell
# Navigate to frontend folder
cd c:\Users\User\Music\website-main

# Start HTTP server on port 3000
python -m http.server 3000
```

**Expected Output:**

```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
```

**If python not found:**

```powershell
# Try python3
python3 -m http.server 3000

# Or use Node.js http-server (if installed)
npx http-server -p 3000
```

---

## 🧪 TEST SIGNUP FLOW

### Step 1: Open Browser

```
http://localhost:3000/login.html
```

You should see the TravelHub login page with 3 tabs:

- Client Login
- Sign Up ← Click this
- Admin Login

### Step 2: Click "Sign Up" Tab

### Step 3: Open Developer Console (F12)

- Press F12 to open DevTools
- Click "Console" tab
- Keep it open to see debug messages

### Step 4: Fill Signup Form

```
Full Name:        Test User
Email:            test2025@example.com
Password:         Test123456
Confirm Password: Test123456
Terms:            ✓ Check the box
```

### Step 5: Click "Create Account" Button

### Step 6: Check Console Messages

**On Frontend Console, you should see:**

```
📝 Form Data Being Sent:
Name: Test User | Length: 9
Email: test2025@example.com | Length: 20
Password: *** | Length: 11
Confirm Password: *** | Length: 11
📦 Full Payload: {"name":"Test User","email":"test2025@example.com","password":"Test123456","confirmPassword":"Test123456"}
```

**On Backend Console (Terminal 2), you should see:**

```
📨 Signup Request Received:
Body: { name: 'Test User', email: 'test2025@example.com', password: 'Test123456', confirmPassword: 'Test123456' }
Name: Test User | Empty? false
Email: test2025@example.com | Empty? false
Password: Test123456 | Empty? false
ConfirmPassword: Test123456 | Empty? false
```

### Step 7: Success Page

If all works, you should see:

```
✓ Account Created Successfully!

A verification email has been sent to your inbox.
Please click the link to verify your email address.

Redirecting to login in 3 seconds...
```

---

## ✉️ EMAIL VERIFICATION

### Check Email Inbox

1. Open your email provider (Gmail, Outlook, etc.)
2. Look for email from: **noreply@travelhub.com**
3. Subject should say: **TravelHub - Verify Your Email**
4. Click the verification link in the email

If email doesn't arrive:

- Check SPAM folder
- Check `.env` file has correct SMTP credentials
- See troubleshooting section below

---

## 🔑 LOGIN AFTER EMAIL VERIFICATION

### Step 1: Go to Login Page

```
http://localhost:3000/login.html
```

### Step 2: Stay on "Client Login" Tab

### Step 3: Enter Credentials

```
Email:    test2025@example.com
Password: Test123456
```

### Step 4: Click "Sign In as Client"

### Expected Result

- ✅ Logged in successfully
- 📍 Redirected to `index.html` (main website)
- 👤 User profile should appear in top-right

---

## 📊 DATABASE VERIFICATION

### Check MongoDB Database

**Using MongoDB Compass (GUI):**

1. Download from: https://www.mongodb.com/products/tools/compass
2. Connect to: `mongodb://localhost:27017`
3. Look for database: `travelhub`
4. Collection: `users`
5. Should see your test user

**Using Command Line:**

```powershell
# Connect to MongoDB
mongosh

# In MongoDB shell:
use travelhub
db.users.find()
db.users.find({ email: "test2025@example.com" })
```

---

## 🔍 TROUBLESHOOTING

### Problem 1: "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Solution:**

```powershell
cd backend
npm install
```

---

### Problem 2: MongoDB connection error

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**

1. Make sure MongoDB is running (Terminal 1: `mongod`)
2. OR change MONGO_URI in `.env` to MongoDB Atlas

**Using MongoDB Atlas Instead:**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travelhub?retryWrites=true&w=majority
```

---

### Problem 3: Email not sending

**Error:** No verification email received

**Cause:** Gmail credentials incorrect or 2FA not enabled

**Solution:**

1. Go to: https://myaccount.google.com/apppasswords
2. Generate new App Password for Gmail
3. Update `SMTP_PASS` in `.env` with the new password
4. Restart backend server

---

### Problem 4: "Please provide all required fields" error

**Cause:** Form fields not matching backend expectations

**Solution:**
Check browser console (F12) for:

```
📝 Form Data Being Sent:
```

If any field shows `EMPTY`, there's a problem with the form.

---

### Problem 5: "Email already registered" error

**Cause:** You already signed up with that email

**Solution:** Use a different email address

---

### Problem 6: Port 5000 already in use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# OR use different port in .env
PORT=5001
```

---

## 🎯 COMPLETE TEST SCENARIO

### Test Case 1: New User Signup

```
✓ Visit http://localhost:3000/login.html
✓ Click "Sign Up" tab
✓ Fill form with new email
✓ Click "Create Account"
✓ Check email for verification link
✓ Click verification link
✓ See "Email verified successfully"
✓ Go back to login page
✓ Login with new credentials
✓ See profile dropdown in top-right
```

### Test Case 2: Check Database

```
✓ Open MongoDB Compass
✓ Navigate to travelhub.users
✓ Find your test user
✓ Verify: isEmailVerified = true
✓ Verify: password is hashed (looks like: $2a$10$...)
```

### Test Case 3: Direct API Test (Using curl)

```powershell
# Signup
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Jane123456","confirmPassword":"Jane123456"}'

# Expected response:
# {"success":true,"message":"Account created...","data":{...}}

# Login (after email verification)
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"jane@example.com","password":"Jane123456"}'

# Expected response:
# {"success":true,"token":"eyJhbGciOi...","data":{...}}
```

---

## 📝 SUMMARY OF CONNECTIONS

| Component       | URL                   | Status              |
| --------------- | --------------------- | ------------------- |
| Frontend        | http://localhost:3000 | ✅ Should work      |
| Backend API     | http://localhost:5000 | ✅ Should work      |
| MongoDB         | localhost:27017       | ✅ Should work      |
| Signup Endpoint | POST /api/auth/signup | ✅ Connected        |
| Login Endpoint  | POST /api/auth/login  | ⚠️ Needs update     |
| Email Service   | Nodemailer + Gmail    | ⚠️ Depends on setup |

---

## ✅ ALL SET!

Once you complete these steps:

1. Backend is running ✅
2. Frontend is running ✅
3. Database is connected ✅
4. Users can signup ✅
5. Email verification works ✅
6. Can login ✅

**All three are LINKED and WORKING TOGETHER!**
