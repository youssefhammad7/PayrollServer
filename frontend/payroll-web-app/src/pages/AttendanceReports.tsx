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
  Grid,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  AccessTime,
  FileDownload,
  PictureAsPdf,
  TableChart,
  TrendingDown,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { reportService } from '../services/api/reportService';
import { departmentService } from '../services/api/departmentService';
import type { AttendanceReportItem } from '../types/reports';
import { ReportType } from '../types/reports';
import { useAuth } from '../contexts/AuthContext';

export const AttendanceReports: React.FC = () => {
  const { isAdmin, isHRClerk } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Check authorization
  if (!isAdmin() && !isHRClerk()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view attendance reports. This feature is available to Admin and HR Clerk users only.
        </Alert>
      </Box>
    );
  }

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });

  // Fetch attendance report data
  const {
    data: attendanceData = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendanceReport', selectedYear, selectedMonth, selectedDepartment],
    queryFn: () =>
      reportService.getAttendanceReport(
        selectedYear,
        selectedMonth,
        selectedDepartment || undefined
      ),
  });

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!attendanceData.length) {
      return {
        totalEmployees: 0,
        totalAbsenceDays: 0,
        avgAbsenceDays: 0,
        employeesWithAdjustments: 0,
        totalPositiveAdjustments: 0,
        totalNegativeAdjustments: 0,
      };
    }

    const totalEmployees = attendanceData.length;
    const totalAbsenceDays = attendanceData.reduce((sum, item) => sum + item.absenceDays, 0);
    const avgAbsenceDays = totalAbsenceDays / totalEmployees;
    const employeesWithAdjustments = attendanceData.filter(item => item.adjustmentAmount !== 0).length;
    const totalPositiveAdjustments = attendanceData
      .filter(item => item.adjustmentAmount > 0)
      .reduce((sum, item) => sum + item.adjustmentAmount, 0);
    const totalNegativeAdjustments = attendanceData
      .filter(item => item.adjustmentAmount < 0)
      .reduce((sum, item) => Math.abs(item.adjustmentAmount), 0);

    return {
      totalEmployees,
      totalAbsenceDays,
      avgAbsenceDays,
      employeesWithAdjustments,
      totalPositiveAdjustments,
      totalNegativeAdjustments,
    };
  };

  const summaryStats = getSummaryStats();

  // Handle export functions
  const handleExportCsv = async () => {
    try {
      enqueueSnackbar('Preparing CSV export...', { variant: 'info' });
      const blob = await reportService.exportToCsv(ReportType.ATTENDANCE, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.ATTENDANCE, 'csv', {
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
      const blob = await reportService.exportToPdf(ReportType.ATTENDANCE, {
        year: selectedYear,
        month: selectedMonth,
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.ATTENDANCE, 'pdf', {
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
  const columns: GridColDef<AttendanceReportItem>[] = [
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
      field: 'absenceDays',
      headerName: 'Absence Days',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 0 ? 'success' : params.value > 5 ? 'error' : 'warning'}
        />
      ),
    },
    {
      field: 'adjustmentPercentage',
      headerName: 'Adjustment %',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const value = params.value;
        if (value == null) return '-';
        return (
          <Chip
            label={`${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
            size="small"
            color={value > 0 ? 'success' : value < 0 ? 'error' : 'default'}
          />
        );
      },
    },
    {
      field: 'adjustmentAmount',
      headerName: 'Adjustment Amount',
      width: 150,
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
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 130,
      valueFormatter: (params: any) => {
        if (!params || !params.value) return 'Never';
        return new Date(params.value).toLocaleDateString();
      },
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
          Error loading attendance report: {(error as Error).message}
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
            Attendance Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track employee attendance, absence days, and salary adjustments for{' '}
            {reportService.getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportCsv}
            disabled={isLoading || attendanceData.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            disabled={isLoading || attendanceData.length === 0}
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
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
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
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {summaryStats.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {summaryStats.totalAbsenceDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Absence Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {reportService.formatCurrency(summaryStats.totalPositiveAdjustments)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bonuses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {reportService.formatCurrency(summaryStats.totalNegativeAdjustments)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Deductions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={attendanceData}
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
      </Paper>

      {attendanceData.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No attendance data found for {reportService.getMonthName(selectedMonth)} {selectedYear}.
          {selectedDepartment && ' Try selecting a different department or'}
          {' '}Try selecting a different time period.
        </Alert>
      )}
    </Box>
  );
}; 