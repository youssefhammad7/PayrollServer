import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  Visibility,
  Assignment,
  MonetizationOn,
  Group,
  Schedule,
  Assessment,
  Download,
  Refresh,
  Send,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { payrollService } from '../../services/api/payrollService';
import type {
  PayrollSnapshot,
  PayrollReviewSummary,
  PayrollValidationResult,
  PayrollComparison,
  PayrollBatch,
  PayrollReviewRequest,
} from '../../types/payroll';

interface PayrollReviewListProps {
  year: number;
  month: number;
  onEmployeeClick?: (employeeId: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payroll-tabpanel-${index}`}
      aria-labelledby={`payroll-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PayrollReviewList: React.FC<PayrollReviewListProps> = ({
  year,
  month,
  onEmployeeClick,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch payroll snapshots
  const {
    data: payrollSnapshots = [],
    isLoading: snapshotsLoading,
    error: snapshotsError,
    refetch: refetchSnapshots,
  } = useQuery({
    queryKey: ['payroll-snapshots', year, month],
    queryFn: () => payrollService.getPayrollSnapshots(year, month),
  });

  // Calculate review summary
  const reviewSummary: PayrollReviewSummary = payrollService.calculatePayrollReviewSummary(payrollSnapshots);

  // Validate payroll
  const validationResults: PayrollValidationResult[] = payrollService.validatePayrollSnapshots(payrollSnapshots);

  // State for comparisons
  const [comparisons, setComparisons] = useState<PayrollComparison[]>([]);
  const [comparisonsLoading, setComparisonsLoading] = useState(false);

  // Load comparisons
  useEffect(() => {
    if (payrollSnapshots.length > 0) {
      setComparisonsLoading(true);
      payrollService.compareWithPreviousMonth(payrollSnapshots, year, month)
        .then(setComparisons)
        .catch(error => {
          console.error('Failed to load comparisons:', error);
          enqueueSnackbar('Failed to load payroll comparisons', { variant: 'warning' });
        })
        .finally(() => setComparisonsLoading(false));
    }
  }, [payrollSnapshots, year, month, enqueueSnackbar]);

  // Create payroll batch
  const payrollBatch: PayrollBatch | null = payrollSnapshots.length > 0 
    ? payrollService.createPayrollBatch(payrollSnapshots, 'Current User')
    : null;

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async (reviewRequest: PayrollReviewRequest) => {
      if (!payrollBatch) throw new Error('No payroll batch to approve');
      return payrollService.approvePayroll(payrollBatch, reviewRequest);
    },
    onSuccess: (updatedBatch) => {
      enqueueSnackbar(
        `Payroll ${approvalAction}d successfully for ${updatedBatch.monthName} ${updatedBatch.year}`,
        { variant: 'success' }
      );
      setApprovalDialogOpen(false);
      setApprovalComment('');
      queryClient.invalidateQueries({ queryKey: ['payroll-snapshots'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.message || 'Failed to process payroll approval',
        { variant: 'error' }
      );
    },
  });

  // Custom toolbar
  const CustomToolbar = () => (
    <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
      <Button
        startIcon={<Refresh />}
        onClick={() => refetchSnapshots()}
        size="small"
      >
        Refresh
      </Button>
    </Box>
  );

  // Handle approval
  const handleApproval = () => {
    if (!payrollBatch) return;

    const reviewRequest: PayrollReviewRequest = {
      year,
      month,
      action: approvalAction,
      comment: approvalComment,
      employeeIds: selectedRows.length > 0 ? selectedRows : undefined,
    };

    approvalMutation.mutate(reviewRequest);
  };

  // Get change summary
  const changeSummary = payrollService.getChangeSummary(comparisons);

  // Helper function to get validation status for employee
  const getValidationStatus = (employeeId: number) => {
    const validation = validationResults.find(v => v.employeeId === employeeId);
    if (!validation) return 'Unknown';
    
    if (validation.errors.length > 0) return 'Error';
    if (validation.warnings.length > 0) return 'Warning';
    return 'Valid';
  };

  // Helper function to get comparison status
  const getComparisonStatus = (employeeId: number) => {
    const comparison = comparisons.find(c => c.employeeId === employeeId);
    if (!comparison) return 'Unknown';
    
    if (!comparison.previous) return 'New';
    if (!comparison.hasChanges) return 'No Change';
    
    const grossChange = comparison.current.grossSalary - comparison.previous.grossSalary;
    return grossChange > 0 ? 'Increase' : 'Decrease';
  };

  // Helper function to calculate total incentives
  const getTotalIncentives = (row: PayrollSnapshot) => {
    return row.departmentIncentiveAmount + row.serviceYearsIncentiveAmount;
  };

  if (snapshotsLoading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading payroll data...</Typography>
      </Box>
    );
  }

  if (snapshotsError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <AlertTitle>Error Loading Payroll Data</AlertTitle>
        {snapshotsError instanceof Error ? snapshotsError.message : 'Failed to load payroll data'}
      </Alert>
    );
  }

  if (payrollSnapshots.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 3 }}>
        <AlertTitle>No Payroll Data</AlertTitle>
        No payroll data found for {format(new Date(year, month - 1), 'MMMM yyyy')}. 
        Please generate payroll first.
      </Alert>
    );
  }

  const hasErrors = validationResults.some(v => v.errors.length > 0);
  const hasWarnings = validationResults.some(v => v.warnings.length > 0);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Payroll Review - {reviewSummary.monthName} {reviewSummary.year}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review payroll calculations before approval
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {/* Handle export */}}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => setApprovalDialogOpen(true)}
                disabled={hasErrors}
                color={hasErrors ? 'error' : hasWarnings ? 'warning' : 'primary'}
              >
                {hasErrors ? 'Has Errors' : hasWarnings ? 'Review Required' : 'Approve Payroll'}
              </Button>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{reviewSummary.totalEmployees}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MonetizationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      ${reviewSummary.totalGrossSalary.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Gross Salary
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      ${reviewSummary.averageGrossSalary.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Salary
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {payrollBatch?.status || 'Draft'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Payroll Status
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Validation Status */}
          {(hasErrors || hasWarnings) && (
            <Alert 
              severity={hasErrors ? 'error' : 'warning'} 
              sx={{ mt: 3 }}
            >
              <AlertTitle>
                {hasErrors ? 'Validation Errors Found' : 'Validation Warnings'}
              </AlertTitle>
              {hasErrors && 'Payroll cannot be approved until all errors are resolved.'}
              {hasWarnings && !hasErrors && 'Please review warnings before approval.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`Payroll Overview (${payrollSnapshots.length})`}
              icon={<Assignment />} 
              iconPosition="start"
            />
            <Tab 
              label={`Validation (${validationResults.filter(v => !v.isValid || v.warnings.length > 0).length})`}
              icon={hasErrors ? <Cancel color="error" /> : hasWarnings ? <Warning color="warning" /> : <CheckCircle color="success" />}
              iconPosition="start"
            />
            <Tab 
              label={`Changes (${changeSummary.totalChanges})`}
              icon={<TrendingUp />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee #</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Base Salary</TableCell>
                  <TableCell>Incentives</TableCell>
                  <TableCell>Adjustments</TableCell>
                  <TableCell>Gross Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollSnapshots.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>
                      <Chip label={row.employeeNumber} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {row.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.departmentName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${row.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        +${getTotalIncentives(row).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={row.attendanceAdjustmentAmount >= 0 ? 'success.main' : 'error.main'}
                      >
                        {row.attendanceAdjustmentAmount >= 0 ? '+' : ''}${row.attendanceAdjustmentAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${row.grossSalary.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getValidationStatus(row.employeeId)}
                        color={
                          getValidationStatus(row.employeeId) === 'Error' ? 'error' :
                          getValidationStatus(row.employeeId) === 'Warning' ? 'warning' : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => onEmployeeClick?.(row.employeeId)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell>Gross Salary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationResults.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>
                      <Chip
                        icon={row.isValid ? <CheckCircle /> : <Cancel />}
                        label={row.isValid ? 'Valid' : 'Invalid'}
                        color={row.isValid ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {[...row.errors, ...row.warnings].length > 0 ? (
                        <Box>
                          {[...row.errors, ...row.warnings].slice(0, 2).map((issue: string, index: number) => (
                            <Typography key={index} variant="caption" display="block" color="error.main">
                              {issue}
                            </Typography>
                          ))}
                          {[...row.errors, ...row.warnings].length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{[...row.errors, ...row.warnings].length - 2} more
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="success.main">
                          No issues
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${row.calculationBreakdown.grossSalary.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {comparisonsLoading ? (
            <Box sx={{ width: '100%', p: 3 }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading comparisons...</Typography>
            </Box>
          ) : (
            <>
              {/* Change Summary */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{changeSummary.totalChanges}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Changes
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="success.main">
                        {changeSummary.salaryIncreases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Salary Increases
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="warning.main">
                        {changeSummary.salaryDecreases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Salary Decreases
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="info.main">
                        {changeSummary.newEmployees}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        New Employees
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Current Gross</TableCell>
                      <TableCell>Previous Gross</TableCell>
                      <TableCell>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparisons.map((row) => {
                      const change = row.previous ? row.current.grossSalary - row.previous.grossSalary : 0;
                      const changePercentage = row.previous ? (change / row.previous.grossSalary) * 100 : 0;
                      
                      return (
                        <TableRow key={row.employeeId}>
                          <TableCell>{row.employeeName}</TableCell>
                          <TableCell>
                            <Chip
                              label={getComparisonStatus(row.employeeId)}
                              color={
                                getComparisonStatus(row.employeeId) === 'New' ? 'info' :
                                getComparisonStatus(row.employeeId) === 'Increase' ? 'success' :
                                getComparisonStatus(row.employeeId) === 'Decrease' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              ${row.current.grossSalary.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {row.previous ? `$${row.previous.grossSalary.toLocaleString()}` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.previous ? (
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  color={change >= 0 ? 'success.main' : 'error.main'}
                                  fontWeight="medium"
                                >
                                  {change >= 0 ? '+' : ''}${change.toLocaleString()}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color={change >= 0 ? 'success.main' : 'error.main'}
                                >
                                  ({changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2">N/A</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
      </Card>

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialogOpen} 
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payroll Approval - {reviewSummary.monthName} {reviewSummary.year}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              You are about to {approvalAction} payroll for {reviewSummary.totalEmployees} employees
              with a total gross salary of ${reviewSummary.totalGrossSalary.toLocaleString()}.
            </Typography>
            {selectedRows.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                This action will only apply to the {selectedRows.length} selected employees.
              </Typography>
            )}
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={approvalAction}
              onChange={(e) => setApprovalAction(e.target.value as any)}
              label="Action"
            >
              <MenuItem value="approve">Approve Payroll</MenuItem>
              <MenuItem value="reject">Reject Payroll</MenuItem>
              <MenuItem value="request_changes">Request Changes</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="Add comments about this approval decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApproval}
            variant="contained"
            disabled={approvalMutation.isPending}
            color={approvalAction === 'approve' ? 'primary' : approvalAction === 'reject' ? 'error' : 'warning'}
          >
            {approvalMutation.isPending ? 'Processing...' : 
             approvalAction === 'approve' ? 'Approve' :
             approvalAction === 'reject' ? 'Reject' : 'Request Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollReviewList; 