import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export type UserRole = 'WORKER' | 'EMPLOYER' | 'ADMIN';
export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  _id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isPhoneVerified: boolean;
  isEmailVerified?: boolean;
  verificationStatus: VerificationStatus;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  preferredLanguage: 'en' | 'ml';
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    phone: string;
    password: string;
    fullName: string;
    role: UserRole;
    email?: string;
    adminSetupKey?: string;
  }) => Promise<{ debugOtp?: string; otpChannel?: 'EMAIL' | 'SMS'; otpTarget?: string }>;
  logout: () => Promise<void>;
  verifyOtp: (targetOrPhone: string, otp: string, email?: string) => Promise<void>;
  sendOtp: (targetOrPhone: string, email?: string) => Promise<{ debugOtp?: string; channel?: 'EMAIL' | 'SMS'; target?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('coolink_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('coolink_access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      localStorage.setItem('coolink_user', JSON.stringify(res.data.data.user));
    } catch {
      setUser(null);
      localStorage.removeItem('coolink_user');
      localStorage.removeItem('coolink_access_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    const { user: loggedInUser, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('coolink_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('coolink_refresh_token', refreshToken);
    }
    localStorage.setItem('coolink_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const register = async (data: {
    phone: string;
    password: string;
    fullName: string;
    role: UserRole;
    email?: string;
    adminSetupKey?: string;
  }) => {
    const res = await api.post('/auth/register', data);
    const { user: registeredUser, accessToken, refreshToken, debugOtp, otpChannel, otpTarget } = res.data.data;
    localStorage.setItem('coolink_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('coolink_refresh_token', refreshToken);
    }
    localStorage.setItem('coolink_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return { debugOtp, otpChannel, otpTarget };
  };

  const verifyOtp = async (targetOrPhone: string, otp: string, email?: string) => {
    const payload: { target?: string; phone?: string; email?: string; otp: string } = {
      otp,
    };
    if (targetOrPhone.includes('@')) {
      payload.email = targetOrPhone;
    } else {
      payload.phone = targetOrPhone;
    }
    if (email) {
      payload.email = email;
    }
    payload.target = targetOrPhone;

    await api.post('/auth/verify-otp', payload);
    if (user) {
      const updated = { ...user, isPhoneVerified: true, isEmailVerified: true };
      setUser(updated);
      localStorage.setItem('coolink_user', JSON.stringify(updated));
    }
  };

  const sendOtp = async (targetOrPhone: string, email?: string) => {
    const payload: { target?: string; phone?: string; email?: string } = {};
    if (targetOrPhone.includes('@')) {
      payload.email = targetOrPhone;
    } else {
      payload.phone = targetOrPhone;
    }
    if (email) {
      payload.email = email;
    }
    payload.target = targetOrPhone;

    const res = await api.post('/auth/send-otp', payload);
    return {
      debugOtp: res.data.data?.debugOtp,
      channel: res.data.data?.channel,
      target: res.data.data?.target,
    };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API call error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('coolink_user');
      localStorage.removeItem('coolink_access_token');
      localStorage.removeItem('coolink_refresh_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        verifyOtp,
        sendOtp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
