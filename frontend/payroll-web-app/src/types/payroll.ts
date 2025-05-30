// Payroll types based on backend DTOs
export interface PayrollSnapshot {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  jobGradeName: string;
  year: number;
  month: number;
  monthName: string;
  baseSalary: number;
  departmentIncentiveAmount: number;
  serviceYearsIncentiveAmount: number;
  attendanceAdjustmentAmount: number;
  grossSalary: number;
  departmentIncentivePercentage?: number;
  serviceYearsIncentivePercentage?: number;
  attendanceAdjustmentPercentage?: number;
  absenceDays?: number;
  yearsOfService?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  baseSalary: number;
  effectiveDate: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AbsenceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  monthName: string;
  absenceDays: number;
  adjustmentPercentage?: number;
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface PayrollSnapshotApiResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  jobGradeName: string;
  year: number;
  month: number;
  baseSalary: number;
  departmentIncentiveAmount: number;
  serviceYearsIncentiveAmount: number;
  attendanceAdjustmentAmount: number;
  grossSalary: number;
  departmentIncentivePercentage?: number;
  serviceYearsIncentivePercentage?: number;
  attendanceAdjustmentPercentage?: number;
  absenceDays?: number;
  yearsOfService?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SalaryRecordApiResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  baseSalary: number;
  effectiveDate: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AbsenceRecordApiResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  absenceDays: number;
  adjustmentPercentage?: number;
  createdAt: string;
  updatedAt?: string;
}

// Request types
export interface CreateSalaryRecordRequest {
  employeeId: number;
  baseSalary: number;
  effectiveDate: string;
  notes: string;
}

export interface UpdateSalaryRecordRequest {
  employeeId: number;
  baseSalary: number;
  effectiveDate: string;
  notes: string;
}

export interface CreateAbsenceRecordRequest {
  employeeId: number;
  year: number;
  month: number;
  absenceDays: number;
}

export interface UpdateAbsenceRecordRequest {
  employeeId: number;
  year: number;
  month: number;
  absenceDays: number;
}

// Payroll calculation parameters
export interface PayrollCalculationParams {
  year: number;
  month: number;
  employeeId?: number;
  departmentId?: number;
}

// Payroll processing status
export interface PayrollProcessingStatus {
  isProcessing: boolean;
  progress: number;
  currentEmployee?: string;
  errorMessage?: string;
  completedCount: number;
  totalCount: number;
}

// Payroll summary statistics
export interface PayrollSummary {
  year: number;
  month: number;
  monthName: string;
  totalEmployees: number;
  totalBaseSalary: number;
  totalDepartmentIncentives: number;
  totalServiceIncentives: number;
  totalAttendanceAdjustments: number;
  totalGrossSalary: number;
  averageGrossSalary: number;
  processingDate?: string;
} 