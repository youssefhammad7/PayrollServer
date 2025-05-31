// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  token: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Employee Types
export interface Employee {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  hiringDate?: string;
  status: string;
  departmentId: number;
  departmentName?: string;
  jobGradeId: number;
  jobGradeName?: string;
  createdAt: string;
  updatedAt?: string;
}

// Department Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  incentivePercentage?: number;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Job Grade Types
export interface JobGrade {
  id: number;
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Salary Record Types
export interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  baseSalary: number;
  effectiveDate: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Service Bracket Types
export interface ServiceBracket {
  id: number;
  name: string;
  minYears: number;
  maxYears?: number;
  incentivePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Absence Record Types
export interface AbsenceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  year: number;
  month: number;
  absenceDays: number;
  adjustmentPercentage?: number;
  createdAt: string;
  updatedAt?: string;
}

// Absence Threshold Types
export interface AbsenceThreshold {
  id: number;
  name: string;
  minDays: number;
  maxDays?: number;
  adjustmentPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Payroll Snapshot Types
export interface PayrollSnapshot {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName?: string;
  jobGradeName?: string;
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
  yearsOfService: number;
}

// Report Types
export interface AttendanceReportItem {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  absenceDays: number;
  adjustmentPercentage: number;
}

export interface IncentiveReportItem {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  departmentIncentiveAmount: number;
  serviceYearsIncentiveAmount: number;
  attendanceAdjustmentAmount: number;
  totalIncentives: number;
}

export interface EmployeeDirectoryItem {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  email: string;
  phoneNumber?: string;
  departmentName: string;
  jobGradeName: string;
  status: string;
}

export interface SalaryReportItem {
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  departmentName: string;
  baseSalary: number;
  grossSalary: number;
}

// Form Request Types
export interface CreateEmployeeRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  hiringDate?: string;
  departmentId: number;
  jobGradeId: number;
  initialSalary?: number;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  departmentId: number;
  jobGradeId: number;
  status: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
}

export interface CreateSalaryRecordRequest {
  employeeId: number;
  baseSalary: number;
  effectiveDate: string;
  notes?: string;
} 