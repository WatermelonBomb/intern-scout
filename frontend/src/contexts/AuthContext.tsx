'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Company, auth, SignupRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
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
    // Check if user is logged in by making a request to the server
    // The server will authenticate using the httpOnly cookie
    // Temporarily disabled to fix redirect loop
    // checkAuthStatus();
    setLoading(false);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Make a request to check current user - server will verify cookie
      const response = await auth.getCurrentUser();
      const { user, company } = response.data;
      setUser(user);
      if (company) {
        setCompany(company);
      }
    } catch {
      // Not authenticated or error occurred
      setUser(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const { user, company } = response.data;
      
      // No need to store token in localStorage - it's now in httpOnly cookie
      setUser(user);
      if (company) {
        setCompany(company);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      const response = await auth.signup(data);
      const { user, company } = response.data;
      
      // No need to store token in localStorage - it's now in httpOnly cookie
      setUser(user);
      if (company) {
        setCompany(company);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint to clear the httpOnly cookie
      await auth.logout();
    } catch (error) {
      // Even if the request fails, clear the local state
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setCompany(null);
    }
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