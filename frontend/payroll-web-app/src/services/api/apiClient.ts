import axios from 'axios';
import { API_CONFIG } from '../../../../payroll-shared/src/constants';

// Create axios instance using centralized configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('payroll_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} - Token: ${token.substring(0, 20)}...`);
    } else {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} - No token`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - clearing auth data and redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('payroll_auth_token');
      localStorage.removeItem('payroll_user_data');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Convenience method for testing API endpoints
export const testApiEndpoint = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) => {
  try {
    console.log(`Testing API endpoint: ${method} ${endpoint}`);
    
    const config = {
      method: method.toLowerCase(),
      url: endpoint,
      ...(data && { data })
    };
    
    const response = await apiClient.request(config);
    
    console.log('✅ API Test Success:', {
      status: response.status,
      endpoint: endpoint,
      hasData: !!response.data
    });
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      message: `${method} ${endpoint} - Success (${response.status})`
    };
  } catch (error: any) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data,
      message: `${method} ${endpoint} - Failed (${error.response?.status || 'Network Error'}): ${error.response?.data?.message || error.message}`
    };
  }
}; 