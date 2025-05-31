// Salary Record types based on backend DTOs
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

// API Response types
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

// Query parameters for filtering
export interface SalaryRecordQueryParams {
  employeeId?: number;
  search?: string;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
}

// Salary validation types
export interface SalaryValidationResult {
  isValid: boolean;
  minSalary?: number;
  maxSalary?: number;
  jobGradeName?: string;
  message?: string;
} 