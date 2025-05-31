import apiClient from '../api/apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

// Backend API wrapper format
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode: number;
}

// Backend AuthResponse (inside the ApiResponse.data)
export interface BackendAuthResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// Frontend format
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

class AuthService {
  // Health check to test backend connectivity
  async healthCheck(): Promise<boolean> {
    try {
      // Try a simple GET request to test if backend is reachable
      const response = await apiClient.get('/auth/profile', {
        timeout: 5000, // 5 second timeout
        validateStatus: (status) => status < 500, // Accept 401/403 as "reachable"
      });
      console.log('AuthService - Backend health check: ✅ Reachable');
      return true;
    } catch (error: any) {
      console.log('AuthService - Backend health check: ❌ Not reachable', error.message);
      return false;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('AuthService - Attempting real API login with:', credentials.email);
      
      const response = await apiClient.post<ApiResponse<BackendAuthResponse>>('/auth/login', credentials);
      const apiResponse = response.data;

      console.log('AuthService - Backend API response:', apiResponse);

      // Check if the API wrapper indicates success
      if (!apiResponse.isSuccess) {
        throw new Error(apiResponse.message || 'Login failed');
      }

      // Check if we have the auth data
      const authData = apiResponse.data;
      if (!authData || !authData.isSuccess || !authData.token) {
        throw new Error(authData?.message || apiResponse.message || 'Login failed');
      }

      // Convert backend format to frontend format
      const loginResponse: LoginResponse = {
        token: authData.token,
        user: {
          id: authData.userId,
          username: authData.username,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          roles: authData.roles,
        },
      };

      // Store auth data
      localStorage.setItem('payroll_auth_token', loginResponse.token);
      localStorage.setItem('payroll_user_data', JSON.stringify(loginResponse.user));

      console.log('AuthService - Real API login successful for:', loginResponse.user.firstName);
      return loginResponse;
    } catch (error: any) {
      console.error('AuthService - Real API login failed:', error.response?.data || error.message);
      
      // Clear any existing auth data
      this.logout();
      
      // Extract error message from backend API response
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle ApiResponse wrapper error format
        if (errorData.isSuccess === false) {
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem('payroll_auth_token');
      if (token) {
        // Backend doesn't have logout endpoint yet, so we skip the API call
        console.log('AuthService - Logout (API call skipped - endpoint not implemented)');
      }
    } catch (error) {
      console.warn('AuthService - Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('payroll_auth_token');
      localStorage.removeItem('payroll_user_data');
      console.log('AuthService - Logout completed');
    }
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('payroll_user_data');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('AuthService - Error parsing user data:', error);
      this.logout(); // Clear corrupted data
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('payroll_auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isHRClerk(): boolean {
    return this.hasRole('HR Clerk');
  }

  isReadOnly(): boolean {
    return this.hasRole('Read-Only');
  }

  // Fallback to mock authentication for development
  async loginMock(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('AuthService - Using mock authentication');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUsers = {
      'admin@payroll.com': {
        id: '1',
        username: 'admin',
        email: 'admin@payroll.com',
        firstName: 'System',
        lastName: 'Administrator',
        roles: ['Admin'],
        password: 'admin123',
      },
      'hr@payroll.com': {
        id: '2',
        username: 'hrclerk',
        email: 'hr@payroll.com',
        firstName: 'HR',
        lastName: 'Clerk',
        roles: ['HR Clerk'],
        password: 'hr123',
      },
      'user@payroll.com': {
        id: '3',
        username: 'readonly',
        email: 'user@payroll.com',
        firstName: 'Read',
        lastName: 'Only User',
        roles: ['Read-Only'],
        password: 'user123',
      },
    };

    const mockUser = mockUsers[credentials.email as keyof typeof mockUsers];
    
    if (!mockUser || mockUser.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = mockUser;
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: userWithoutPassword,
    };

    // Store auth data
    localStorage.setItem('payroll_auth_token', mockResponse.token);
    localStorage.setItem('payroll_user_data', JSON.stringify(mockResponse.user));

    return mockResponse;
  }

  // Get user profile from backend API
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
      const apiResponse = response.data;
      
      if (!apiResponse.isSuccess || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to retrieve user profile');
      }
      
      return apiResponse.data;
    } catch (error: any) {
      console.error('AuthService - Failed to get profile:', error);
      throw new Error('Failed to retrieve user profile');
    }
  }

  // Check if user is in specific role via backend API
  async isInRole(role: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<boolean>>(`/auth/is-in-role?role=${encodeURIComponent(role)}`);
      const apiResponse = response.data;
      
      if (!apiResponse.isSuccess) {
        console.warn('AuthService - Role check failed:', apiResponse.message);
        return false;
      }
      
      return apiResponse.data ?? false;
    } catch (error: any) {
      console.error('AuthService - Failed to check role:', error);
      return false;
    }
  }

  // Test method to verify JWT token is being sent
  async testAuthenticatedRequest(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('AuthService - Testing authenticated request...');
      const response = await apiClient.get<ApiResponse<any>>('/auth/profile');
      const apiResponse = response.data;
      
      if (!apiResponse.isSuccess) {
        return {
          success: false,
          message: apiResponse.message || 'Request failed'
        };
      }
      
      return {
        success: true,
        message: 'Authenticated request successful! JWT token is working.'
      };
    } catch (error: any) {
      console.error('AuthService - Test request failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Test request failed'
      };
    }
  }
}

export const authService = new AuthService(); 