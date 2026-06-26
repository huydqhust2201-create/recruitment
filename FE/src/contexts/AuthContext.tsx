'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { setAuthRoleCookie, clearAuthRoleCookie } from '@/lib/auth-cookies';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role') as User['role'] | null;
    const fullName = localStorage.getItem('fullName');

    if (accessToken && email && role && fullName) {
      setUser({ accessToken, refreshToken: refreshToken ?? '', email, role, fullName });
      setAuthRoleCookie(role);
    }
    setLoading(false);
  }, []);

  const saveUser = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    localStorage.setItem('fullName', data.fullName);
    setAuthRoleCookie(data.role);
    setUser(data);
  };

  const redirectAfterAuth = (role: User['role']) => {
    const redirect = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect')
      : null;
    if (redirect && redirect.startsWith('/')) {
      router.push(redirect);
      return;
    }
    router.push(
      role === 'ADMIN' ? '/admin/dashboard' :
      role === 'RECRUITER' ? '/recruiter/dashboard' :
      '/'
    );
  };

  const login = async (body: LoginRequest) => {
    const res = await axiosInstance.post<AuthResponse>('/api/auth/login', body);
    saveUser(res.data);
    redirectAfterAuth(res.data.role);
  };

  const register = async (body: RegisterRequest) => {
    const res = await axiosInstance.post<AuthResponse>('/api/auth/register', body);
    saveUser(res.data);
    redirectAfterAuth(res.data.role);
  };

  const logout = () => {
    localStorage.clear();
    clearAuthRoleCookie();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
