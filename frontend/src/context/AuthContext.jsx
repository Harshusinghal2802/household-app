import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dl_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dl_user'));
      return saved?.darkMode ?? true;
    } catch { return true; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('dl_darkMode', darkMode);
  }, [darkMode]);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('dl_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('dl_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('dl_token');
      localStorage.removeItem('dl_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('dl_token', data.token);
    localStorage.setItem('dl_user', JSON.stringify(data.user));
    setUser(data.user);
    setDarkMode(data.user.darkMode ?? true);
    return data;
  };

  const signup = async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('dl_token', data.token);
    localStorage.setItem('dl_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.get('/auth/logout').catch(() => {});
    localStorage.removeItem('dl_token');
    localStorage.removeItem('dl_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('dl_user', JSON.stringify(updatedUser));
    if (updatedUser.darkMode !== undefined) setDarkMode(updatedUser.darkMode);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ user, loading, darkMode, login, signup, logout, updateUser, toggleDarkMode, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
