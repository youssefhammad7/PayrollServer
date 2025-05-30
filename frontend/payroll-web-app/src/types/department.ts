// Department types based on backend API structure

export interface Department {
  id: number;
  name: string;
  incentivePercentage?: number;       // Nullable
  incentiveSetDate?: string;          // ISO date string, nullable
  employeeCount: number;
  createdAt: string;                  // ISO date string
  updatedAt?: string;                 // ISO date string, nullable
}

export interface CreateDepartmentRequest {
  name: string;
  incentivePercentage?: number;       // Optional when creating
}

export interface UpdateDepartmentRequest {
  name: string;
}

export interface UpdateDepartmentIncentiveRequest {
  incentivePercentage: number;
}

export interface DepartmentIncentiveHistory {
  id: number;
  departmentId: number;
  departmentName: string;
  incentivePercentage: number;
  effectiveDate: string;              // ISO date string
  createdAt: string;                  // ISO date string
}

// Form data structure for React Hook Form
export interface DepartmentFormData {
  name: string;
  incentivePercentage: string;        // Form handles as string, converted to number
}

export interface IncentiveFormData {
  incentivePercentage: string;        // Form handles as string, converted to number
} 