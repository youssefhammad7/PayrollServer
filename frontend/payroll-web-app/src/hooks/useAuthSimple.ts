import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UseAuthReturn {
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

export const useAuthSimple = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const userData = localStorage.getItem('payroll_user_data');
    const token = localStorage.getItem('payroll_auth_token');
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('payroll_user_data');
        localStorage.removeItem('payroll_auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simple mock authentication for testing
      // Replace this with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      if (credentials.email === 'admin@payroll.com' && credentials.password === 'admin123') {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@payroll.com',
          firstName: 'System',
          lastName: 'Administrator',
          roles: ['Admin'],
        };
        
        // Store in localStorage
        localStorage.setItem('payroll_auth_token', 'mock-jwt-token');
        localStorage.setItem('payroll_user_data', JSON.stringify(mockUser));
        
        // Update state - this should trigger re-render in App component
        setUser(mockUser);
        setIsLoading(false);
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('payroll_auth_token');
    localStorage.removeItem('payroll_user_data');
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };

  const isHRClerk = (): boolean => {
    return hasRole('HR Clerk');
  };

  const isReadOnly = (): boolean => {
    return hasRole('Read-Only');
  };

  return {
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
}; 