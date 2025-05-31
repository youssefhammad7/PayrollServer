import apiClient from './apiClient';
import type { 
  PayrollSnapshot, 
  PayrollSnapshotApiResponse,
  PayrollCalculationParams,
  PayrollSummary,
  PayrollReviewSummary,
  DepartmentPayrollSummary,
  PayrollValidationResult,
  PayrollComparison,
  PayrollStatus,
  PayrollBatch,
  PayrollReviewRequest,
  PayrollReviewAction
} from '../../types/payroll';
import type { ApiResponse } from '../auth/authService';

class PayrollService {
  // Calculate gross pay for a specific employee (preview without saving)
  async calculateGrossPay(employeeId: number, year: number, month: number): Promise<PayrollSnapshot> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse>>(
        `/Payroll/calculate/${employeeId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to calculate gross pay');
      }

      return mapPayrollSnapshotFromApi(response.data.data);
    } catch (error: any) {
      console.error('PayrollService - Failed to calculate gross pay:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to calculate gross pay');
    }
  }

  // Calculate gross pay for all employees (preview without saving)
  async calculateGrossPayForAll(year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/calculate-all/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to calculate gross pay for all employees');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to calculate gross pay for all:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to calculate gross pay for all employees');
    }
  }

  // Generate and persist payroll snapshots for all employees
  async generateMonthlyPayrollSnapshots(year: number, month: number): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `/Payroll/generate/${year}/${month}`
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to generate payroll snapshots');
      }

      return true;
    } catch (error: any) {
      console.error('PayrollService - Failed to generate payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate payroll snapshots');
    }
  }

  // Get all payroll snapshots for a given month
  async getPayrollSnapshots(year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payroll snapshots');
    }
  }

  // Get payroll snapshots for a specific employee
  async getPayrollSnapshotsForEmployee(employeeId: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/employee/${employeeId}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch employee payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get employee payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch employee payroll snapshots');
    }
  }

  // Get payroll snapshot for a specific employee for a given month
  async getPayrollSnapshot(employeeId: number, year: number, month: number): Promise<PayrollSnapshot> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse>>(
        `/Payroll/employee/${employeeId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Payroll snapshot not found');
      }

      return mapPayrollSnapshotFromApi(response.data.data);
    } catch (error: any) {
      console.error('PayrollService - Failed to get payroll snapshot:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payroll snapshot');
    }
  }

  // Get payroll snapshots for a specific department for a given month
  async getPayrollSnapshotsByDepartment(departmentId: number, year: number, month: number): Promise<PayrollSnapshot[]> {
    try {
      const response = await apiClient.get<ApiResponse<PayrollSnapshotApiResponse[]>>(
        `/Payroll/department/${departmentId}/${year}/${month}`
      );

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch department payroll snapshots');
      }

      return response.data.data.map(mapPayrollSnapshotFromApi);
    } catch (error: any) {
      console.error('PayrollService - Failed to get department payroll snapshots:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch department payroll snapshots');
    }
  }

  // Calculate payroll summary for a given month
  calculatePayrollSummary(payrollSnapshots: PayrollSnapshot[]): PayrollSummary {
    if (payrollSnapshots.length === 0) {
      return {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        monthName: new Date().toLocaleDateString('default', { month: 'long' }),
        totalEmployees: 0,
        totalBaseSalary: 0,
        totalDepartmentIncentives: 0,
        totalServiceIncentives: 0,
        totalAttendanceAdjustments: 0,
        totalGrossSalary: 0,
        averageGrossSalary: 0,
      };
    }

    const firstSnapshot = payrollSnapshots[0];
    const totalBaseSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.baseSalary, 0);
    const totalDepartmentIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.departmentIncentiveAmount, 0);
    const totalServiceIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.serviceYearsIncentiveAmount, 0);
    const totalAttendanceAdjustments = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.attendanceAdjustmentAmount, 0);
    const totalGrossSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.grossSalary, 0);

    return {
      year: firstSnapshot.year,
      month: firstSnapshot.month,
      monthName: firstSnapshot.monthName,
      totalEmployees: payrollSnapshots.length,
      totalBaseSalary,
      totalDepartmentIncentives,
      totalServiceIncentives,
      totalAttendanceAdjustments,
      totalGrossSalary,
      averageGrossSalary: totalGrossSalary / payrollSnapshots.length,
      processingDate: firstSnapshot.createdAt,
    };
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  // Calculate comprehensive payroll review summary
  calculatePayrollReviewSummary(payrollSnapshots: PayrollSnapshot[]): PayrollReviewSummary {
    if (payrollSnapshots.length === 0) {
      return {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        monthName: new Date().toLocaleDateString('default', { month: 'long' }),
        totalEmployees: 0,
        totalBaseSalary: 0,
        totalDepartmentIncentives: 0,
        totalServiceIncentives: 0,
        totalAttendanceAdjustments: 0,
        totalGrossSalary: 0,
        averageGrossSalary: 0,
        departmentBreakdown: [],
        hasAnyErrors: false,
        missingEmployees: 0,
        processedEmployees: 0,
      };
    }

    const firstSnapshot = payrollSnapshots[0];
    
    // Calculate totals
    const totalBaseSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.baseSalary, 0);
    const totalDepartmentIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.departmentIncentiveAmount, 0);
    const totalServiceIncentives = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.serviceYearsIncentiveAmount, 0);
    const totalAttendanceAdjustments = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.attendanceAdjustmentAmount, 0);
    const totalGrossSalary = payrollSnapshots.reduce((sum, snapshot) => sum + snapshot.grossSalary, 0);

    // Calculate department breakdown
    const departmentMap = new Map<string, {
      departmentId: number;
      departmentName: string;
      snapshots: PayrollSnapshot[];
    }>();

    payrollSnapshots.forEach(snapshot => {
      const key = `${snapshot.departmentName}`;
      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          departmentId: 0, // We don't have departmentId in snapshot
          departmentName: snapshot.departmentName,
          snapshots: []
        });
      }
      departmentMap.get(key)!.snapshots.push(snapshot);
    });

    const departmentBreakdown: DepartmentPayrollSummary[] = Array.from(departmentMap.values()).map(dept => {
      const deptTotalBase = dept.snapshots.reduce((sum, s) => sum + s.baseSalary, 0);
      const deptTotalIncentives = dept.snapshots.reduce((sum, s) => 
        sum + s.departmentIncentiveAmount + s.serviceYearsIncentiveAmount, 0);
      const deptTotalAdjustments = dept.snapshots.reduce((sum, s) => sum + s.attendanceAdjustmentAmount, 0);
      const deptTotalGross = dept.snapshots.reduce((sum, s) => sum + s.grossSalary, 0);

      return {
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        employeeCount: dept.snapshots.length,
        totalBaseSalary: deptTotalBase,
        totalIncentives: deptTotalIncentives,
        totalAdjustments: deptTotalAdjustments,
        totalGrossSalary: deptTotalGross,
        averageGrossSalary: deptTotalGross / dept.snapshots.length,
        hasErrors: false, // Could be enhanced with validation logic
      };
    });

    return {
      year: firstSnapshot.year,
      month: firstSnapshot.month,
      monthName: firstSnapshot.monthName,
      totalEmployees: payrollSnapshots.length,
      totalBaseSalary,
      totalDepartmentIncentives,
      totalServiceIncentives,
      totalAttendanceAdjustments,
      totalGrossSalary,
      averageGrossSalary: totalGrossSalary / payrollSnapshots.length,
      processingDate: firstSnapshot.createdAt,
      generatedAt: firstSnapshot.createdAt,
      departmentBreakdown,
      hasAnyErrors: false, // Could be enhanced with validation logic
      missingEmployees: 0, // Would need employee count to calculate
      processedEmployees: payrollSnapshots.length,
    };
  }

  // Validate payroll snapshots
  validatePayrollSnapshots(payrollSnapshots: PayrollSnapshot[]): PayrollValidationResult[] {
    return payrollSnapshots.map(snapshot => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation rules
      if (snapshot.baseSalary <= 0) {
        errors.push('Base salary must be greater than zero');
      }

      if (snapshot.grossSalary <= 0) {
        errors.push('Gross salary must be greater than zero');
      }

      // Check if calculation is correct
      const expectedGross = snapshot.baseSalary + 
        snapshot.departmentIncentiveAmount + 
        snapshot.serviceYearsIncentiveAmount + 
        snapshot.attendanceAdjustmentAmount;

      if (Math.abs(snapshot.grossSalary - expectedGross) > 1) {
        errors.push('Gross salary calculation appears incorrect');
      }

      // Warnings for unusual values
      if (snapshot.attendanceAdjustmentAmount < 0) {
        warnings.push('Employee has salary deduction due to absences');
      }

      if (snapshot.absenceDays && snapshot.absenceDays > 10) {
        warnings.push('Employee has high absence days');
      }

      if (snapshot.grossSalary > snapshot.baseSalary * 2) {
        warnings.push('Gross salary is significantly higher than base salary');
      }

      return {
        employeeId: snapshot.employeeId,
        employeeName: snapshot.employeeName,
        isValid: errors.length === 0,
        errors,
        warnings,
        calculationBreakdown: {
          baseSalary: snapshot.baseSalary,
          departmentIncentive: snapshot.departmentIncentiveAmount,
          serviceIncentive: snapshot.serviceYearsIncentiveAmount,
          attendanceAdjustment: snapshot.attendanceAdjustmentAmount,
          grossSalary: snapshot.grossSalary,
        },
      };
    });
  }

  // Compare payroll with previous month
  async compareWithPreviousMonth(currentSnapshots: PayrollSnapshot[], year: number, month: number): Promise<PayrollComparison[]> {
    try {
      // Get previous month's snapshots
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      
      const previousSnapshots = await this.getPayrollSnapshots(prevYear, prevMonth);
      const previousMap = new Map(previousSnapshots.map(s => [s.employeeId, s]));

      return currentSnapshots.map(current => {
        const previous = previousMap.get(current.employeeId);
        const changes: PayrollComparison['changes'] = [];

        if (previous) {
          // Check for changes
          if (Math.abs(current.baseSalary - previous.baseSalary) > 0.01) {
            const changePercentage = ((current.baseSalary - previous.baseSalary) / previous.baseSalary) * 100;
            changes.push({
              field: 'Base Salary',
              oldValue: previous.baseSalary,
              newValue: current.baseSalary,
              changePercentage,
            });
          }

          if (Math.abs(current.grossSalary - previous.grossSalary) > 0.01) {
            const changePercentage = ((current.grossSalary - previous.grossSalary) / previous.grossSalary) * 100;
            changes.push({
              field: 'Gross Salary',
              oldValue: previous.grossSalary,
              newValue: current.grossSalary,
              changePercentage,
            });
          }

          if (current.absenceDays !== previous.absenceDays) {
            changes.push({
              field: 'Absence Days',
              oldValue: previous.absenceDays || 0,
              newValue: current.absenceDays || 0,
            });
          }
        }

        return {
          employeeId: current.employeeId,
          employeeName: current.employeeName,
          current,
          previous,
          hasChanges: changes.length > 0 || !previous,
          changes,
        };
      });
    } catch (error) {
      console.warn('Failed to compare with previous month:', error);
      // Return current snapshots without comparison
      return currentSnapshots.map(current => ({
        employeeId: current.employeeId,
        employeeName: current.employeeName,
        current,
        previous: undefined,
        hasChanges: false,
        changes: [],
      }));
    }
  }

  // Get payroll status (simulated - would need backend support)
  getPayrollStatus(year: number, month: number): PayrollStatus {
    // This is a simulation - in real implementation, this would come from backend
    return 'calculated'; // Default to calculated status
  }

  // Create payroll batch for tracking (simulated)
  createPayrollBatch(payrollSnapshots: PayrollSnapshot[], createdBy: string): PayrollBatch {
    if (payrollSnapshots.length === 0) {
      throw new Error('Cannot create batch with no payroll snapshots');
    }

    const firstSnapshot = payrollSnapshots[0];
    const totalGrossSalary = payrollSnapshots.reduce((sum, s) => sum + s.grossSalary, 0);

    return {
      id: `batch_${firstSnapshot.year}_${firstSnapshot.month}_${Date.now()}`,
      year: firstSnapshot.year,
      month: firstSnapshot.month,
      monthName: firstSnapshot.monthName,
      status: 'calculated',
      totalEmployees: payrollSnapshots.length,
      processedEmployees: payrollSnapshots.length,
      totalGrossSalary,
      createdBy,
      createdAt: new Date().toISOString(),
      actions: [],
    };
  }

  // Simulate approval process (would need backend endpoints)
  async approvePayroll(batch: PayrollBatch, reviewRequest: PayrollReviewRequest): Promise<PayrollBatch> {
    // This would be an API call in real implementation
    const updatedBatch: PayrollBatch = {
      ...batch,
      status: reviewRequest.action === 'approve' ? 'approved' : reviewRequest.action === 'reject' ? 'rejected' : 'under_review',
      reviewedBy: 'Current User', // Would come from auth context
      reviewedAt: new Date().toISOString(),
      comments: reviewRequest.comment,
    };

    if (reviewRequest.action === 'approve') {
      updatedBatch.approvedBy = 'Current User';
      updatedBatch.approvedAt = new Date().toISOString();
    }

    // Add review action
    const reviewAction: PayrollReviewAction = {
      id: `action_${Date.now()}`,
      action: reviewRequest.action === 'request_changes' ? 'request_change' : reviewRequest.action,
      comment: reviewRequest.comment || '',
      reviewedBy: 'Current User',
      reviewedAt: new Date().toISOString(),
      resolved: reviewRequest.action !== 'request_changes',
    };

    updatedBatch.actions.push(reviewAction);

    return updatedBatch;
  }

  // Get change summary for display
  getChangeSummary(comparisons: PayrollComparison[]): {
    totalChanges: number;
    salaryIncreases: number;
    salaryDecreases: number;
    newEmployees: number;
    averageChange: number;
  } {
    let totalChanges = 0;
    let salaryIncreases = 0;
    let salaryDecreases = 0;
    let newEmployees = 0;
    let totalChangeAmount = 0;

    comparisons.forEach(comparison => {
      if (!comparison.previous) {
        newEmployees++;
        return;
      }

      if (comparison.hasChanges) {
        totalChanges++;
        const grossChange = comparison.current.grossSalary - comparison.previous.grossSalary;
        totalChangeAmount += Math.abs(grossChange);
        
        if (grossChange > 0) {
          salaryIncreases++;
        } else if (grossChange < 0) {
          salaryDecreases++;
        }
      }
    });

    return {
      totalChanges,
      salaryIncreases,
      salaryDecreases,
      newEmployees,
      averageChange: totalChanges > 0 ? totalChangeAmount / totalChanges : 0,
    };
  }
}

