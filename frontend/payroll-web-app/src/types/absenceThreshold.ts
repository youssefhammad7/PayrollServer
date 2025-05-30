// Absence Threshold types based on backend DTOs
export interface AbsenceThreshold {
  id: number;
  name: string;
  minAbsenceDays: number;
  maxAbsenceDays?: number;
  adjustmentPercentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAbsenceThresholdRequest {
  name: string;
  minAbsenceDays: number;
  maxAbsenceDays?: number;
  adjustmentPercentage: number;
  description: string;
  isActive: boolean;
}

export interface UpdateAbsenceThresholdRequest {
  name: string;
  minAbsenceDays: number;
  maxAbsenceDays?: number;
  adjustmentPercentage: number;
  description: string;
  isActive: boolean;
}

// API Response types
export interface AbsenceThresholdApiResponse {
  id: number;
  name: string;
  minAbsenceDays: number;
  maxAbsenceDays?: number;
  adjustmentPercentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// For overlap checking (similar to service brackets)
export interface AbsenceOverlapCheckRequest {
  minDays: number;
  maxDays?: number;
  excludeId?: number;
}

export interface AbsenceOverlapCheckResponse {
  hasOverlap: boolean;
} 