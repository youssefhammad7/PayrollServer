import apiClient from './apiClient';
import type { 
  JobGrade, 
  JobGradeApiResponse, 
  CreateJobGradeRequest, 
  UpdateJobGradeRequest 
} from '../../types/jobGrade';
import type { ApiResponse } from '../auth/authService';

class JobGradeService {
  // Get all job grades
  async getJobGrades(): Promise<JobGrade[]> {
    try {
      const response = await apiClient.get<ApiResponse<JobGradeApiResponse[]>>('/JobGrades');

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch job grades');
      }

      return response.data.data.map(mapJobGradeFromApi);
    } catch (error: any) {
      console.error('JobGradeService - Failed to get job grades:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch job grades');
    }
  }

  // Get job grade by ID
  async getJobGrade(id: string): Promise<JobGrade> {
    try {
      const response = await apiClient.get<ApiResponse<JobGradeApiResponse>>(`/JobGrades/${id}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Job grade not found');
      }

      return mapJobGradeFromApi(response.data.data);
    } catch (error: any) {
      console.error('JobGradeService - Failed to get job grade:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch job grade');
    }
  }

  // Create new job grade
  async createJobGrade(data: CreateJobGradeRequest): Promise<JobGrade> {
    try {
      const response = await apiClient.post<ApiResponse<JobGradeApiResponse>>('/JobGrades', data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create job grade');
      }

      return mapJobGradeFromApi(response.data.data);
    } catch (error: any) {
      console.error('JobGradeService - Failed to create job grade:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create job grade');
    }
  }

  // Update job grade
  async updateJobGrade(id: string, data: UpdateJobGradeRequest): Promise<JobGrade> {
    try {
      const response = await apiClient.put<ApiResponse<JobGradeApiResponse>>(`/JobGrades/${id}`, data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update job grade');
      }

      return mapJobGradeFromApi(response.data.data);
    } catch (error: any) {
      console.error('JobGradeService - Failed to update job grade:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update job grade');
    }
  }

  // Delete job grade
  async deleteJobGrade(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/JobGrades/${id}`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete job grade');
      }
    } catch (error: any) {
      console.error('JobGradeService - Failed to delete job grade:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete job grade');
    }
  }
}

// Helper function to map API response to frontend type
function mapJobGradeFromApi(apiJobGrade: JobGradeApiResponse): JobGrade {
  return {
    id: apiJobGrade.id,
    name: apiJobGrade.name,
    description: apiJobGrade.description,
    minSalary: apiJobGrade.minSalary,
    maxSalary: apiJobGrade.maxSalary,
    employeeCount: apiJobGrade.employeeCount,
    createdAt: apiJobGrade.createdAt,
    updatedAt: apiJobGrade.updatedAt,
  };
}

export const jobGradeService = new JobGradeService(); 