import apiClient from './apiClient';
import type { 
  ServiceBracket, 
  ServiceBracketApiResponse, 
  CreateServiceBracketRequest, 
  UpdateServiceBracketRequest,
  OverlapCheckRequest,
  OverlapCheckResponse
} from '../../types/serviceBracket';
import type { ApiResponse } from '../auth/authService';

class ServiceBracketService {
  // Get all service brackets
  async getServiceBrackets(activeOnly: boolean = false): Promise<ServiceBracket[]> {
    try {
      const url = activeOnly ? '/ServiceBrackets?activeOnly=true' : '/ServiceBrackets';
      const response = await apiClient.get<ApiResponse<ServiceBracketApiResponse[]>>(url);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch service brackets');
      }

      return response.data.data.map(mapServiceBracketFromApi);
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to get service brackets:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service brackets');
    }
  }

  // Get service bracket by ID
  async getServiceBracket(id: string): Promise<ServiceBracket> {
    try {
      const response = await apiClient.get<ApiResponse<ServiceBracketApiResponse>>(`/ServiceBrackets/${id}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Service bracket not found');
      }

      return mapServiceBracketFromApi(response.data.data);
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to get service bracket:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service bracket');
    }
  }

  // Get service bracket for specific years of service
  async getServiceBracketForYears(years: number): Promise<ServiceBracket> {
    try {
      const response = await apiClient.get<ApiResponse<ServiceBracketApiResponse>>(`/ServiceBrackets/years/${years}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'No service bracket found for specified years');
      }

      return mapServiceBracketFromApi(response.data.data);
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to get service bracket for years:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service bracket for years');
    }
  }

  // Create new service bracket
  async createServiceBracket(data: CreateServiceBracketRequest): Promise<ServiceBracket> {
    try {
      const response = await apiClient.post<ApiResponse<ServiceBracketApiResponse>>('/ServiceBrackets', data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create service bracket');
      }

      return mapServiceBracketFromApi(response.data.data);
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to create service bracket:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create service bracket');
    }
  }

  // Update service bracket
  async updateServiceBracket(id: string, data: UpdateServiceBracketRequest): Promise<ServiceBracket> {
    try {
      const response = await apiClient.put<ApiResponse<ServiceBracketApiResponse>>(`/ServiceBrackets/${id}`, data);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update service bracket');
      }

      return mapServiceBracketFromApi(response.data.data);
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to update service bracket:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update service bracket');
    }
  }

  // Delete service bracket
  async deleteServiceBracket(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/ServiceBrackets/${id}`);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete service bracket');
      }
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to delete service bracket:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete service bracket');
    }
  }

  // Check for overlapping brackets
  async checkOverlap(request: OverlapCheckRequest): Promise<OverlapCheckResponse> {
    try {
      const params = new URLSearchParams();
      params.append('minYears', request.minYears.toString());
      if (request.maxYears !== undefined) {
        params.append('maxYears', request.maxYears.toString());
      }
      if (request.excludeId !== undefined) {
        params.append('excludeId', request.excludeId.toString());
      }

      const response = await apiClient.get<ApiResponse<OverlapCheckResponse>>(`/ServiceBrackets/check-overlap?${params}`);

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to check overlap');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('ServiceBracketService - Failed to check overlap:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check overlap');
    }
  }
}

// Helper function to map API response to frontend type
function mapServiceBracketFromApi(apiServiceBracket: ServiceBracketApiResponse): ServiceBracket {
  return {
    id: apiServiceBracket.id,
    name: apiServiceBracket.name,
    minYearsOfService: apiServiceBracket.minYearsOfService,
    maxYearsOfService: apiServiceBracket.maxYearsOfService,
    incentivePercentage: apiServiceBracket.incentivePercentage,
    description: apiServiceBracket.description,
    isActive: apiServiceBracket.isActive,
    createdAt: apiServiceBracket.createdAt,
    updatedAt: apiServiceBracket.updatedAt,
  };
}

export const serviceBracketService = new ServiceBracketService(); 