// Employee types based on backend API structure

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth: string;
  hireDate: string;
  departmentId: number;
  departmentName?: string;
  jobGradeId: number;
  jobGradeName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth: string;
  hireDate: string;
  departmentId: number;
  jobGradeId: number;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  id: string;
}

export interface EmployeesResponse {
  employees: Employee[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  departmentId?: number;
  jobGradeId?: number;
  isActive?: boolean;
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
  description?: string;
  isActive: boolean;
}

export interface JobGrade {
  id: number;
  name: string;
  minSalary: number;
  maxSalary: number;
  description?: string;
  isActive: boolean;
} 