// Job Grade types based on backend DTOs
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

export interface CreateJobGradeRequest {
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
}

export interface UpdateJobGradeRequest {
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
}

// API Response types
export interface JobGradeApiResponse {
  id: number;
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
} 