import apiClient from './apiClient';
import type { ApiResponse } from '../auth/authService';
import type {
  Employee,
  EmployeesResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeQueryParams,
  Department,
  JobGrade,
} from '../../types/employee';

class EmployeeService {
  // Get paginated employees list with search and filters
  async getEmployees(params: EmployeeQueryParams = {}): Promise<EmployeesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.departmentId) queryParams.append('departmentId', params.departmentId.toString());
      if (params.jobGradeId) queryParams.append('jobGradeId', params.jobGradeId.toString());

      const response = await apiClient.get<ApiResponse<EmployeesResponse>>(
        `/employees?${queryParams.toString()}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch employees');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to get employees:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch employees');
    }
  }

  // Get single employee by ID
  async getEmployee(id: string): Promise<Employee> {
    try {
      const response = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Employee not found');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to get employee:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch employee');
    }
  }

  // Create new employee
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const response = await apiClient.post<ApiResponse<Employee>>('/employees', employeeData);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create employee');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to create employee:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create employee');
    }
  }

  // Update existing employee
  async updateEmployee(id: string, employeeData: UpdateEmployeeRequest): Promise<Employee> {
    try {
      const response = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, employeeData);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update employee');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to update employee:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update employee');
    }
  }

  // Delete employee (soft delete)
  async deleteEmployee(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/employees/${id}`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete employee');
      }
    } catch (error: any) {
      console.error('EmployeeService - Failed to delete employee:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete employee');
    }
  }

  // Restore deleted employee
  async restoreEmployee(id: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(`/employees/${id}/restore`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to restore employee');
      }
    } catch (error: any) {
      console.error('EmployeeService - Failed to restore employee:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to restore employee');
    }
  }

  // Get departments for dropdown
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await apiClient.get<ApiResponse<Department[]>>('/departments');

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch departments');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to get departments:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch departments');
    }
  }

  // Get job grades for dropdown
  async getJobGrades(): Promise<JobGrade[]> {
    try {
      const response = await apiClient.get<ApiResponse<JobGrade[]>>('/jobgrades');

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch job grades');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('EmployeeService - Failed to get job grades:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch job grades');
    }
  }
}

export const employeeService = new EmployeeService(); 