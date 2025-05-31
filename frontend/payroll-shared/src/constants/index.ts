// Environment-aware API base URL getter
const getApiBaseUrl = (): string => {
  // Handle both browser and Node.js environments
  const envUrl = typeof window !== 'undefined' 
    ? import.meta.env?.VITE_API_BASE_URL 
    : process.env.VITE_API_BASE_URL;
  
  const defaultUrl = 'https://localhost:7154/api';
  
  if (!envUrl) {
    return defaultUrl;
  }
  
  // Basic URL validation
  try {
    new URL(envUrl);
    return envUrl;
  } catch {
    console.warn(`Invalid API base URL: ${envUrl}, falling back to default`);
    return defaultUrl;
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'payroll_auth_token',
  USER_KEY: 'payroll_user_data',
  REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  HR_CLERK: 'HR Clerk',
  READ_ONLY: 'Read-Only',
} as const;

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  TERMINATED: 'Terminated',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  // User Management
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  
  // Employee Management
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_CREATE: '/employees/create',
  EMPLOYEE_EDIT: '/employees/:id/edit',
  
  // Department Management
  DEPARTMENTS: '/departments',
  DEPARTMENT_DETAIL: '/departments/:id',
  DEPARTMENT_CREATE: '/departments/create',
  DEPARTMENT_EDIT: '/departments/:id/edit',
  
  // Job Grades
  JOB_GRADES: '/job-grades',
  JOB_GRADE_DETAIL: '/job-grades/:id',
  JOB_GRADE_CREATE: '/job-grades/create',
  JOB_GRADE_EDIT: '/job-grades/:id/edit',
  
  // Salary Management
  SALARY_RECORDS: '/salary-records',
  SALARY_RECORD_CREATE: '/salary-records/create',
  SALARY_RECORD_EDIT: '/salary-records/:id/edit',
  
  // Attendance
  ABSENCE_RECORDS: '/absence-records',
  ABSENCE_RECORD_CREATE: '/absence-records/create',
  ABSENCE_RECORD_EDIT: '/absence-records/:id/edit',
  ABSENCE_THRESHOLDS: '/absence-thresholds',
  
  // Service Brackets
  SERVICE_BRACKETS: '/service-brackets',
  SERVICE_BRACKET_CREATE: '/service-brackets/create',
  SERVICE_BRACKET_EDIT: '/service-brackets/:id/edit',
  
  // Payroll
  PAYROLL_CALCULATION: '/payroll/calculation',
  PAYROLL_REVIEW: '/payroll/review',
  PAYROLL_SNAPSHOTS: '/payroll/snapshots',
  
  // Reports
  REPORTS: '/reports',
  REPORTS_ATTENDANCE: '/reports/attendance',
  REPORTS_SALARY: '/reports/salary',
  REPORTS_INCENTIVES: '/reports/incentives',
  REPORTS_DIRECTORY: '/reports/directory',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  MONTH_YEAR: 'MM/YYYY',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  EMPLOYEE_NUMBER_REGEX: /^[A-Z0-9]{6,10}$/,
  PHONE_REGEX: /^[0-9\-\+\(\)\s]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// UI Constants
export const UI = {
  DRAWER_WIDTH: 280,
  DRAWER_WIDTH_COLLAPSED: 60,
  HEADER_HEIGHT: 64,
  DEBOUNCE_DELAY: 300,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME_MODE: 'payroll_theme_mode',
  DRAWER_OPEN: 'payroll_drawer_open',
  USER_PREFERENCES: 'payroll_user_preferences',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please correct the validation errors.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
} as const; 