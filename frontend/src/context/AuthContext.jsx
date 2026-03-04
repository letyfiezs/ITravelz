import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isAuthenticated, setIsAuth]  = useState(false);
  const navigate = useNavigate();
  // Track whether loginWithToken was called so we don't remove its token
  const oauthDone = useRef(false);

  // Validate stored token on mount
  useEffect(() => {
    // Skip validation on OAuth callback pages — loginWithToken handles auth there
    const isOAuthCallback =
      window.location.pathname === '/auth/google/callback' ||
      window.location.pathname === '/google-complete';
    if (isOAuthCallback) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      authService.validateToken()
        .then((res) => {
          setUser(res.data.user);
          setIsAuth(true);
        })
        .catch(() => {
          // Only remove the token if loginWithToken hasn't already replaced it
          if (!oauthDone.current) {
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const token = res.data.token;
      const u = res.data.user || res.data.data;
      localStorage.setItem('token', token);
      setUser(u);
      setIsAuth(true);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await authService.register({ name, email, password, confirmPassword: password });
      const token = res.data.token;
      const u = res.data.user || res.data.data;
      if (token && u) {
        localStorage.setItem('token', token);
        setUser(u);
        setIsAuth(true);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuth(false);
    navigate('/login');
  };

  const loginWithToken = (token, userData) => {
    oauthDone.current = true;
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuth(true);
    setLoading(false);
  };

  const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout, updateUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
