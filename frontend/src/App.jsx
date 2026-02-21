import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Routes/PrivateRoute';

const Home          = lazy(() => import('./pages/Home'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail    = lazy(() => import('./pages/VerifyEmail'));
const Profile        = lazy(() => import('./pages/Profile'));
const Bookings       = lazy(() => import('./pages/Bookings'));
const BookingForm    = lazy(() => import('./pages/BookingForm'));
const Admin          = lazy(() => import('./pages/Admin'));
const NotFound       = lazy(() => import('./pages/NotFound'));

const Loader = () => (
  <div className="page-loader">
    <span className="spinner spinner-dark" />
    Loading...
  </div>
);

const App = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {/* Public routes with navbar/footer */}
      <Route element={<Layout />}>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token"   element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile"      element={<Profile />} />
          <Route path="/bookings"     element={<Bookings />} />
          <Route path="/booking/new"  element={<BookingForm />} />
        </Route>

        {/* Admin */}
        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/admin"        element={<Admin />} />
        </Route>

        <Route path="*"               element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);

export default App;
