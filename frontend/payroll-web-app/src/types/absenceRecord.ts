// Absence Record types based on backend DTOs
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
export interface AbsenceRecordApiResponse {
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

// Request types
export interface CreateAbsenceRecordRequest {
  employeeId: number;
  year: number;
  month: number;
  absenceDays: number;
}

export interface UpdateAbsenceRecordRequest {
  absenceDays: number;
}

// Query parameters for filtering
export interface AbsenceRecordQueryParams {
  year?: number;
  month?: number;
  employeeId?: number;
}

// Helper types for UI
export interface MonthOption {
  value: number;
  label: string;
}

export interface YearOption {
  value: number;
  label: string;
}

// Summary statistics types
export interface AbsenceRecordSummary {
  totalRecords: number;
  totalAbsenceDays: number;
  averageAbsenceDays: number;
  employeesWithAbsences: number;
  highestAbsenceDays: number;
  adjustmentRange: {
    min: number;
    max: number;
  };
}

// Validation types
export interface AbsenceValidationResult {
  isValid: boolean;
  maxAllowedDays?: number;
  currentAbsenceDays?: number;
  adjustmentPercentage?: number;
  thresholdName?: string;
  message?: string;
} 