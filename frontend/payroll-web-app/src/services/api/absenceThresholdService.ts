import apiClient from './apiClient';
import type { 
  AbsenceThreshold, 
  AbsenceThresholdApiResponse, 
  CreateAbsenceThresholdRequest, 
  UpdateAbsenceThresholdRequest,
  AbsenceOverlapCheckRequest,
  AbsenceOverlapCheckResponse
} from '../../types/absenceThreshold';
import type { ApiResponse } from '../auth/authService';

class AbsenceThresholdService {
  // Get all absence thresholds
  async getAbsenceThresholds(activeOnly: boolean = false): Promise<AbsenceThreshold[]> {
    try {
      const url = activeOnly ? '/AbsenceThresholds?activeOnly=true' : '/AbsenceThresholds';
      const response = await apiClient.get<ApiResponse<AbsenceThresholdApiResponse[]>>(url);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch absence thresholds');
      }

      return response.data.data.map(mapAbsenceThresholdFromApi);
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to get absence thresholds:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence thresholds');
    }
  }

  // Get absence threshold by ID
  async getAbsenceThreshold(id: string): Promise<AbsenceThreshold> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceThresholdApiResponse>>(`/AbsenceThresholds/${id}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Absence threshold not found');
      }

      return mapAbsenceThresholdFromApi(response.data.data);
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to get absence threshold:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence threshold');
    }
  }

  // Get absence threshold for specific absence days
  async getAbsenceThresholdForDays(days: number): Promise<AbsenceThreshold> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceThresholdApiResponse>>(`/AbsenceThresholds/days/${days}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'No absence threshold found for specified days');
      }

      return mapAbsenceThresholdFromApi(response.data.data);
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to get absence threshold for days:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence threshold for days');
    }
  }

  // Create new absence threshold
  async createAbsenceThreshold(data: CreateAbsenceThresholdRequest): Promise<AbsenceThreshold> {
    try {
      const response = await apiClient.post<ApiResponse<AbsenceThresholdApiResponse>>('/AbsenceThresholds', data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create absence threshold');
      }

      return mapAbsenceThresholdFromApi(response.data.data);
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to create absence threshold:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create absence threshold');
    }
  }

  // Update absence threshold
  async updateAbsenceThreshold(id: string, data: UpdateAbsenceThresholdRequest): Promise<AbsenceThreshold> {
    try {
      const response = await apiClient.put<ApiResponse<AbsenceThresholdApiResponse>>(`/AbsenceThresholds/${id}`, data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update absence threshold');
      }

      return mapAbsenceThresholdFromApi(response.data.data);
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to update absence threshold:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update absence threshold');
    }
  }

  // Delete absence threshold
  async deleteAbsenceThreshold(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/AbsenceThresholds/${id}`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete absence threshold');
      }
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to delete absence threshold:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete absence threshold');
    }
  }

  // Check for overlapping thresholds (if backend supports it)
  async checkOverlap(request: AbsenceOverlapCheckRequest): Promise<AbsenceOverlapCheckResponse> {
    try {
      const params = new URLSearchParams();
      params.append('minDays', request.minDays.toString());
      if (request.maxDays !== undefined) {
        params.append('maxDays', request.maxDays.toString());
      }
      if (request.excludeId !== undefined) {
        params.append('excludeId', request.excludeId.toString());
      }

      const response = await apiClient.get<ApiResponse<AbsenceOverlapCheckResponse>>(`/AbsenceThresholds/check-overlap?${params}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to check overlap');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('AbsenceThresholdService - Failed to check overlap:', error);
      // Return no overlap if API doesn't support overlap checking
      if (error.response?.status === 404) {
        return { hasOverlap: false };
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to check overlap');
    }
  }
}

// Helper function to map API response to frontend type
function mapAbsenceThresholdFromApi(apiAbsenceThreshold: AbsenceThresholdApiResponse): AbsenceThreshold {
  return {
    id: apiAbsenceThreshold.id,
    name: apiAbsenceThreshold.name,
    minAbsenceDays: apiAbsenceThreshold.minAbsenceDays,
    maxAbsenceDays: apiAbsenceThreshold.maxAbsenceDays,
    adjustmentPercentage: apiAbsenceThreshold.adjustmentPercentage,
    description: apiAbsenceThreshold.description,
    isActive: apiAbsenceThreshold.isActive,
    createdAt: apiAbsenceThreshold.createdAt,
    updatedAt: apiAbsenceThreshold.updatedAt,
  };
}

export const absenceThresholdService = new AbsenceThresholdService(); 