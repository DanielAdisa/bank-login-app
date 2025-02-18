// context/AuthContext.tsx
'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff' | 'user';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // On mount, attempt to refresh tokens so that if the user is already logged in, we get their session.
  useEffect(() => {
    refreshToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      // In a real application, decode the accessToken to obtain user info.
      // For our dummy setup, we simulate setting the user:
      setUser({ id: '1', username, role: 'admin' }); // adjust based on the actual user from your JSON
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        // Optionally, update user info if you decode the new access token.
      }
    } catch (err) {
      console.error('Failed to refresh token', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
