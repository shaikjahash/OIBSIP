import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('forno_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      connectSocket(token);
    } catch (err) {
      localStorage.removeItem('forno_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('forno_token', data.token);
    setUser(data.user);
    connectSocket(data.token);
    return data.user;
  }

  async function register(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  }

  function logout() {
    localStorage.removeItem('forno_token');
    setUser(null);
    disconnectSocket();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
