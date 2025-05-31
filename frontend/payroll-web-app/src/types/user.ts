// User management types based on backend DTOs

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roles: string[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  roles: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
}

export interface AddUserToRoleRequest {
  roleName: string;
}

export interface UserFilterParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
}

export interface PaginatedUsersResponse {
  items: User[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// User profile types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// System roles constants
export const SYSTEM_ROLES = {
  ADMIN: 'Admin',
  HR_CLERK: 'HR Clerk',
  READ_ONLY: 'Read-Only'
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES]; 