// Employee types based on backend API structure

export interface Employee {
  id: number;                    // Primary key (integer)
  employeeNumber?: string;       // The display employee ID from backend EmployeeNumber
  firstName: string;
  lastName: string;
  fullName?: string;             // Computed property from backend
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth: string;          // ISO date string
  hiringDate: string;           // Required - ISO date string (maps to backend HiringDate)
  employmentStatus: string;     // Required - Active/Inactive etc  
  departmentId: number;
  departmentName?: string;
  departmentIncentivePercentage?: number;
  jobGradeId: number;
  jobGradeName?: string;
  jobGradeMinSalary?: number;
  jobGradeMaxSalary?: number;
  currentSalary?: number;
  salaryEffectiveDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmployeeRequest {
  employeeId: string;             // Maps to EmployeeNumber in backend
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth: string;           // Will be converted to DateTime by backend
  hireDate: string;              // Will be converted to HiringDate by backend  
  departmentId: number;
  jobGradeId: number;
  initialSalary?: number;        // Optional initial salary
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth: string;           // Will be converted to DateTime by backend
  departmentId: number;
  jobGradeId: number;
  employmentStatus: string;      // Status can be updated but not employeeId or hireDate
}

export interface EmployeesResponse {
  items: Employee[];              // Backend returns "Items", not "employees"
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeQueryParams {
  page?: number;                  // Backend expects "page", not "pageNumber"
  pageSize?: number;
  searchTerm?: string;
  departmentId?: number;
  jobGradeId?: number;
  // Note: Backend doesn't have isActive filter, uses employmentStatus
}

// Form data structure for React Hook Form
export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  hireDate: string;
  departmentId: string;
  jobGradeId: string;
}

// Department and Job Grade types for dropdowns
export interface Department {
  id: number;
  name: string;
  incentivePercentage?: number;    // Matches backend DepartmentDto
  incentiveSetDate?: string;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface JobGrade {
  id: number;
  name: string;
  description: string;             // Required in backend
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
} 