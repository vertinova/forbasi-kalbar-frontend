import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Auto-refresh from server to sync stale localStorage data
      api.get('/auth/profile').then(({ data }) => {
        const fresh = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          avatar: data.avatar || null,
          pengcabId: data.pengcabId,
          pengcab: data.pengcab?.nama || null,
        };
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
      }).catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { email: identifier, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, phone, pengcabId, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone, pengcabId, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Refresh user data from server (after profile update)
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        avatar: data.avatar || null,
        pengcabId: data.pengcabId,
        pengcab: data.pengcab?.nama || null,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading, isAdmin: user?.role === 'ADMIN', isPengcab: user?.role === 'PENGCAB' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
