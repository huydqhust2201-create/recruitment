'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
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
    }
    setLoading(false);
  }, []);

  const saveUser = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    localStorage.setItem('fullName', data.fullName);
    setUser(data);
  };

  const login = async (body: LoginRequest) => {
    const res = await axiosInstance.post<AuthResponse>('/api/auth/login', body);
    saveUser(res.data);
    if (res.data.role === 'CANDIDATE') {
      router.push('/candidate/dashboard');
    } else {
      router.push('/recruiter/dashboard');
    }
  };

  const register = async (body: RegisterRequest) => {
    const res = await axiosInstance.post<AuthResponse>('/api/auth/register', body);
    saveUser(res.data);
    if (res.data.role === 'CANDIDATE') {
      router.push('/candidate/dashboard');
    } else {
      router.push('/recruiter/dashboard');
    }
  };

  const logout = () => {
    localStorage.clear();
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
