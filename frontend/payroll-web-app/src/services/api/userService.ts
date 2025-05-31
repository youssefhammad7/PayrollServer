import apiClient from './apiClient';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AddUserToRoleRequest,
  UserFilterParams,
  PaginatedUsersResponse,
  UserProfile,
  ChangePasswordRequest
} from '../../types/user';

class UserService {
  // User CRUD operations
  async getUsers(params: UserFilterParams = {}): Promise<PaginatedUsersResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
    if (params.role) queryParams.role = params.role;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive.toString();

    const response = await apiClient.get('/UserManagement/users', { params: queryParams });
    return response.data.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/UserManagement/users/${id}`);
    return response.data.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`/UserManagement/users/${id}`, userData);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/UserManagement/users/${id}`);
  }

  async restoreUser(id: string): Promise<void> {
    await apiClient.post(`/UserManagement/users/${id}/restore`);
  }

  // Role management operations
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/UserManagement/roles');
    return response.data.data;
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post('/UserManagement/roles', roleData);
    return response.data.data;
  }

  async updateRole(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    const response = await apiClient.put(`/UserManagement/roles/${id}`, roleData);
    return response.data.data;
  }

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/UserManagement/roles/${id}`);
  }

  // User-Role operations
  async addUserToRole(userId: string, roleData: AddUserToRoleRequest): Promise<void> {
    await apiClient.post(`/UserManagement/users/${userId}/roles`, roleData);
  }

  async removeUserFromRole(userId: string, roleName: string): Promise<void> {
    await apiClient.delete(`/UserManagement/users/${userId}/roles/${roleName}`);
  }

  // User profile operations
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/auth/profile');
    return response.data.data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', passwordData);
  }

  // Utility functions
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'Admin': 'Administrator',
      'HR Clerk': 'HR Clerk',
      'Read-Only': 'Read-Only User'
    };
    return roleMap[role] || role;
  }

  getRoleColor(role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' {
    const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      'Admin': 'error',
      'HR Clerk': 'primary',
      'Read-Only': 'success'
    };
    return colorMap[role] || 'default';
  }

  getFullName(user: User | UserProfile): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  formatUserStatus(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  formatUserDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUsername(username: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const userService = new UserService(); 