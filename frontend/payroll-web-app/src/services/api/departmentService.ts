import apiClient from './apiClient';
import type { ApiResponse } from '../auth/authService';
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  UpdateDepartmentIncentiveRequest,
  DepartmentIncentiveHistory,
} from '../../types/department';

class DepartmentService {
  // Get all departments
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await apiClient.get<ApiResponse<Department[]>>('/departments');

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch departments');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to get departments:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch departments');
    }
  }

  // Get single department by ID
  async getDepartment(id: string): Promise<Department> {
    try {
      const response = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Department not found');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to get department:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch department');
    }
  }

  // Create new department
  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    try {
      const response = await apiClient.post<ApiResponse<Department>>('/departments', departmentData);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create department');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to create department:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create department');
    }
  }

  // Update existing department
  async updateDepartment(id: string, departmentData: UpdateDepartmentRequest): Promise<Department> {
    try {
      const response = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, departmentData);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update department');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to update department:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update department');
    }
  }

  // Delete department
  async deleteDepartment(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/departments/${id}`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete department');
      }
    } catch (error: any) {
      console.error('DepartmentService - Failed to delete department:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete department');
    }
  }

  // Update department incentive percentage
  async updateDepartmentIncentive(id: string, incentiveData: UpdateDepartmentIncentiveRequest): Promise<Department> {
    try {
      const response = await apiClient.patch<ApiResponse<Department>>(`/departments/${id}/incentive`, incentiveData);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update department incentive');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to update department incentive:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update department incentive');
    }
  }

  // Get department incentive history
  async getDepartmentIncentiveHistory(id: string): Promise<DepartmentIncentiveHistory[]> {
    try {
      const response = await apiClient.get<ApiResponse<DepartmentIncentiveHistory[]>>(`/departments/${id}/incentive-history`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch incentive history');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DepartmentService - Failed to get incentive history:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch incentive history');
    }
  }
}

export const departmentService = new DepartmentService(); 