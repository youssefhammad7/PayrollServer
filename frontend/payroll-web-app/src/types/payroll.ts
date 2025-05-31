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

// Payroll Summary for review interface
export interface PayrollReviewSummary {
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
  generatedAt?: string;
  // Department breakdown
  departmentBreakdown: DepartmentPayrollSummary[];
  // Status tracking
  hasAnyErrors: boolean;
  missingEmployees: number;
  processedEmployees: number;
}

// Department-wise payroll summary
export interface DepartmentPayrollSummary {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
  totalBaseSalary: number;
  totalIncentives: number;
  totalAdjustments: number;
  totalGrossSalary: number;
  averageGrossSalary: number;
  hasErrors: boolean;
}

// Payroll Review Status
export type PayrollStatus = 'draft' | 'calculated' | 'under_review' | 'approved' | 'rejected';

// Payroll Review Comments/Actions
export interface PayrollReviewAction {
  id: string;
  employeeId?: number;
  employeeName?: string;
  action: 'approve' | 'reject' | 'request_change' | 'comment';
  comment: string;
  reviewedBy: string;
  reviewedAt: string;
  resolved: boolean;
}

// Payroll Batch for tracking approval workflow
export interface PayrollBatch {
  id: string;
  year: number;
  month: number;
  monthName: string;
  status: PayrollStatus;
  totalEmployees: number;
  processedEmployees: number;
  totalGrossSalary: number;
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  actions: PayrollReviewAction[];
}

// Employee payroll validation result
export interface PayrollValidationResult {
  employeeId: number;
  employeeName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculationBreakdown: {
    baseSalary: number;
    departmentIncentive: number;
    serviceIncentive: number;
    attendanceAdjustment: number;
    grossSalary: number;
  };
}

// Payroll Review Request
export interface PayrollReviewRequest {
  year: number;
  month: number;
  action: 'approve' | 'reject' | 'request_changes';
  comment?: string;
  employeeIds?: number[]; // For partial approval
}

// Payroll comparison for changes detection
export interface PayrollComparison {
  employeeId: number;
  employeeName: string;
  current: PayrollSnapshot;
  previous?: PayrollSnapshot;
  hasChanges: boolean;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changePercentage?: number;
  }[];
} 