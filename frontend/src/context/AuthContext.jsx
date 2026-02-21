import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isAuthenticated, setIsAuth]  = useState(false);
  const navigate = useNavigate();

  // Validate stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.validateToken()
        .then((res) => {
          setUser(res.data.user);
          setIsAuth(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const { token, user: u } = res.data;
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
      const res = await authService.register({ name, email, password });
      const { token, user: u } = res.data;
      localStorage.setItem('token', token);
      setUser(u);
      setIsAuth(true);
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

  const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
