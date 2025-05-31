import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  AccountBalance,
  PictureAsPdf,
  TableChart,
  ExpandMore,
  Business,
  TrendingUp,
  People,
  MonetizationOn,
} from '@mui/icons-material';
import { reportService } from '../services/api/reportService';
import { departmentService } from '../services/api/departmentService';
import type { SalaryReportItem, SalaryReportSummary, DepartmentSalarySummary } from '../types/reports';
import { ReportType } from '../types/reports';
import { useAuth } from '../contexts/AuthContext';

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
      id={`salary-tabpanel-${index}`}
      aria-labelledby={`salary-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SalaryReports: React.FC = () => {
  const { isAdmin, isHRClerk } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Check authorization
  if (!isAdmin() && !isHRClerk()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view salary reports. This feature is available to Admin and HR Clerk users only.
        </Alert>
      </Box>
    );
  }

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });

  // Fetch salary report data
  const {
    data: salaryReportData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['salaryReport', selectedYear, selectedMonth, selectedDepartment],
    queryFn: () =>
      reportService.getSalaryReport(
        selectedYear,
        selectedMonth,
        selectedDepartment || undefined
      ),
  });

  const employees = salaryReportData?.employees || [];
  const summary = salaryReportData?.summary;

  // Handle export functions
  const handleExportCsv = async () => {
    try {
      enqueueSnackbar('Preparing CSV export...', { variant: 'info' });
      const blob = await reportService.exportToCsv(ReportType.SALARY, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.SALARY, 'csv', {
        year: selectedYear,
        month: selectedMonth,
      });
      reportService.downloadFile(blob, filename);
      enqueueSnackbar('CSV export completed successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      enqueueSnackbar('Failed to export CSV. Please try again.', { variant: 'error' });
    }
  };

  const handleExportPdf = async () => {
    try {
      enqueueSnackbar('Generating PDF report...', { variant: 'info' });
      const blob = await reportService.exportToPdf(ReportType.SALARY, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.SALARY, 'pdf', {
        year: selectedYear,
        month: selectedMonth,
      });
      reportService.downloadFile(blob, filename);
      enqueueSnackbar('PDF export completed successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      enqueueSnackbar('Failed to generate PDF report. Please try again.', { variant: 'error' });
    }
  };

  // Define grid columns
  const columns: GridColDef<SalaryReportItem>[] = [
    {
      field: 'employeeNumber',
      headerName: 'Employee #',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'employeeName',
      headerName: 'Employee Name',
      width: 200,
      flex: 1,
    },
    {
      field: 'departmentName',
      headerName: 'Department',
      width: 150,
    },
    {
      field: 'jobGradeName',
      headerName: 'Job Grade',
      width: 120,
    },
    {
      field: 'baseSalary',
      headerName: 'Base Salary',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {reportService.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'grossSalary',
      headerName: 'Gross Salary',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          {reportService.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'hasPayrollRecord',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Processed' : 'Estimated'}
          size="small"
          color={params.value ? 'success' : 'warning'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
  ];

  // Generate year options (current year and previous 2 years)
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() - i);

  // Month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' }),
  }));

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading salary report: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Salary Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive salary analysis and payroll summaries for{' '}
            {reportService.getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportCsv}
            disabled={isLoading || employees.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            disabled={isLoading || employees.length === 0}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthOptions.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value as number | '')}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Summary Statistics */}
      {summary && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {summary.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {reportService.formatCurrency(summary.totalBaseSalary)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Base Salary
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {reportService.formatCurrency(summary.totalIncentives)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Incentives
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {reportService.formatCurrency(summary.totalGrossSalary)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Gross Salary
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Employee Details" />
          <Tab label="Department Summary" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Employee Data Grid */}
          <Box sx={{ height: 600 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={employees}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
                getRowId={(row) => row.employeeId}
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              />
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Department Summary */}
          {summary && summary.departmentSummaries && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Department-wise Salary Breakdown
              </Typography>
              {Object.entries(summary.departmentSummaries).map(([deptName, deptSummary]) => (
                <Accordion key={deptName} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Business color="primary" />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {deptSummary.departmentName}
                      </Typography>
                      <Chip
                        label={`${deptSummary.employeeCount} employees`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="h6" color="primary.main">
                        {reportService.formatCurrency(deptSummary.totalGrossSalary)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Per Employee</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Base Salary</TableCell>
                            <TableCell align="right">
                              {reportService.formatCurrency(deptSummary.totalBaseSalary)}
                            </TableCell>
                            <TableCell align="right">
                              {reportService.formatCurrency(deptSummary.totalBaseSalary / deptSummary.employeeCount)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Incentives</TableCell>
                            <TableCell align="right">
                              <Typography color="success.main" fontWeight="medium">
                                {reportService.formatCurrency(deptSummary.totalIncentives)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography color="success.main" fontWeight="medium">
                                {reportService.formatCurrency(deptSummary.totalIncentives / deptSummary.employeeCount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography fontWeight="bold">Gross Salary</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary.main">
                                {reportService.formatCurrency(deptSummary.totalGrossSalary)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary.main">
                                {reportService.formatCurrency(deptSummary.totalGrossSalary / deptSummary.employeeCount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </TabPanel>
      </Paper>

      {employees.length === 0 && !isLoading && (
        <Alert severity="info">
          No salary data found for {reportService.getMonthName(selectedMonth)} {selectedYear}.
          {selectedDepartment && ' Try selecting a different department or'}
          {' '}Try selecting a different time period or ensure payroll has been processed for this month.
        </Alert>
      )}
    </Box>
  );
}; 