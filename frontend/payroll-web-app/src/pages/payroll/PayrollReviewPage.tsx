import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Calculate,
  Assignment,
  CheckCircle,
  Send,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

import PayrollReviewList from '../../components/payroll/PayrollReviewList';
import { payrollService } from '../../services/api/payrollService';

const PayrollReviewPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeStep, setActiveStep] = useState(0);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check if payroll exists for the selected period
  const {
    data: existingPayroll = [],
    isLoading: checkingPayroll,
    refetch: refetchPayroll,
  } = useQuery({
    queryKey: ['payroll-snapshots', selectedYear, selectedMonth],
    queryFn: () => payrollService.getPayrollSnapshots(selectedYear, selectedMonth),
  });

  // Generate payroll mutation
  const generatePayrollMutation = useMutation({
    mutationFn: () => payrollService.generateMonthlyPayrollSnapshots(selectedYear, selectedMonth),
    onSuccess: () => {
      enqueueSnackbar(
        `Payroll generated successfully for ${getMonthName(selectedMonth)} ${selectedYear}`,
        { variant: 'success' }
      );
      setGenerateDialogOpen(false);
      setActiveStep(1); // Move to review step
      refetchPayroll();
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.message || 'Failed to generate payroll',
        { variant: 'error' }
      );
    },
  });

  // Get month name
  const getMonthName = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleDateString('default', { month: 'long' });
  };

  // Get available years (current year and previous 2 years)
  const getAvailableYears = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  };

  // Get available months
  const getAvailableMonths = (): { value: number; label: string }[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1),
    }));
  };

  // Handle period change
  const handlePeriodChange = () => {
    if (existingPayroll.length > 0) {
      setActiveStep(1); // Move to review if payroll exists
    } else {
      setActiveStep(0); // Stay on generation step
    }
  };

  // React to period changes
  React.useEffect(() => {
    handlePeriodChange();
  }, [selectedYear, selectedMonth, existingPayroll.length]);

  // Steps for the payroll workflow
  const steps = [
    {
      label: 'Generate Payroll',
      description: 'Calculate and generate payroll snapshots for all employees',
      icon: <Calculate />,
    },
    {
      label: 'Review & Validate',
      description: 'Review calculations, validate data, and check for errors',
      icon: <Assignment />,
    },
    {
      label: 'Approve Payroll',
      description: 'Final approval and confirmation of payroll',
      icon: <CheckCircle />,
    },
  ];

  const handleEmployeeClick = (employeeId: number) => {
    // Navigate to employee payroll detail
    navigate(`/employees/${employeeId}/payroll/${selectedYear}/${selectedMonth}`);
  };

  const hasPayrollData = existingPayroll.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Payroll Review & Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate, review, and approve monthly payroll for all employees
        </Typography>
      </Box>

      {/* Period Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Payroll Period
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as number)}
                  label="Year"
                >
                  {getAvailableYears().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value as number)}
                  label="Month"
                >
                  {getAvailableMonths().map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={hasPayrollData ? 'Payroll Generated' : 'No Payroll'}
                color={hasPayrollData ? 'success' : 'default'}
                icon={hasPayrollData ? <CheckCircle /> : undefined}
              />
              {checkingPayroll && <CircularProgress size={20} />}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Workflow Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payroll Workflow
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  optional={
                    index === 2 ? (
                      <Typography variant="caption">Final step</Typography>
                    ) : null
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 2 }}>{step.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    {index === 0 && (
                      <Box>
                        {hasPayrollData ? (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <AlertTitle>Payroll Already Generated</AlertTitle>
                            Payroll for {getMonthName(selectedMonth)} {selectedYear} has already been generated.
                            You can regenerate it or proceed to review.
                          </Alert>
                        ) : (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <AlertTitle>Generate Payroll Required</AlertTitle>
                            No payroll data found for {getMonthName(selectedMonth)} {selectedYear}.
                            Please generate payroll to continue.
                          </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => setGenerateDialogOpen(true)}
                            startIcon={<PlayArrow />}
                            disabled={generatePayrollMutation.isPending}
                          >
                            {hasPayrollData ? 'Regenerate Payroll' : 'Generate Payroll'}
                          </Button>
                          {hasPayrollData && (
                            <Button
                              variant="outlined"
                              onClick={() => setActiveStep(1)}
                              startIcon={<Assignment />}
                            >
                              Proceed to Review
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )}
                    {index === 1 && hasPayrollData && (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <AlertTitle>Ready for Review</AlertTitle>
                          Payroll has been generated. Please review the calculations below.
                        </Alert>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveStep(2)}
                          startIcon={<Send />}
                        >
                          Proceed to Approval
                        </Button>
                      </Box>
                    )}
                    {index === 2 && hasPayrollData && (
                      <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <AlertTitle>Final Approval</AlertTitle>
                          Review all details and approve the payroll to finalize.
                        </Alert>
                      </Box>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Payroll Review Section */}
      {hasPayrollData && activeStep >= 1 && (
        <PayrollReviewList
          year={selectedYear}
          month={selectedMonth}
          onEmployeeClick={handleEmployeeClick}
        />
      )}

      {/* Generate Payroll Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {hasPayrollData ? 'Regenerate' : 'Generate'} Payroll
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              {hasPayrollData ? 'Regenerating' : 'Generating'} payroll for:
            </Typography>
            <Typography variant="h6" color="primary">
              {getMonthName(selectedMonth)} {selectedYear}
            </Typography>
          </Box>

          {hasPayrollData && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Warning</AlertTitle>
              This will replace existing payroll data for this period.
              Any previous approvals will be reset.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            This process will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2">
              Calculate gross pay for all active employees
            </Typography>
            <Typography component="li" variant="body2">
              Apply department and service year incentives
            </Typography>
            <Typography component="li" variant="body2">
              Calculate attendance adjustments based on absences
            </Typography>
            <Typography component="li" variant="body2">
              Create payroll snapshots for review
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => generatePayrollMutation.mutate()}
            variant="contained"
            disabled={generatePayrollMutation.isPending}
            color={hasPayrollData ? 'warning' : 'primary'}
          >
            {generatePayrollMutation.isPending 
              ? 'Generating...' 
              : hasPayrollData 
                ? 'Regenerate' 
                : 'Generate'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PayrollReviewPage; 