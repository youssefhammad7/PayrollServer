import apiClient from './apiClient';
import type {
  AttendanceReportItem,
  IncentiveReportItem,
  EmployeeDirectoryItem,
  SalaryReportItem,
  SalaryReportResponse,
  ReportParams,
  ExportFormat
} from '../../types/reports';
import { ReportType } from '../../types/reports';

class ReportService {
  // Get attendance report for a specific month
  async getAttendanceReport(year: number, month: number, departmentId?: number): Promise<AttendanceReportItem[]> {
    const params: Record<string, string> = {};
    if (departmentId) {
      params.departmentId = departmentId.toString();
    }

    const response = await apiClient.get(`/reports/attendance/${year}/${month}`, { params });
    return response.data.data;
  }

  // Get incentives report for a specific month
  async getIncentivesReport(year: number, month: number, departmentId?: number): Promise<IncentiveReportItem[]> {
    const params: Record<string, string> = {};
    if (departmentId) {
      params.departmentId = departmentId.toString();
    }

    const response = await apiClient.get(`/reports/incentives/${year}/${month}`, { params });
    return response.data.data;
  }

  // Get employee directory report
  async getEmployeeDirectoryReport(departmentId?: number): Promise<EmployeeDirectoryItem[]> {
    const params: Record<string, string> = {};
    if (departmentId) {
      params.departmentId = departmentId.toString();
    }

    const response = await apiClient.get('/reports/employee-directory', { params });
    return response.data.data;
  }

  // Get salary report for a specific month
  async getSalaryReport(year: number, month: number, departmentId?: number): Promise<SalaryReportResponse> {
    const params: Record<string, string> = {};
    if (departmentId) {
      params.departmentId = departmentId.toString();
    }

    const response = await apiClient.get(`/reports/salary/${year}/${month}`, { params });
    return response.data.data;
  }

  // Get individual employee salary report
  async getEmployeeSalaryReport(employeeId: number, year: number, month: number): Promise<SalaryReportItem> {
    const response = await apiClient.get(`/reports/salary/employee/${employeeId}/${year}/${month}`);
    return response.data.data;
  }

  // Export report to CSV
  async exportToCsv(reportType: ReportType, params: ReportParams = {}): Promise<Blob> {
    const queryParams: Record<string, string> = {};
    
    if (params.year) queryParams.year = params.year.toString();
    if (params.month) queryParams.month = params.month.toString();
    if (params.departmentId) queryParams.departmentId = params.departmentId.toString();

    const response = await apiClient.get(`/reports/export/csv/${reportType}`, {
      params: queryParams,
      responseType: 'blob'
    });

    return new Blob([response.data], { type: 'text/csv' });
  }

  // Export report to PDF
  async exportToPdf(reportType: ReportType, params: ReportParams = {}): Promise<Blob> {
    const queryParams: Record<string, string> = {};
    
    if (params.year) queryParams.year = params.year.toString();
    if (params.month) queryParams.month = params.month.toString();
    if (params.departmentId) queryParams.departmentId = params.departmentId.toString();

    const response = await apiClient.get(`/reports/export/pdf/${reportType}`, {
      params: queryParams,
      responseType: 'blob'
    });

    return new Blob([response.data], { type: 'application/pdf' });
  }

  // Helper function to download a blob as a file
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Helper function to get month name
  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
  }

  // Helper function to generate filename for exports
  generateFilename(reportType: ReportType, format: ExportFormat, params: ReportParams = {}): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (reportType) {
      case ReportType.ATTENDANCE:
        return `Attendance_Report_${params.year}_${params.month}.${format}`;
      case ReportType.SALARY:
        return `Salary_Report_${params.year}_${params.month}.${format}`;
      case ReportType.INCENTIVES:
        return `Incentives_Report_${params.year}_${params.month}.${format}`;
      case ReportType.EMPLOYEE_DIRECTORY:
        return `Employee_Directory_${timestamp}.${format}`;
      default:
        return `Report_${timestamp}.${format}`;
    }
  }
}

export const reportService = new ReportService(); 