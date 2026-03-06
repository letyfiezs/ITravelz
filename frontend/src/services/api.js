import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  validateToken: () => api.get("/auth/validate"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

export const packageService = {
  getAll: (params) => api.get("/packages", { params }),
  getById: (id) => api.get(`/packages/${id}`),
  getAvailability: (id, params) =>
    api.get(`/packages/${id}/availability`, { params }),
  create: (data) => api.post("/packages", data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

export const bookingService = {
  getAll: (params) => api.get("/bookings/my-bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByRef: (bookingId) =>
    api.get(`/bookings/pay/${encodeURIComponent(bookingId)}`),
  createCheckoutSession: (data) => api.post("/bookings/create-checkout-session", data),
  verifyCheckout: (data) => api.post("/bookings/verify-checkout", data),
  create: (data) => api.post("/bookings", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

export const userService = {
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  uploadAvatar: (formData) =>
    api.post("/auth/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  completeGoogleSignup: (phone, token) =>
    api.put(
      "/auth/google/complete",
      { phone },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};

export const contactService = {
  send: (data) => api.post("/contact", data),
};

export const itineraryService = {
  getAll: (params) => api.get("/itineraries", { params }),
  getById: (id) => api.get(`/itineraries/${id}`),
};

export const destinationService = {
  getAll: (params) => api.get("/destinations", { params }),
  getById: (id) => api.get(`/destinations/${id}`),
};

export const serviceService = {
  getAll: () => api.get("/services"),
};

export const contentService = {
  getAll: (params) => api.get("/content", { params }),
  update: (id, data) => api.put(`/content/${id}`, data),
};

export const festivalService = {
  getAll: (params) => api.get("/festivals", { params }),
  getById: (id) => api.get(`/festivals/${id}`),
};

export const aboutService = {
  getAll: (params) => api.get("/about", { params }),
  getById: (id) => api.get(`/about/${id}`),
};

export const chatService = {
  send: (message, history) => api.post("/chat", { message, history }),
};

export const adminService = {
  getStats: () => api.get("/admin/stats"),
  getUsers: () => api.get("/admin/users"),
  makeAdminByEmail: (email) => api.post("/admin/users/make-admin", { email }),
  removeAdminByEmail: (email) =>
    api.patch("/admin/users/remove-admin", { email }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getBookings: () => api.get("/admin/bookings"),
  updateBookingStatus: (id, status) =>
    api.patch(`/admin/bookings/${id}`, { status }),
  approveBooking: (id) => api.patch(`/admin/bookings/${id}/approve`),
  declineBooking: (id) => api.patch(`/admin/bookings/${id}/decline`),
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),
  getItineraries: () => api.get("/admin/itineraries"),
  createItinerary: (data) => api.post("/admin/itineraries", data),
  updateItinerary: (id, data) => api.put(`/admin/itineraries/${id}`, data),
  deleteItinerary: (id) => api.delete(`/admin/itineraries/${id}`),
  getPackages: () => api.get("/admin/packages"),
  createPackage: (data) => api.post("/admin/packages", data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),
  uploadPackageImages: (id, formData) =>
    api.post(`/admin/packages/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePackageImage: (id, imageUrl) =>
    api.delete(`/admin/packages/${id}/images`, { data: { imageUrl } }),
  uploadItineraryImages: (id, formData) =>
    api.post(`/admin/itineraries/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteItineraryImage: (id, imageUrl) =>
    api.delete(`/admin/itineraries/${id}/images`, { data: { imageUrl } }),
  getDestinations: () => api.get("/admin/destinations"),
  createDestination: (data) => api.post("/admin/destinations", data),
  updateDestination: (id, data) => api.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => api.delete(`/admin/destinations/${id}`),
  uploadDestinationImages: (id, formData) =>
    api.post(`/admin/destinations/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteDestinationImage: (id, imageUrl) =>
    api.delete(`/admin/destinations/${id}/images`, { data: { imageUrl } }),
  getFestivals: () => api.get("/admin/festivals"),
  createFestival: (data) => api.post("/admin/festivals", data),
  updateFestival: (id, data) => api.put(`/admin/festivals/${id}`, data),
  deleteFestival: (id) => api.delete(`/admin/festivals/${id}`),
  uploadFestivalImages: (id, formData) =>
    api.post(`/admin/festivals/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteFestivalImage: (id, imageUrl) =>
    api.delete(`/admin/festivals/${id}/images`, { data: { imageUrl } }),
  getAbout: () => api.get("/admin/about"),
  createAbout: (data) => api.post("/admin/about", data),
  updateAbout: (id, data) => api.put(`/admin/about/${id}`, data),
  deleteAbout: (id) => api.delete(`/admin/about/${id}`),
  uploadAboutImages: (id, formData) =>
    api.post(`/admin/about/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAboutImage: (id, imageUrl) =>
    api.delete(`/admin/about/${id}/images`, { data: { imageUrl } }),
  getContent: () => api.get("/admin/content"),
  createContent: (data) => api.post("/admin/content", data),
  updateContent: (id, data) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),
  uploadContentImage: (formData) =>
    api.post("/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadContentVideo: (formData) =>
    api.post("/admin/upload-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  // Auto-translate texts to all supported languages
  translate: (texts, sourceLang = "en") =>
    api.post("/admin/translate", { texts, sourceLang }),
};

export default api;
