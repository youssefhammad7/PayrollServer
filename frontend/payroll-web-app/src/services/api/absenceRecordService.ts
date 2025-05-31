import apiClient from './apiClient';
import type { 
  AbsenceRecord, 
  AbsenceRecordApiResponse,
  CreateAbsenceRecordRequest,
  UpdateAbsenceRecordRequest,
  AbsenceRecordQueryParams,
  AbsenceRecordSummary,
  MonthOption,
  YearOption
} from '../../types/absenceRecord';
import type { ApiResponse } from '../auth/authService';

class AbsenceRecordService {
  // Get all absence records for a specific year and month
  async getAbsenceRecords(year: number, month: number): Promise<AbsenceRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceRecordApiResponse[]>>(
        `/absencerecords?year=${year}&month=${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch absence records');
      }

      // Enrich absence records with employee data if missing (similar to salary records)
      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData(response.data.data);
      return enrichedRecords.map(mapAbsenceRecordFromApi);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to get absence records:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence records');
    }
  }

  // Get absence records for a specific employee
  async getAbsenceRecordsForEmployee(employeeId: number): Promise<AbsenceRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceRecordApiResponse[]>>(
        `/absencerecords/employee/${employeeId}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch absence records');
      }

      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData(response.data.data);
      return enrichedRecords.map(mapAbsenceRecordFromApi);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to get absence records for employee:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence records');
    }
  }

  // Get absence record by ID
  async getAbsenceRecord(id: number): Promise<AbsenceRecord> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceRecordApiResponse>>(
        `/absencerecords/${id}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Absence record not found');
      }

      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData([response.data.data]);
      return mapAbsenceRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to get absence record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence record');
    }
  }

  // Get absence record for a specific employee, year, and month
  async getAbsenceRecordForMonth(employeeId: number, year: number, month: number): Promise<AbsenceRecord> {
    try {
      const response = await apiClient.get<ApiResponse<AbsenceRecordApiResponse>>(
        `/absencerecords/employee/${employeeId}/year/${year}/month/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Absence record not found');
      }

      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData([response.data.data]);
      return mapAbsenceRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to get absence record for month:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch absence record');
    }
  }

  // Create a new absence record
  async createAbsenceRecord(request: CreateAbsenceRecordRequest): Promise<AbsenceRecord> {
    try {
      const response = await apiClient.post<ApiResponse<AbsenceRecordApiResponse>>(
        '/absencerecords',
        request
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create absence record');
      }

      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData([response.data.data]);
      return mapAbsenceRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to create absence record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create absence record');
    }
  }

  // Update an existing absence record
  async updateAbsenceRecord(id: number, request: UpdateAbsenceRecordRequest): Promise<AbsenceRecord> {
    try {
      const response = await apiClient.put<ApiResponse<AbsenceRecordApiResponse>>(
        `/absencerecords/${id}`,
        request
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update absence record');
      }

      const enrichedRecords = await this.enrichAbsenceRecordsWithEmployeeData([response.data.data]);
      return mapAbsenceRecordFromApi(enrichedRecords[0]);
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to update absence record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update absence record');
    }
  }

  // Delete an absence record
  async deleteAbsenceRecord(id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<string>>(
        `/absencerecords/${id}`
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to delete absence record');
      }

      return true;
    } catch (error: any) {
      console.error('AbsenceRecordService - Failed to delete absence record:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete absence record');
    }
  }

  // Helper method to enrich absence records with employee data
  private async enrichAbsenceRecordsWithEmployeeData(absenceRecords: AbsenceRecordApiResponse[]): Promise<AbsenceRecordApiResponse[]> {
    const recordsNeedingEmployeeData = absenceRecords.filter(
      record => !record.employeeName
    );

    if (recordsNeedingEmployeeData.length === 0) {
      return absenceRecords;
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
          employeeMap.set(employee.id, `${employee.firstName} ${employee.lastName}`);
        }
      });

      // Enrich the absence records
      return absenceRecords.map(record => {
        if (!record.employeeName) {
          const employeeName = employeeMap.get(record.employeeId);
          if (employeeName) {
            return {
              ...record,
              employeeName: employeeName
            };
          }
        }
        return record;
      });
    } catch (error) {
      console.warn('Failed to enrich absence records with employee data:', error);
      return absenceRecords;
    }
  }

  // Helper function to get month options
  getMonthOptions(): MonthOption[] {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ];
  }

  // Helper function to get year options
  getYearOptions(): YearOption[] {
    const currentYear = new Date().getFullYear();
    const years: YearOption[] = [];
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push({ value: year, label: year.toString() });
    }
    
    return years;
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  // Helper function to format month/year
  formatMonthYear(year: number, month: number): string {
    try {
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
      return `${month}/${year}`;
    }
  }

  // Helper function to calculate summary statistics
  calculateSummary(records: AbsenceRecord[]): AbsenceRecordSummary {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        totalAbsenceDays: 0,
        averageAbsenceDays: 0,
        employeesWithAbsences: 0,
        highestAbsenceDays: 0,
        adjustmentRange: { min: 0, max: 0 }
      };
    }

    const totalAbsenceDays = records.reduce((sum, record) => sum + record.absenceDays, 0);
    const uniqueEmployees = new Set(records.map(r => r.employeeId)).size;
    const adjustmentPercentages = records
      .map(r => r.adjustmentPercentage)
      .filter(p => p !== undefined && p !== null) as number[];

    return {
      totalRecords: records.length,
      totalAbsenceDays,
      averageAbsenceDays: totalAbsenceDays / records.length,
      employeesWithAbsences: uniqueEmployees,
      highestAbsenceDays: Math.max(...records.map(r => r.absenceDays)),
      adjustmentRange: {
        min: adjustmentPercentages.length > 0 ? Math.min(...adjustmentPercentages) : 0,
        max: adjustmentPercentages.length > 0 ? Math.max(...adjustmentPercentages) : 0
      }
    };
  }

  // Helper function to get adjustment color based on percentage
  getAdjustmentColor(adjustmentPercentage?: number): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    if (!adjustmentPercentage) return 'default';
    
    if (adjustmentPercentage > 0) return 'success';
    if (adjustmentPercentage < 0) return 'error';
    return 'default';
  }

  // Helper function to format percentage
  formatPercentage(percentage?: number): string {
    if (percentage === undefined || percentage === null) return 'N/A';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }
}

// Helper function to map API response to frontend type
function mapAbsenceRecordFromApi(apiRecord: AbsenceRecordApiResponse): AbsenceRecord {
  return {
    id: apiRecord.id,
    employeeId: apiRecord.employeeId,
    employeeName: apiRecord.employeeName,
    year: apiRecord.year,
    month: apiRecord.month,
    monthName: apiRecord.monthName,
    absenceDays: apiRecord.absenceDays,
    adjustmentPercentage: apiRecord.adjustmentPercentage,
    createdAt: apiRecord.createdAt,
    updatedAt: apiRecord.updatedAt,
  };
}

export const absenceRecordService = new AbsenceRecordService(); 