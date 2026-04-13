import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import wsService from '../services/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { accessToken, user: userData } = data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    wsService.connect(accessToken);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    const { accessToken, user: userData } = data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    wsService.connect(accessToken);
    return userData;
  }, []);

  const logout = useCallback(() => {
    wsService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      const updated = data.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch {}
  }, []);

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await authAPI.me();
          const userData = data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          wsService.connect(token);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
