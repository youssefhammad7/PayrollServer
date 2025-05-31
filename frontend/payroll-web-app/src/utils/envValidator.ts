/**
 * Environment Validation Utility
 * Validates environment configuration and provides debugging information
 */

import { ENV_CONFIG } from '../config/environment';

export interface EnvValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  config: typeof ENV_CONFIG;
}

export const validateEnvironment = (): EnvValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let isValid = true;

  // Validate API Base URL
  try {
    new URL(ENV_CONFIG.API_BASE_URL);
  } catch {
    errors.push(`Invalid API base URL: ${ENV_CONFIG.API_BASE_URL}`);
    isValid = false;
  }

  // Check if using default values (might indicate missing .env file)
  if (ENV_CONFIG.API_BASE_URL === 'https://localhost:7154/api') {
    warnings.push('Using default API base URL. Consider creating a .env.local file for custom configuration.');
  }

  // Check for development environment
  if (ENV_CONFIG.DEV_MODE && !ENV_CONFIG.USE_REAL_API) {
    warnings.push('Running in development mode with mock API enabled.');
  }

  return {
    isValid,
    warnings,
    errors,
    config: ENV_CONFIG,
  };
};

export const logEnvironmentStatus = (): void => {
  const validation = validateEnvironment();
  
  console.group('🔧 Environment Configuration Status');
  console.log('Configuration:', validation.config);
  
  if (validation.errors.length > 0) {
    console.error('❌ Errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Environment configuration is valid');
  }
  
  console.groupEnd();
}; 