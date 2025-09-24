import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useStorageApi } from '../hooks/useStorageApi';
import type { AuthUser } from '../hooks/useStorageApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    register: apiRegister, 
    login: apiLogin, 
    logout: apiLogout, 
    getCurrentUser, 
    isAuthenticated: checkIsAuthenticated 
  } = useStorageApi();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (checkIsAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          // If token is invalid, clear it
          apiLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [checkIsAuthenticated, getCurrentUser, apiLogout]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const authResponse = await apiLogin({ email, password });
      setUser(authResponse.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const authResponse = await apiRegister({ name, email, password });
      setUser(authResponse.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    if (checkIsAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};