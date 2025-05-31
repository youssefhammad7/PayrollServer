import apiClient from './apiClient';

export interface StatisticData {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface DashboardStatistics {
  totalEmployees: StatisticData;
  totalDepartments: StatisticData;
  monthlyPayroll: StatisticData;
  reportsGenerated: StatisticData;
}

export interface RecentActivity {
  title: string;
  description: string;
  time: string;
  status: string;
  icon: string;
  type: string;
}

export interface SystemOverview {
  systemStatus: string;
  lastSync: string;
  userName: string;
  userRole: string;
  totalActiveUsers: number;
  databaseStatus: string;
  version: string;
}

export interface PayrollSummary {
  totalPayroll: number;
  averagePayroll: number;
  employeesWithPayroll: number;
  month: string;
  processedDate: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  roles: string[];
  navigationPath: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<DashboardStatistics> {
    const response = await apiClient.get('/dashboard/statistics');
    
    // The backend returns data wrapped in ApiResponse format: 
    // { isSuccess: true, data: {...statistics...}, message: "...", statusCode: 200 }
    console.log('Raw API response for statistics:', response.data);
    
    // Extract the actual statistics object from the response wrapper
    if (response.data && response.data.isSuccess && response.data.data) {
      return response.data.data;
    }
    
    // If the response doesn't have the expected structure, throw an error
    console.error('Unexpected API response format for statistics:', response.data);
    throw new Error('Failed to load dashboard statistics');
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get(`/dashboard/recent-activities?limit=${limit}`);
    
    // The backend returns data wrapped in ApiResponse format: 
    // { isSuccess: true, data: [...activities...], message: "...", statusCode: 200 }
    console.log('Raw API response for activities:', response.data);
    
    // Extract the actual activities array from the response wrapper
    if (response.data && response.data.isSuccess && response.data.data) {
      return response.data.data;
    }
    
    // If the response doesn't have the expected structure, return empty array
    console.warn('Unexpected API response format for activities:', response.data);
    return [];
  },

  /**
   * Get system overview
   */
  async getSystemOverview(): Promise<SystemOverview> {
    const response = await apiClient.get('/dashboard/system-overview');
    
    // The backend returns data wrapped in ApiResponse format: 
    // { isSuccess: true, data: {...overview...}, message: "...", statusCode: 200 }
    console.log('Raw API response for system overview:', response.data);
    
    // Extract the actual overview object from the response wrapper
    if (response.data && response.data.isSuccess && response.data.data) {
      return response.data.data;
    }
    
    // If the response doesn't have the expected structure, throw an error
    console.error('Unexpected API response format for system overview:', response.data);
    throw new Error('Failed to load system overview');
  },

  /**
   * Get payroll summary
   */
  async getPayrollSummary(): Promise<PayrollSummary> {
    const response = await apiClient.get('/dashboard/payroll-summary');
    
    // The backend returns data wrapped in ApiResponse format: 
    // { isSuccess: true, data: {...summary...}, message: "...", statusCode: 200 }
    console.log('Raw API response for payroll summary:', response.data);
    
    // Extract the actual summary object from the response wrapper
    if (response.data && response.data.isSuccess && response.data.data) {
      return response.data.data;
    }
    
    // If the response doesn't have the expected structure, throw an error
    console.error('Unexpected API response format for payroll summary:', response.data);
    throw new Error('Failed to load payroll summary');
  },

  /**
   * Get quick actions based on user role
   */
  getQuickActions(): QuickAction[] {
    return [
      {
        title: 'Add Employee',
        description: 'Register a new employee',
        icon: 'PersonAdd',
        color: 'primary',
        roles: ['Admin', 'HR Clerk'],
        navigationPath: '/employees/create'
      },
      {
        title: 'Calculate Payroll',
        description: 'Run monthly payroll calculation',
        icon: 'Calculate',
        color: 'secondary',
        roles: ['Admin', 'HR Clerk'],
        navigationPath: '/payroll/calculate'
      },
      {
        title: 'View Reports',
        description: 'Access payroll and attendance reports',
        icon: 'Assessment',
        color: 'info',
        roles: ['Admin', 'HR Clerk', 'Read-Only'],
        navigationPath: '/reports'
      },
      {
        title: 'Manage Employees',
        description: 'View and update employee information',
        icon: 'People',
        color: 'success',
        roles: ['Admin', 'HR Clerk', 'Read-Only'],
        navigationPath: '/employees'
      }
    ];
  }
}; 