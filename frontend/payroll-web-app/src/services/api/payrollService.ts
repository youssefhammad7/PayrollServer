import apiClient from './apiClient';
import type { 
  PayrollSnapshot, 
  PayrollSnapshotApiResponse,
  PayrollCalculationParams,
  PayrollSummary
} from '../../types/payroll';
import type { ApiResponse } from '../auth/authService';

class PayrollService {
  // Calculate gross pay for a specific employee (preview without saving)
  async calculateGrossPay(employeeId: number, year: number, month: number): Promise<PayrollSnapshot> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse>>(
        `/Payroll/calculate/${employeeId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to calculate gross pay');
      }

      return mapPayrollSnapshotFromApi(response.data.data);
    } catch (error: any) {
      console.error('PayrollService - Failed to calculate gross pay:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to calculate gross pay');
    }
  }

  // Calculate gross pay for all employees (preview without saving)
  async calculateGrossPayForAll(year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/calculate-all/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to calculate gross pay for all employees');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to calculate gross pay for all:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to calculate gross pay for all employees');
    }
  }

  // Generate and persist payroll snapshots for all employees
  async generateMonthlyPayrollSnapshots(year: number, month: number): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/Payroll/generate/${year}/${month}`
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to generate payroll snapshots');
      }

      return true;
    } catch (error: any) {
      console.error('PayrollService - Failed to generate payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate payroll snapshots');
    }
  }

  // Get all payroll snapshots for a given month
  async getPayrollSnapshots(year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payroll snapshots');
    }
  }

  // Get payroll snapshots for a specific employee
  async getPayrollSnapshotsForEmployee(employeeId: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/employee/${employeeId}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch employee payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get employee payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch employee payroll snapshots');
    }
  }

  // Get payroll snapshot for a specific employee for a given month
  async getPayrollSnapshot(employeeId: number, year: number, month: number): Promise<PayrollSnapshot> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse>>(
        `/Payroll/employee/${employeeId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Payroll snapshot not found');
      }

      return mapPayrollSnapshotFromApi(response.data.data);
    } catch (error: any) {
      console.error('PayrollService - Failed to get payroll snapshot:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payroll snapshot');
    }
  }

  // Get payroll snapshots for a specific department for a given month
  async getPayrollSnapshotsByDepartment(departmentId: number, year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/department/${departmentId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch department payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get department payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch department payroll snapshots');
    }
  }

  // Calculate payroll summary for a given month
  calculatePayrollSummary(payrollSnapshots: PayrollSnapshot[]): PayrollSummary {
    if (payrollSnapshots.length === 0) {
      return {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        monthName: new Date().toLocaleDateString('default', { month: 'long' }),
        totalEmployees: 0,
        totalBaseSalary: 0,
        totalDepartmentIncentives: 0,
        totalServiceIncentives: 0,
        totalAttendanceAdjustments: 0,
        totalGrossSalary: 0,
        averageGrossSalary: 0,
      };
    }

    const firstSnapshot = payrollSnapshots[0];
    const totalBaseSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.baseSalary, 0);
    const totalDepartmentIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.departmentIncentiveAmount, 0);
    const totalServiceIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.serviceYearsIncentiveAmount, 0);
    const totalAttendanceAdjustments = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.attendanceAdjustmentAmount, 0);
    const totalGrossSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.grossSalary, 0);

    return {
      year: firstSnapshot.year,
      month: firstSnapshot.month,
      monthName: firstSnapshot.monthName,
      totalEmployees: payrollSnapshots.length,
      totalBaseSalary,
      totalDepartmentIncentives,
      totalServiceIncentives,
      totalAttendanceAdjustments,
      totalGrossSalary,
      averageGrossSalary: totalGrossSalary / payrollSnapshots.length,
      processingDate: firstSnapshot.createdAt,
    };
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Helper function to format percentage
  formatPercentage(percentage: number): string {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  }

  // Helper function to get month name
  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleDateString('default', { month: 'long' });
  }

  // Helper function to check if payroll exists for a period
  async hasPayrollForPeriod(year: number, month: number): Promise<boolean> {
    try {
      const snapshots = await this.getPayrollSnapshots(year, month);
      return snapshots.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Helper function to map API response to frontend type
function mapPayrollSnapshotFromApi(apiSnapshot: PayrollSnapshotApiResponse): PayrollSnapshot {
  return {
    id: apiSnapshot.id,
    employeeId: apiSnapshot.employeeId,
    employeeName: apiSnapshot.employeeName,
    employeeNumber: apiSnapshot.employeeNumber,
    departmentName: apiSnapshot.departmentName,
    jobGradeName: apiSnapshot.jobGradeName,
    year: apiSnapshot.year,
    month: apiSnapshot.month,
    monthName: new Date(apiSnapshot.year, apiSnapshot.month - 1, 1).toLocaleDateString('default', { month: 'long' }),
    baseSalary: apiSnapshot.baseSalary,
    departmentIncentiveAmount: apiSnapshot.departmentIncentiveAmount,
    serviceYearsIncentiveAmount: apiSnapshot.serviceYearsIncentiveAmount,
    attendanceAdjustmentAmount: apiSnapshot.attendanceAdjustmentAmount,
    grossSalary: apiSnapshot.grossSalary,
    departmentIncentivePercentage: apiSnapshot.departmentIncentivePercentage,
    serviceYearsIncentivePercentage: apiSnapshot.serviceYearsIncentivePercentage,
    attendanceAdjustmentPercentage: apiSnapshot.attendanceAdjustmentPercentage,
    absenceDays: apiSnapshot.absenceDays,
    yearsOfService: apiSnapshot.yearsOfService,
    createdAt: apiSnapshot.createdAt,
    updatedAt: apiSnapshot.updatedAt,
  };
}

export const payrollService = new PayrollService(); 