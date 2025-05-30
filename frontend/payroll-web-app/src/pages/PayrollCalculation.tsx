import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Calculate,
  PlayArrow,
  Check,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Groups,
  Assignment,
  Event,
} from '@mui/icons-material';
import { payrollService } from '../services/api/payrollService';
import type { PayrollSnapshot, PayrollSummary } from '../types/payroll';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  'Select Payroll Period',
  'Preview Calculations',
  'Review Summary',
  'Generate Payroll',
];

export const PayrollCalculation: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [previewData, setPreviewData] = useState<PayrollSnapshot[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [hasExistingPayroll, setHasExistingPayroll] = useState(false);
  
  // Check if payroll already exists for selected period
  const {
    data: existingPayroll,
    refetch: checkExistingPayroll,
  } = useQuery({
    queryKey: ['payrollExists', selectedYear, selectedMonth],
    queryFn: () => payrollService.hasPayrollForPeriod(selectedYear, selectedMonth),
    enabled: false,
  });

  // Preview calculation mutation
  const previewMutation = useMutation({
    mutationFn: () => payrollService.calculateGrossPayForAll(selectedYear, selectedMonth),
    onSuccess: (data) => {
      setPreviewData(data);
      const calculatedSummary = payrollService.calculatePayrollSummary(data);
      setSummary(calculatedSummary);
      setActiveStep(1);
    },
  });

  // Generate payroll mutation
  const generateMutation = useMutation({
    mutationFn: () => payrollService.generateMonthlyPayrollSnapshots(selectedYear, selectedMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollSnapshots'] });
      setGenerateDialog(false);
      setActiveStep(3);
    },
  });

  // Get available years (current year and previous years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  // Get available months
  const getAvailableMonths = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleDateString('default', { month: 'long' }),
    }));
  };

  // Check for existing payroll when period changes
  useEffect(() => {
    checkExistingPayroll().then((result) => {
      setHasExistingPayroll(result.data || false);
    });
  }, [selectedYear, selectedMonth, checkExistingPayroll]);

  const handleNext = () => {
    if (activeStep === 0) {
      previewMutation.mutate();
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      setGenerateDialog(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setPreviewData([]);
    setSummary(null);
    setHasExistingPayroll(false);
  };

  const handleGeneratePayroll = () => {
    generateMutation.mutate();
  };

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Only administrators can access payroll calculation.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payroll Calculation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Calculate and generate monthly payroll for all employees
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Period */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Select Payroll Period</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Choose the year and month for payroll calculation
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Year"
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {getAvailableYears().map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {getAvailableMonths().map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {hasExistingPayroll && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Warning:</strong> Payroll records already exist for{' '}
                      {payrollService.getMonthName(selectedMonth)} {selectedYear}.
                      Generating new payroll will overwrite existing records.
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={previewMutation.isPending}
                  startIcon={previewMutation.isPending ? <CircularProgress size={20} /> : <Calculate />}
                >
                  {previewMutation.isPending ? 'Calculating...' : 'Calculate Preview'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Preview Calculations */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Preview Calculations</Typography>
            </StepLabel>
            <StepContent>
              {previewData.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Review calculated payroll before final generation
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Preview shows calculated gross pay for {previewData.length} employees for{' '}
                      <strong>{payrollService.getMonthName(selectedMonth)} {selectedYear}</strong>.
                      No data has been saved yet.
                    </Typography>
                  </Alert>

                  {/* Preview Summary Cards */}
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                      gap: 2, 
                      mb: 3 
                    }}
                  >
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Groups color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h5" component="div">
                          {previewData.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Employees
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <AccountBalance color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h5" component="div">
                          {summary && payrollService.formatCurrency(summary.totalGrossSalary)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Gross Pay
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h5" component="div" color="success.main">
                          {summary && payrollService.formatCurrency(
                            summary.totalDepartmentIncentives + summary.totalServiceIncentives
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Incentives
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingDown color={summary?.totalAttendanceAdjustments! < 0 ? 'error' : 'success'} sx={{ fontSize: 40, mb: 1 }} />
                        <Typography 
                          variant="h5" 
                          component="div" 
                          color={summary?.totalAttendanceAdjustments! < 0 ? 'error.main' : 'success.main'}
                        >
                          {summary && payrollService.formatCurrency(summary.totalAttendanceAdjustments)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Attendance Adj.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Sample Employee Records */}
                  <Typography variant="h6" gutterBottom>
                    Sample Employee Records (First 5)
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
                          <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Base Salary</th>
                          <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Incentives</th>
                          <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Attendance</th>
                          <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Gross Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((employee) => (
                          <tr key={employee.employeeId}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {employee.employeeName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.employeeNumber}
                                </Typography>
                              </Box>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              <Typography variant="body2">{employee.departmentName}</Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                              <Typography variant="body2">
                                {payrollService.formatCurrency(employee.baseSalary)}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                              <Typography variant="body2" color="success.main">
                                {payrollService.formatCurrency(
                                  employee.departmentIncentiveAmount + employee.serviceYearsIncentiveAmount
                                )}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                              <Typography 
                                variant="body2" 
                                color={employee.attendanceAdjustmentAmount < 0 ? 'error.main' : 'success.main'}
                              >
                                {payrollService.formatCurrency(employee.attendanceAdjustmentAmount)}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {payrollService.formatCurrency(employee.grossSalary)}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                  
                  {previewData.length > 5 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      ... and {previewData.length - 5} more employees
                    </Typography>
                  )}
                </Box>
              )}
              
              <Box sx={{ mb: 1, mt: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={previewData.length === 0}
                >
                  Continue to Review
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Review Summary */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Review Summary</Typography>
            </StepLabel>
            <StepContent>
              {summary && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Final review before generating payroll records
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> Once generated, payroll records will be permanently saved 
                      and can be viewed in reports. This action cannot be undone.
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Payroll Summary for {summary.monthName} {summary.year}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Total Employees</Typography>
                          <Typography variant="h6">{summary.totalEmployees}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Total Base Salary</Typography>
                          <Typography variant="h6">{payrollService.formatCurrency(summary.totalBaseSalary)}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Department Incentives</Typography>
                          <Typography variant="h6" color="success.main">
                            {payrollService.formatCurrency(summary.totalDepartmentIncentives)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Service Year Incentives</Typography>
                          <Typography variant="h6" color="success.main">
                            {payrollService.formatCurrency(summary.totalServiceIncentives)}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Attendance Adjustments</Typography>
                          <Typography 
                            variant="h6" 
                            color={summary.totalAttendanceAdjustments < 0 ? 'error.main' : 'success.main'}
                          >
                            {payrollService.formatCurrency(summary.totalAttendanceAdjustments)}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Total Gross Salary</Typography>
                          <Typography variant="h5" color="primary.main" fontWeight="bold">
                            {payrollService.formatCurrency(summary.totalGrossSalary)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
              
              <Box sx={{ mb: 1 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  startIcon={<PlayArrow />}
                >
                  Generate Payroll
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Complete */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Payroll Generated</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Success!</strong> Payroll has been successfully generated for{' '}
                    {payrollService.getMonthName(selectedMonth)} {selectedYear}.
                  </Typography>
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/payroll/review?year=${selectedYear}&month=${selectedMonth}`)}
                    startIcon={<Assignment />}
                  >
                    View Payroll Records
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<Event />}
                  >
                    Calculate Another Period
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      {/* Generate Confirmation Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)}>
        <DialogTitle>Confirm Payroll Generation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to generate payroll for <strong>{payrollService.getMonthName(selectedMonth)} {selectedYear}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will create permanent payroll records for {previewData.length} employees 
            with a total gross pay of <strong>{summary && payrollService.formatCurrency(summary.totalGrossSalary)}</strong>.
          </Typography>
          {hasExistingPayroll && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                This will overwrite existing payroll records for this period.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGeneratePayroll}
            color="primary"
            variant="contained"
            disabled={generateMutation.isPending}
            startIcon={generateMutation.isPending ? <CircularProgress size={20} /> : <Check />}
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Payroll'}
          </Button>
        </DialogActions>
      </Dialog>

      {generateMutation.isPending && (
        <Dialog open={true}>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Generating Payroll Records...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process payroll for all employees.
              This may take a few moments.
            </Typography>
            <LinearProgress sx={{ mt: 3, width: '100%' }} />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}; 