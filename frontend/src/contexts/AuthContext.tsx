'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Company, auth } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isStudent: boolean;
  isCompany: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const companyData = localStorage.getItem('company');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      if (companyData) {
        setCompany(JSON.parse(companyData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const { token, user, company } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (company) {
        localStorage.setItem('company', JSON.stringify(company));
        setCompany(company);
      }
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      const response = await auth.signup(data);
      const { token, user, company } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (company) {
        localStorage.setItem('company', JSON.stringify(company));
        setCompany(company);
      }
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setUser(null);
    setCompany(null);
  };

  const value = {
    user,
    company,
    loading,
    login,
    signup,
    logout,
    isStudent: user?.user_type === 'student',
    isCompany: user?.user_type === 'company',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};