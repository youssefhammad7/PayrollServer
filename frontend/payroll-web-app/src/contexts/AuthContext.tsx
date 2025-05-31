import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, type LoginRequest, type User } from '../services/auth/authService';
import { ENV_CONFIG } from '../config/environment';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isHRClerk: () => boolean;
  isReadOnly: () => boolean;
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

// Environment variable to control real vs mock authentication (default to real API)
const USE_REAL_API = ENV_CONFIG.USE_REAL_API;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - Checking initial auth state...');
    console.log('AuthProvider - Using real API:', USE_REAL_API);
    
    // Check if user is already authenticated on app start
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (currentUser && token) {
      console.log('AuthProvider - Found existing user:', currentUser.firstName);
      setUser(currentUser);
    } else {
      console.log('AuthProvider - No existing auth found');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider - Starting login...');
    setIsLoading(true);
    
    try {
      let response;
      
      if (USE_REAL_API) {
        try {
          // Try real API first
          console.log('AuthProvider - Attempting real API login...');
          response = await authService.login(credentials);
          console.log('AuthProvider - Real API login successful');
        } catch (error) {
          console.warn('AuthProvider - Real API login failed, falling back to mock:', error);
          // Fallback to mock authentication
          response = await authService.loginMock(credentials);
          console.log('AuthProvider - Mock login successful (fallback)');
        }
      } else {
        // Use mock authentication directly
        console.log('AuthProvider - Using mock authentication (configured)');
        response = await authService.loginMock(credentials);
        console.log('AuthProvider - Mock login successful');
      }
      
      // Update state with the logged-in user
      setUser(response.user);
      setIsLoading(false);
      
      console.log('AuthProvider - User state updated:', response.user.firstName);
      
      return { success: true };
    } catch (error: any) {
      console.error('AuthProvider - Login error:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = (): void => {
    console.log('AuthProvider - Logging out...');
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isHRClerk = (): boolean => {
    return authService.isHRClerk();
  };

  const isReadOnly = (): boolean => {
    return authService.isReadOnly();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isHRClerk,
    isReadOnly,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 