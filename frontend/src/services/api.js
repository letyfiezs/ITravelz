import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login:         (data) => api.post('/auth/login', data),
  register:      (data) => api.post('/auth/register', data),
  validateToken: ()     => api.get('/auth/validate'),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail:   (token) => api.get(`/auth/verify-email/${token}`),
};

export const packageService = {
  getAll:   (params) => api.get('/packages', { params }),
  getById:  (id)     => api.get(`/packages/${id}`),
  create:   (data)   => api.post('/packages', data),
  update:   (id, data) => api.put(`/packages/${id}`, data),
  delete:   (id)     => api.delete(`/packages/${id}`),
};

export const bookingService = {
  getAll:   (params) => api.get('/bookings/my-bookings', { params }),
  getById:  (id)     => api.get(`/bookings/${id}`),
  create:   (data)   => api.post('/bookings', data),
  update:   (id, data) => api.put(`/bookings/${id}`, data),
  cancel:   (id)     => api.patch(`/bookings/${id}/cancel`),
};

export const userService = {
  getProfile:    ()     => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword:(data) => api.put('/auth/change-password', data),
};

export const contactService = {
  send: (data) => api.post('/contact', data),
};

export const itineraryService = {
  getAll:  (params) => api.get('/itineraries', { params }),
  getById: (id)     => api.get(`/itineraries/${id}`),
};

export const serviceService = {
  getAll:  () => api.get('/services'),
};

export const contentService = {
  getAll:  () => api.get('/content'),
  update:  (id, data) => api.put(`/content/${id}`, data),
};

export const adminService = {
  getStats:    () => api.get('/admin/stats'),
  getUsers:    () => api.get('/admin/users'),
  getBookings: () => api.get('/admin/bookings'),
  updateBookingStatus: (id, status) => api.patch(`/admin/bookings/${id}`, { status }),
};

export default api;
