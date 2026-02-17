# TravelHub Complete Booking System

A full-stack booking system with admin panel and client-side booking management. Built with Node.js, Express, MongoDB, and modern frontend technologies.

## System Architecture

### Backend (Node.js + Express + MongoDB)
- **Admin Authentication**: JWT-based login system
- **Booking Management**: Full CRUD operations for bookings
- **Service Management**: Admin can create, update, delete services
- **Content Management**: Dynamic content editing for frontend
- **File Upload**: Image upload with multer
- **Security**: Rate limiting, CORS, helmet headers, input validation

### Database (MongoDB)
- **Admin Collection**: Admin accounts with encrypted passwords
- **Booking Collection**: Client bookings with timestamps and status
- **Service Collection**: Available services with pricing and capacity
- **Content Collection**: Editable frontend content

### Frontend
- **Admin Panel** (`admin.html`): Complete admin dashboard
- **Booking Form** (`booking-form.html`): Client booking interface
- **Main Site** (`index.html`): Public website with services showcase

## Installation & Setup

### Prerequisites
- Node.js 14+
- MongoDB 4.4+
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create or update `backend/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/ITravel

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@totalgrandtravel.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrator
```

### 3. Create Admin Account

```bash
# Windows PowerShell
cd backend
$env:MONGO_URI='mongodb://localhost:27017/ITravel'
$env:ADMIN_EMAIL='admin@totalgrandtravel.com'
$env:ADMIN_PASSWORD='admin123'
node scripts/createAdmin.js

# Linux/macOS
cd backend
MONGO_URI="mongodb://localhost:27017/ITravel" \
ADMIN_EMAIL="admin@totalgrandtravel.com" \
ADMIN_PASSWORD="admin123" \
node scripts/createAdmin.js
```

### 4. Create Uploads Directory

```bash
mkdir uploads
```

### 5. Start MongoDB

```bash
# MongoDB should be running on localhost:27017
mongod
```

### 6. Start Backend Server

```bash
cd backend
npm run dev
# or
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Public Endpoints

#### Bookings
- `POST /api/bookings` - Create new booking
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "serviceName": "Service Name",
    "bookingDate": "2026-03-15",
    "bookingTime": "10:00 AM",
    "numberOfPeople": 2,
    "notes": "Special requests"
  }
  ```

#### Services
- `GET /api/services` - Get all available services
- `GET /api/services/:id` - Get single service

#### Content
- `GET /api/content` - Get all public content
- `GET /api/content/:id` - Get single content item

### Admin Endpoints (Require JWT Authentication)

Add header: `Authorization: Bearer <token>`

#### Authentication
- `POST /api/admin/login` - Admin login
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
  Response includes `token` for use in subsequent requests

#### Bookings Management
- `GET /api/admin/bookings` - Get all bookings (supports `?status=pending`)
- `GET /api/admin/bookings/:id` - Get single booking
- `PUT /api/admin/bookings/:id` - Update booking status/notes
  ```json
  {
    "status": "approved",
    "notes": "Confirmed"
  }
  ```
- `DELETE /api/admin/bookings/:id` - Delete booking

#### Services Management
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service

#### Content Management
- `POST /api/admin/content` - Create/update content
- `PUT /api/admin/content/:id` - Update content
- `DELETE /api/admin/content/:id` - Delete content
- `POST /api/admin/upload` - Upload image (multipart/form-data)

## Using the System

### Client Side - Booking a Service

1. **Visit Booking Page**: Open `booking-form.html` in your browser
2. **Select Service**: Click on a service to select it
3. **Fill Booking Form**:
   - Enter full name
   - Enter email address
   - Enter phone number
   - Choose booking date
   - Optionally set preferred time
   - Add any special notes
4. **Submit**: Click "Complete Booking"
5. **Confirmation**: Receive booking ID and confirmation message

### Admin Side - Managing Bookings

1. **Login**: Visit `admin.html`
   - Email: `admin@totalgrandtravel.com`
   - Password: `admin123`
2. **Dashboard**: View statistics
3. **Manage Bookings**:
   - View all bookings
   - Filter by status (pending, approved, cancelled, completed)
   - Edit booking status and notes
   - Delete bookings
4. **Manage Services**:
   - Add new services
   - Edit existing services
   - Set pricing and capacity
   - Upload service images
   - Delete services
5. **Manage Content**:
   - Edit website content
   - Update images
   - Manage text and titles
   - Delete content items

## curl Examples for Testing

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "serviceName": "Mountain Trek",
    "bookingDate": "2026-03-15",
    "numberOfPeople": 2
  }'
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@totalgrandtravel.com",
    "password": "admin123"
  }'
