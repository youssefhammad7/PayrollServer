/**
 * Environment Configuration Utility
 * Provides centralized access to environment variables with validation
 */

// Environment variable getters with validation
export const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7154/api';
  
  // Basic URL validation
  try {
    new URL(url);
    return url;
  } catch {
    console.warn(`Invalid API base URL: ${url}, falling back to default`);
    return 'https://localhost:7154/api';
  }
};

export const shouldUseRealApi = (): boolean => {
  return import.meta.env.VITE_USE_REAL_API !== 'false';
};

export const isDevMode = (): boolean => {
  return import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;
};

// Environment configuration object
export const ENV_CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  USE_REAL_API: shouldUseRealApi(),
  DEV_MODE: isDevMode(),
  NODE_ENV: import.meta.env.MODE,
} as const;

// Log configuration in development
if (isDevMode()) {
  console.log('🔧 Environment Configuration:', ENV_CONFIG);
} 