// Helper function to map API response to frontend type
function mapPayrollSnapshotFromApi(apiSnapshot: PayrollSnapshotApiResponse): PayrollSnapshot {
  return {
    id: apiSnapshot.id,
    employeeId: apiSnapshot.employeeId,
    employeeName: apiSnapshot.employeeName,
    employeeNumber: apiSnapshot.employeeNumber,
    departmentName: apiSnapshot.departmentName,
    jobGradeName: apiSnapshot.jobGradeName,
    year: apiSnapshot.year,
    month: apiSnapshot.month,
    monthName: new Date(apiSnapshot.year, apiSnapshot.month - 1, 1).toLocaleDateString('default', { month: 'long' }),
    baseSalary: apiSnapshot.baseSalary,
    departmentIncentiveAmount: apiSnapshot.departmentIncentiveAmount,
    serviceYearsIncentiveAmount: apiSnapshot.serviceYearsIncentiveAmount,
    attendanceAdjustmentAmount: apiSnapshot.attendanceAdjustmentAmount,
    grossSalary: apiSnapshot.grossSalary,
    departmentIncentivePercentage: apiSnapshot.departmentIncentivePercentage,
    serviceYearsIncentivePercentage: apiSnapshot.serviceYearsIncentivePercentage,
    attendanceAdjustmentPercentage: apiSnapshot.attendanceAdjustmentPercentage,
    absenceDays: apiSnapshot.absenceDays,
    yearsOfService: apiSnapshot.yearsOfService,
    createdAt: apiSnapshot.createdAt,
    updatedAt: apiSnapshot.updatedAt,
  };
}

export const payrollService = new PayrollService(); 