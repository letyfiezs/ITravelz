# ⚡ QUICK REFERENCE - START & TEST in 5 MINUTES

## 🚀 QUICK START (Copy-Paste Commands)

### Terminal 1 - MongoDB

```powershell
mongod
```

### Terminal 2 - Backend

```powershell
cd c:\Users\User\Music\website-main\backend
node server.js
```

### Terminal 3 - Frontend

```powershell
cd c:\Users\User\Music\website-main
python -m http.server 3000
```

---

## 📱 TEST SIGNUP (30 seconds)

1. **Open:** `http://localhost:3000/login.html`
2. **Click:** "Sign Up" tab
3. **Fill:**
   - Name: Test123
   - Email: test123@example.com
   - Password: Test123456
   - Confirm: Test123456
   - Terms: ✓
4. **Click:** "Create Account"
5. **Check:** Email inbox for verification link

---

## ✅ SUCCESS INDICATORS

| Indicator                               | Status | Meaning               |
| --------------------------------------- | ------ | --------------------- |
| Spinner stops after 2-3s                | ✅     | Backend working       |
| Success message shows                   | ✅     | Signup successful     |
| Email received                          | ✅     | Email service working |
| Browser shows `index.html` after verify | ✅     | Login working         |

---

## ❌ FAILURE CHECKLIST

| Error                                | Fix                             |
| ------------------------------------ | ------------------------------- |
| "Creating..." spinner stuck          | Terminal 2: `node server.js`    |
| "Failed to fetch"                    | Terminal 2: Backend not running |
| "Please provide all required fields" | Check browser F12 console       |
| No email received                    | Check `.env` SMTP settings      |
| Verify link doesn't work             | Check `.env` CLIENT_URL         |
| Can't login after verify             | Check email was verified        |

---

## 🔗 KEY CONNECTIONS

```
Form (login.html)
  → fetch()
  → Backend (http://localhost:5000)
  → MongoDB (localhost:27017)
  → Email (Gmail SMTP)
```

---

## 📊 FILE LOCATIONS

| What            | Where                                       |
| --------------- | ------------------------------------------- |
| Backend code    | `c:\Users\User\Music\website-main\backend\` |
| Frontend code   | `c:\Users\User\Music\website-main\`         |
| Database config | `backend\.env`                              |
| Signup form     | `login.html` (Sign Up tab)                  |
| Email config    | `backend\config\emailService.js`            |

---

## 🧪 DIRECT API TEST

```powershell
# Test signup
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"name":"John","email":"john@test.com","password":"Test123456","confirmPassword":"Test123456"}'

# Should return: {"success":true,...}
```

---

## 💾 CHECK DATABASE

```powershell
# Connect
mongosh

# In MongoDB shell
use travelhub
db.users.find()
db.users.findOne({email:"test@example.com"})

# Check user exists + password is encrypted
```

---

## 🆘 IF SOMETHING BREAKS

**Step 1:** Check all 3 terminals are running

```
Terminal 1: mongod running?
Terminal 2: node server.js running?
Terminal 3: python http.server running?
```

**Step 2:** Check `.env` has values

```powershell
cat backend\.env
# Should have: MONGO_URI, JWT_SECRET, SMTP_USER, SMTP_PASS
```

**Step 3:** Check browser console (F12)

```
Look for: 📝 Form Data Being Sent:
If missing → Frontend error
If present but no response → Backend not running
```

**Step 4:** Check backend console

```
Look for: 📨 Signup Request Received:
If missing → Form data not being sent
If present but error → Database error
```

---

## 📌 REMEMBER

✅ **All 3 must be running:**

- MongoDB (Terminal 1)
- Backend (Terminal 2)
- Frontend (Terminal 3)

✅ **Connection path:**
Frontend → Backend → Database → Email

✅ **Files that matter:**

- `login.html` - Signup form
- `backend/server.js` - Backend
- `backend/.env` - Configuration
- `backend/models/User.js` - Database schema

---

## 🎯 EXPECTED TIMELINE

```
T+0s    User fills form and clicks "Create Account"
T+1s    Backend logs: "📨 Signup Request Received"
T+2s    Backend logs: "✓ User saved to database"
T+3s    Frontend shows: "✓ Account Created Successfully!"
T+5s    Email arrives at inbox
T+10s   User clicks verify link
        isEmailVerified = true in database
        Can now login
```

---

## 📞 WHEN IT WORKS

You'll see:

1. ✅ Form submitted successfully
2. ✅ Success message on frontend
3. ✅ Email in inbox within 5 seconds
4. ✅ User found in MongoDB
5. ✅ Can verify email
6. ✅ Can login and see profile

**Then everything is connected!**
