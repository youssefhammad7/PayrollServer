import apiClient from './apiClient';
import type { 
  SalaryRecord, 
  SalaryRecordApiResponse,
  CreateSalaryRecordRequest,
  UpdateSalaryRecordRequest,
  SalaryRecordQueryParams,
  SalaryValidationResult
} from '../../types/salaryRecord';
import type { ApiResponse } from '../auth/authService';

class SalaryRecordService {
  // Get all salary records with optional filtering
  async getSalaryRecords(params?: SalaryRecordQueryParams): Promise<SalaryRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.employeeId) {
        queryParams.append('employeeId', params.employeeId.toString());
      }
      
      const response = await apiClient.get<ApiResponse<SalaryRecordApiResponse[]>>(
        `/salaryrecords?${queryParams.toString()}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch salary records');
      }

      // Enrich salary records with employee data if missing
      const enrichedRecords = await this.enrichSalaryRecordsWithEmployeeData(response.data.data);
      return enrichedRecords.map(mapSalaryRecordFromApi);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to get salary records:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch salary records');
    }
  }

  // Get salary record by ID
  async getSalaryRecord(id: number): Promise<SalaryRecord> {
    try {
      const response = await apiClient.get<ApiResponse<SalaryRecordApiResponse>>(
        `/salaryrecords/${id}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Salary record not found');
      }

      // Enrich salary record with employee data if missing
      const enrichedRecords = await this.enrichSalaryRecordsWithEmployeeData([response.data.data]);
      return mapSalaryRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to get salary record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch salary record');
    }
  }

  // Get salary history for an employee
  async getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<SalaryRecordApiResponse[]>>(
        `/salaryrecords/employee/${employeeId}/history`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch salary history');
      }

      // Enrich salary records with employee data if missing
      const enrichedRecords = await this.enrichSalaryRecordsWithEmployeeData(response.data.data);
      return enrichedRecords.map(mapSalaryRecordFromApi);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to get salary history:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch salary history');
    }
  }

  // Get current salary for an employee
  async getCurrentSalary(employeeId: number): Promise<SalaryRecord> {
    try {
      const response = await apiClient.get<ApiResponse<SalaryRecordApiResponse>>(
        `/salaryrecords/employee/${employeeId}/current`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Current salary not found');
      }

      // Enrich salary record with employee data if missing
      const enrichedRecords = await this.enrichSalaryRecordsWithEmployeeData([response.data.data]);
      return mapSalaryRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to get current salary:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch current salary');
    }
  }

  // Create a new salary record
  async createSalaryRecord(request: CreateSalaryRecordRequest): Promise<SalaryRecord> {
    try {
      const response = await apiClient.post<ApiResponse<SalaryRecordApiResponse>>(
        '/salaryrecords',
        request
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create salary record');
      }

      return mapSalaryRecordFromApi(response.data.data);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to create salary record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create salary record');
    }
  }

  // Update an existing salary record
  async updateSalaryRecord(id: number, request: UpdateSalaryRecordRequest): Promise<SalaryRecord> {
    try {
      const response = await apiClient.put<ApiResponse<SalaryRecordApiResponse>>(
        `/salaryrecords/${id}`,
        request
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update salary record');
      }

      return mapSalaryRecordFromApi(response.data.data);
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to update salary record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update salary record');
    }
  }

  // Delete a salary record
  async deleteSalaryRecord(id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<string>>(
        `/salaryrecords/${id}`
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete salary record');
      }

      return true;
    } catch (error: any) {
      console.error('SalaryRecordService - Failed to delete salary record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete salary record');
    }
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  // Helper function to calculate salary change
  calculateSalaryChange(oldSalary: number, newSalary: number): {
    amount: number;
    percentage: number;
    type: 'increase' | 'decrease' | 'no_change';
  } {
    const amount = newSalary - oldSalary;
    const percentage = oldSalary > 0 ? (amount / oldSalary) * 100 : 0;
    
    let type: 'increase' | 'decrease' | 'no_change';
    if (amount > 0) type = 'increase';
    else if (amount < 0) type = 'decrease';
    else type = 'no_change';

    return { amount, percentage, type };
  }

  // Helper method to enrich salary records with employee data
  private async enrichSalaryRecordsWithEmployeeData(salaryRecords: SalaryRecordApiResponse[]): Promise<SalaryRecordApiResponse[]> {
    const recordsNeedingEmployeeData = salaryRecords.filter(
      record => !record.employeeName || !record.employeeNumber
    );

    if (recordsNeedingEmployeeData.length === 0) {
      return salaryRecords;
    }

    try {
      // Get unique employee IDs that need data
      const employeeIds = [...new Set(recordsNeedingEmployeeData.map(r => r.employeeId))];
      
      // Fetch employee details for these IDs
      const employeePromises = employeeIds.map(async (employeeId) => {
        try {
          const response = await apiClient.get<ApiResponse<any>>(`/employees/${employeeId}`);
          return response.data.data;
        } catch (error) {
          console.warn(`Failed to fetch employee ${employeeId}:`, error);
          return null;
        }
      });

      const employees = await Promise.all(employeePromises);
      const employeeMap = new Map();
      
      employees.forEach(employee => {
        if (employee) {
          employeeMap.set(employee.id, {
            name: `${employee.firstName} ${employee.lastName}`,
            number: employee.employeeNumber || `EMP${employee.id.toString().padStart(4, '0')}`
          });
        }
      });

      // Enrich the salary records
      return salaryRecords.map(record => {
        if (!record.employeeName || !record.employeeNumber) {
          const employeeData = employeeMap.get(record.employeeId);
          if (employeeData) {
            return {
              ...record,
              employeeName: record.employeeName || employeeData.name,
              employeeNumber: record.employeeNumber || employeeData.number
            };
          }
        }
        return record;
      });
    } catch (error) {
      console.warn('Failed to enrich salary records with employee data:', error);
      return salaryRecords;
    }
  }
}

// Helper function to map API response to frontend type
function mapSalaryRecordFromApi(apiRecord: SalaryRecordApiResponse): SalaryRecord {
  return {
    id: apiRecord.id,
    employeeId: apiRecord.employeeId,
    employeeName: apiRecord.employeeName,
    employeeNumber: apiRecord.employeeNumber,
    baseSalary: apiRecord.baseSalary,
    effectiveDate: apiRecord.effectiveDate,
    notes: apiRecord.notes,
    createdAt: apiRecord.createdAt,
    updatedAt: apiRecord.updatedAt,
  };
}

export const salaryRecordService = new SalaryRecordService(); 