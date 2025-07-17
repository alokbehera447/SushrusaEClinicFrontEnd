import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/utils';

interface User {
  id: string;
  phone: string;
  role: string;
  name: string;
  profile?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem('userInfo');
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    if (storedUser && storedAccess && storedRefresh) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
    }
  }, []);

  const login = (user: User, access: string, refresh: string) => {
    setUser(user);
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('phoneNumber', user.phone);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.clear();
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;
    try {
      const res = await api.post('/api/auth/refresh/', { refresh: refreshToken });
      if (res.data && res.data.access) {
        setAccessToken(res.data.access);
        localStorage.setItem('accessToken', res.data.access);
        return res.data.access;
      }
    } catch (err) {
      logout();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isAuthenticated: !!user && !!accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 