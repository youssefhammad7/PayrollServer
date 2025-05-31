import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  BarChart,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  TrendingDown,
  Business,
  Schedule,
  WorkOutline,
  MonetizationOn,
} from '@mui/icons-material';
import { reportService } from '../services/api/reportService';
import { departmentService } from '../services/api/departmentService';
import type { IncentiveReportItem } from '../types/reports';
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
      id={`incentives-tabpanel-${index}`}
      aria-labelledby={`incentives-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const IncentivesReports: React.FC = () => {
  const { isAdmin, isHRClerk } = useAuth();
  
  // Check authorization
  if (!isAdmin() && !isHRClerk()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view incentives reports. This feature is available to Admin and HR Clerk users only.
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

  // Fetch incentives report data
  const {
    data: incentivesData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['incentivesReport', selectedYear, selectedMonth, selectedDepartment],
    queryFn: () =>
      reportService.getIncentivesReport(
        selectedYear,
        selectedMonth,
        selectedDepartment || undefined
      ),
  });

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!incentivesData.length) {
      return {
        totalEmployees: 0,
        totalDepartmentIncentives: 0,
        totalServiceIncentives: 0,
        totalPositiveAdjustments: 0,
        totalNegativeAdjustments: 0,
        totalIncentives: 0,
        totalDeductions: 0,
        avgIncentivePerEmployee: 0,
      };
    }

    const totalEmployees = incentivesData.length;
    const totalDepartmentIncentives = incentivesData.reduce((sum, item) => sum + item.departmentIncentiveAmount, 0);
    const totalServiceIncentives = incentivesData.reduce((sum, item) => sum + item.serviceYearsIncentiveAmount, 0);
    const totalPositiveAdjustments = incentivesData.reduce((sum, item) => sum + (item.attendanceAdjustmentAmount > 0 ? item.attendanceAdjustmentAmount : 0), 0);
    const totalNegativeAdjustments = incentivesData.reduce((sum, item) => sum + (item.attendanceAdjustmentAmount < 0 ? Math.abs(item.attendanceAdjustmentAmount) : 0), 0);
    const totalIncentives = incentivesData.reduce((sum, item) => sum + item.totalIncentives, 0);
    const totalDeductions = incentivesData.reduce((sum, item) => sum + item.totalDeductions, 0);
    const avgIncentivePerEmployee = totalIncentives / totalEmployees;

    return {
      totalEmployees,
      totalDepartmentIncentives,
      totalServiceIncentives,
      totalPositiveAdjustments,
      totalNegativeAdjustments,
      totalIncentives,
      totalDeductions,
      avgIncentivePerEmployee,
    };
  };

  const summaryStats = getSummaryStats();

  // Get department breakdown
  const getDepartmentBreakdown = () => {
    const deptMap = new Map<string, {
      departmentName: string;
      employeeCount: number;
      totalDepartmentIncentives: number;
      totalServiceIncentives: number;
      totalAdjustments: number;
      totalIncentives: number;
    }>();

    incentivesData.forEach(item => {
      const deptName = item.departmentName;
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          departmentName: deptName,
          employeeCount: 0,
          totalDepartmentIncentives: 0,
          totalServiceIncentives: 0,
          totalAdjustments: 0,
          totalIncentives: 0,
        });
      }

      const dept = deptMap.get(deptName)!;
      dept.employeeCount++;
      dept.totalDepartmentIncentives += item.departmentIncentiveAmount;
      dept.totalServiceIncentives += item.serviceYearsIncentiveAmount;
      dept.totalAdjustments += item.attendanceAdjustmentAmount;
      dept.totalIncentives += item.totalIncentives;
    });

    return Array.from(deptMap.values()).sort((a, b) => b.totalIncentives - a.totalIncentives);
  };

  const departmentBreakdown = getDepartmentBreakdown();

  // Handle export functions
  const handleExportCsv = async () => {
    try {
      const blob = await reportService.exportToCsv(ReportType.INCENTIVES, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.INCENTIVES, 'csv', {
        year: selectedYear,
        month: selectedMonth,
      });
      reportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await reportService.exportToPdf(ReportType.INCENTIVES, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.INCENTIVES, 'pdf', {
        year: selectedYear,
        month: selectedMonth,
      });
      reportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Define grid columns
  const columns: GridColDef<IncentiveReportItem>[] = [
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
      width: 180,
      flex: 1,
    },
    {
      field: 'departmentName',
      headerName: 'Department',
      width: 130,
    },
    {
      field: 'baseSalary',
      headerName: 'Base Salary',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {reportService.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'departmentIncentiveAmount',
      headerName: 'Dept. Incentive',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          {reportService.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'serviceYearsIncentiveAmount',
      headerName: 'Service Incentive',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" color="info.main" fontWeight="medium">
          {reportService.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'attendanceAdjustmentAmount',
      headerName: 'Attendance Adj.',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.value > 0 && <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />}
          {params.value < 0 && <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />}
          <Typography
            variant="body2"
            color={params.value > 0 ? 'success.main' : params.value < 0 ? 'error.main' : 'text.primary'}
            fontWeight="medium"
          >
            {reportService.formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'totalIncentives',
      headerName: 'Total Incentives',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          {reportService.formatCurrency(params.value)}
        </Typography>
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
          Error loading incentives report: {(error as Error).message}
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
            Incentives Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed breakdown of all incentives and deductions for{' '}
            {reportService.getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportCsv}
            disabled={isLoading || incentivesData.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            disabled={isLoading || incentivesData.length === 0}
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
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Business color="success" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" color="success.main">
              {reportService.formatCurrency(summaryStats.totalDepartmentIncentives)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Department Incentives
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <WorkOutline color="info" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" color="info.main">
              {reportService.formatCurrency(summaryStats.totalServiceIncentives)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Service Year Incentives
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp color="success" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" color="success.main">
              {reportService.formatCurrency(summaryStats.totalIncentives)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Incentives
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingDown color="error" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" color="error.main">
              {reportService.formatCurrency(summaryStats.totalDeductions)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Deductions
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Employee Details" />
          <Tab label="Department Breakdown" />
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
                rows={incentivesData}
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
          {/* Department Breakdown */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Department-wise Incentive Analysis
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Employees</TableCell>
                    <TableCell align="right">Dept. Incentives</TableCell>
                    <TableCell align="right">Service Incentives</TableCell>
                    <TableCell align="right">Attendance Adj.</TableCell>
                    <TableCell align="right">Total Incentives</TableCell>
                    <TableCell align="right">Avg Per Employee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentBreakdown.map((dept) => (
                    <TableRow key={dept.departmentName}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business color="primary" sx={{ fontSize: 20 }} />
                          <Typography fontWeight="medium">
                            {dept.departmentName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={dept.employeeCount} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight="medium">
                          {reportService.formatCurrency(dept.totalDepartmentIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="info.main" fontWeight="medium">
                          {reportService.formatCurrency(dept.totalServiceIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={dept.totalAdjustments >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {reportService.formatCurrency(dept.totalAdjustments)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {reportService.formatCurrency(dept.totalIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {reportService.formatCurrency(dept.totalIncentives / dept.employeeCount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departmentBreakdown.length > 1 && (
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>
                        <Typography fontWeight="bold">Total</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={summaryStats.totalEmployees} 
                          size="small" 
                          color="primary" 
                          variant="filled" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight="bold">
                          {reportService.formatCurrency(summaryStats.totalDepartmentIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="info.main" fontWeight="bold">
                          {reportService.formatCurrency(summaryStats.totalServiceIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={(summaryStats.totalPositiveAdjustments - summaryStats.totalNegativeAdjustments) >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {reportService.formatCurrency(summaryStats.totalPositiveAdjustments - summaryStats.totalNegativeAdjustments)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {reportService.formatCurrency(summaryStats.totalIncentives)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {reportService.formatCurrency(summaryStats.avgIncentivePerEmployee)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>

      {incentivesData.length === 0 && !isLoading && (
        <Alert severity="info">
          No incentive data found for {reportService.getMonthName(selectedMonth)} {selectedYear}.
          {selectedDepartment && ' Try selecting a different department or'}
          {' '}Try selecting a different time period or ensure payroll has been processed for this month.
        </Alert>
      )}
    </Box>
  );
}; 