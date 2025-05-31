// Service Bracket types based on backend DTOs
export interface ServiceBracket {
  id: number;
  name: string;
  minYearsOfService: number;
  maxYearsOfService?: number;
  incentivePercentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServiceBracketRequest {
  name: string;
  minYearsOfService: number;
  maxYearsOfService?: number;
  incentivePercentage: number;
  description: string;
  isActive: boolean;
}

export interface UpdateServiceBracketRequest {
  name: string;
  minYearsOfService: number;
  maxYearsOfService?: number;
  incentivePercentage: number;
  description: string;
  isActive: boolean;
}

// API Response types
export interface ServiceBracketApiResponse {
  id: number;
  name: string;
  minYearsOfService: number;
  maxYearsOfService?: number;
  incentivePercentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// For overlap checking
export interface OverlapCheckRequest {
  minYears: number;
  maxYears?: number;
  excludeId?: number;
}

export interface OverlapCheckResponse {
  hasOverlap: boolean;
} 