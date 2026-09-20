import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService, SignUpParams, LoginParams } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (params: SignUpParams) => Promise<void>;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session & listen to storage events across browser tabs
  useEffect(() => {
    const syncSession = () => {
      const activeUser = authService.getCurrentUser();
      setUser(activeUser);
      setIsLoading(false);
    };

    syncSession();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'growtogether_auth_session' || e.key === null) {
        syncSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signUp = async (params: SignUpParams) => {
    setIsLoading(true);
    try {
      const createdUser = await authService.signUp(params);
      setUser(createdUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(params);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signUp,
        login,
        logout,
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
