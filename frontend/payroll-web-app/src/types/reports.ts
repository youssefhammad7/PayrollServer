// Report types based on backend DTOs
export interface AttendanceReportItem {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  year: number;
  month: number;
  monthName: string;
  absenceDays: number;
  adjustmentPercentage?: number;
  adjustmentAmount: number;
  lastUpdated?: string;
}

export interface IncentiveReportItem {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  year: number;
  month: number;
  monthName: string;
  baseSalary: number;
  departmentIncentiveAmount: number;
  serviceYearsIncentiveAmount: number;
  attendanceAdjustmentAmount: number;
  totalIncentives: number;
  totalDeductions: number;
}

export interface EmployeeDirectoryItem {
  id: number;
  employeeNumber: string;
  fullName: string;
  departmentName: string;
  jobGradeName: string;
  email: string;
  phoneNumber: string;
  address: string;
  hiringDate?: string;
  yearsOfService?: number;
}

export interface SalaryReportItem {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  jobGradeName: string;
  year: number;
  month: number;
  monthName: string;
  baseSalary: number;
  grossSalary: number;
  hasPayrollRecord: boolean;
}

export interface DepartmentSalarySummary {
  departmentName: string;
  employeeCount: number;
  totalBaseSalary: number;
  totalGrossSalary: number;
  totalIncentives: number;
}

export interface SalaryReportSummary {
  year: number;
  month: number;
  monthName: string;
  totalEmployees: number;
  totalBaseSalary: number;
  totalGrossSalary: number;
  totalIncentives: number;
  departmentSummaries: Record<string, DepartmentSalarySummary>;
}

export interface SalaryReportResponse {
  employees: SalaryReportItem[];
  summary: SalaryReportSummary;
}

// Common report parameters
export interface ReportParams {
  year?: number;
  month?: number;
  departmentId?: number;
}

// Report types enum
export enum ReportType {
  ATTENDANCE = 'attendance',
  SALARY = 'salary',
  INCENTIVES = 'incentives',
  EMPLOYEE_DIRECTORY = 'employee-directory'
}

// Export format types
export type ExportFormat = 'csv' | 'pdf'; 