```

### Get All Bookings (with token)
```bash
curl http://localhost:5000/api/admin/bookings \
  -H "Authorization: Bearer <your-token-here>"
```

### Update Booking Status
```bash
curl -X PUT http://localhost:5000/api/admin/bookings/<booking-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d '{
    "status": "approved",
    "notes": "Confirmed and ready"
  }'
```

### Create Service
```bash
curl -X POST http://localhost:5000/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d '{
    "name": "Mountain Trek",
    "description": "5-day mountain hiking adventure",
    "price": 499,
    "duration": "5 days",
    "maxCapacity": 20
  }'
```

## Features

### ✅ Client Features
- [x] Browse available services
- [x] View service details and pricing
- [x] Fill booking form with validation
- [x] Select booking date and time
- [x] Add special notes/requests
- [x] Get booking confirmation with ID
- [x] Responsive mobile-friendly design

### ✅ Admin Features
- [x] Secure login with JWT authentication
- [x] Dashboard with statistics
- [x] View all bookings in table format
- [x] Filter bookings by status
- [x] Edit booking details and status
- [x] Delete bookings
- [x] Create new services
- [x] Edit service details (name, price, capacity)
- [x] Delete services
- [x] Upload service images
- [x] Create and edit website content
- [x] Delete content items
- [x] Real-time updates

### ✅ Security Features
- [x] Password hashing with bcryptjs
- [x] JWT token authentication
- [x] Protected admin routes
- [x] Input validation with express-validator
- [x] Rate limiting
- [x] CORS enabled
- [x] Helmet security headers
- [x] File upload restrictions (images only, 5MB max)

### ✅ Database Features
- [x] MongoDB with Mongoose ODM
- [x] Indexed queries for performance
- [x] Auto timestamps on records
- [x] Unique booking IDs
- [x] Status tracking and filtering
- [x] File path storage for uploads

## Project Structure

```
website-main/
├── admin.html              # Admin panel UI
├── booking-form.html       # Client booking form
├── index.html              # Main website
├── script.js               # Frontend logic
├── style.css               # Styling
├── uploads/                # Uploaded images directory
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── .env                # Environment variables
│   ├── models/
│   │   ├── Admin.js        # Admin schema
│   │   ├── Booking.js      # Booking schema
│   │   ├── Service.js      # Service schema
│   │   └── Content.js      # Content schema
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── serviceController.js
│   │   └── contentController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── upload.js       # Multer config
│   ├── routes/
│   │   ├── admin.js        # Admin API routes
│   │   ├── auth.js         # Auth routes
│   │   ├── bookings.js     # Booking routes
│   │   ├── services.js     # Service routes
│   │   └── content.js      # Content routes
│   └── scripts/
│       └── createAdmin.js  # Admin creation script
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- Verify MongoDB is accessible at `localhost:27017`

### Login Failed
- Create admin account: `node scripts/createAdmin.js`
- Check email and password in `.env`
- Verify MongoDB has Admin collection

### Bookings Not Saving
- Check backend logs for errors
- Verify `bookingDate` format (YYYY-MM-DD)
- Ensure MongoDB connection is active
- Check request body in API call

### CORS Errors
- Verify `CLIENT_URL` in backend `.env`
- Frontend and backend must run on correct ports
- Admin panel: `localhost:5000/admin.html`
- Booking form: `localhost:5000/booking-form.html`

### Image Upload Issues
- Ensure `uploads/` directory exists
- Check file permission on `uploads/` folder
- Verify file is image format (.jpg, .png, .webp)
- Check file size (max 5MB)

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| MONGO_URI | mongodb://localhost:27017/ITravel | MongoDB connection string |
| JWT_SECRET | secret-key-change-in-production | JWT signing secret |
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment type |
| CLIENT_URL | http://localhost:3000 | CORS allowed origin |
| ADMIN_EMAIL | admin@example.com | Default admin email |
| ADMIN_PASSWORD | admin123 | Default admin password |

## Security Recommendations for Production

1. **Change JWT Secret**: Use a long, random string in production
2. **Use HTTPS**: Deploy with SSL/TLS certificates
3. **Database Authentication**: Enable MongoDB authentication
4. **Environment Variables**: Use secure environment variable management
5. **Rate Limiting**: Adjust rate limits based on usage
6. **Admin Panel**: Consider IP whitelisting or VPN access
7. **Backups**: Regular MongoDB backups
8. **Logs**: Monitor and archive server logs
9. **Input Validation**: Review and enhance validation rules
10. **File Uploads**: Implement virus scanning for production

## Support & Contributions

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**License**: Proprietary
