import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb, User, login as pbLogin, register as pbRegister, logout as pbLogout, getCurrentUser } from '@/lib/pocketbase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    setUser(getCurrentUser());
    setIsLoading(false);

    // Listen for auth state changes
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(getCurrentUser());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await pbLogin(email, password);
      setUser(getCurrentUser());
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      await pbRegister(email, password, name, phone);
      setUser(getCurrentUser());
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    pbLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
