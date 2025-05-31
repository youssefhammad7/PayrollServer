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
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  PersonSearch,
  PictureAsPdf,
  TableChart,
  ExpandMore,
  Business,
  People,
  Email,
  Phone,
  LocationOn,
  Search,
  Badge,
  Work,
} from '@mui/icons-material';
import { reportService } from '../services/api/reportService';
import { departmentService } from '../services/api/departmentService';
import type { EmployeeDirectoryItem } from '../types/reports';
import { ReportType } from '../types/reports';
import { useAuth } from '../contexts/AuthContext';

export const EmployeeDirectory: React.FC = () => {
  const { user } = useAuth();
  
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });

  // Fetch employee directory data
  const {
    data: employeeDirectory = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employeeDirectory', selectedDepartment],
    queryFn: () =>
      reportService.getEmployeeDirectoryReport(
        selectedDepartment || undefined
      ),
  });

  // Filter employees based on search term
  const filteredEmployees = employeeDirectory.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.jobGradeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get department breakdown
  const getDepartmentBreakdown = () => {
    const deptMap = new Map<string, {
      departmentName: string;
      employees: EmployeeDirectoryItem[];
    }>();

    filteredEmployees.forEach(employee => {
      const deptName = employee.departmentName;
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          departmentName: deptName,
          employees: [],
        });
      }
      deptMap.get(deptName)!.employees.push(employee);
    });

    return Array.from(deptMap.values()).sort((a, b) => a.departmentName.localeCompare(b.departmentName));
  };

  const departmentBreakdown = getDepartmentBreakdown();

  // Handle export functions
  const handleExportCsv = async () => {
    try {
      const blob = await reportService.exportToCsv(ReportType.EMPLOYEE_DIRECTORY, {
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.EMPLOYEE_DIRECTORY, 'csv');
      reportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await reportService.exportToPdf(ReportType.EMPLOYEE_DIRECTORY, {
        departmentId: selectedDepartment || undefined,
      });
      const filename = reportService.generateFilename(ReportType.EMPLOYEE_DIRECTORY, 'pdf');
      reportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Define grid columns
  const columns: GridColDef<EmployeeDirectoryItem>[] = [
    {
      field: 'fullName',
      headerName: 'Employee',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.row.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.employeeNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'departmentName',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'jobGradeName',
      headerName: 'Job Grade',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'hiringDate',
      headerName: 'Hiring Date',
      width: 130,
      valueFormatter: (params: any) => {
        if (!params || !params.value) return 'N/A';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'yearsOfService',
      headerName: 'Years of Service',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value || 0} years`}
          size="small"
          color={
            (params.value || 0) >= 10 ? 'success' :
            (params.value || 0) >= 5 ? 'warning' : 'default'
          }
        />
      ),
    },
  ];

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalEmployees = filteredEmployees.length;
    const totalDepartments = new Set(filteredEmployees.map(emp => emp.departmentName)).size;
    const avgYearsOfService = filteredEmployees.reduce((sum, emp) => sum + (emp.yearsOfService || 0), 0) / totalEmployees || 0;
    
    return {
      totalEmployees,
      totalDepartments,
      avgYearsOfService,
    };
  };

  const summaryStats = getSummaryStats();

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading employee directory: {(error as Error).message}
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
            Employee Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete employee contact information and organizational structure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportCsv}
            disabled={isLoading || employeeDirectory.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPdf}
            disabled={isLoading || employeeDirectory.length === 0}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search & Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search Employees"
            placeholder="Search by name, employee ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
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
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="primary.main">
              {summaryStats.totalEmployees}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Employees
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Business color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="secondary.main">
              {summaryStats.totalDepartments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Departments
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Work color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main">
              {summaryStats.avgYearsOfService.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Years of Service
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Employee Data Grid */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Employee List ({filteredEmployees.length} employees)
          </Typography>
        </Box>
        <Box sx={{ height: 600 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={filteredEmployees}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[25, 50, 100]}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Department Breakdown */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Department Breakdown
        </Typography>
        {departmentBreakdown.map((dept) => (
          <Accordion key={dept.departmentName} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Business color="primary" />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {dept.departmentName}
                </Typography>
                <Chip
                  label={`${dept.employees.length} employees`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {dept.employees.map((employee) => (
                  <Card key={employee.id} variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{employee.fullName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.jobGradeName} • {employee.employeeNumber}
                          </Typography>
                        </Box>
                        {employee.yearsOfService && (
                          <Chip
                            label={`${employee.yearsOfService} years`}
                            size="small"
                            color={
                              employee.yearsOfService >= 10 ? 'success' :
                              employee.yearsOfService >= 5 ? 'warning' : 'default'
                            }
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{employee.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{employee.phoneNumber}</Typography>
                        </Box>
                        {employee.address && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{employee.address}</Typography>
                          </Box>
                        )}
                        {employee.hiringDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              Hired: {new Date(employee.hiringDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {filteredEmployees.length === 0 && !isLoading && (
        <Alert severity="info">
          {searchTerm || selectedDepartment
            ? `No employees found matching your search criteria.`
            : 'No employees found in the directory.'
          }
        </Alert>
      )}
    </Box>
  );
}; 