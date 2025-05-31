import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRowParams,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Restore,
  Search,
  FilterList,
} from '@mui/icons-material';
import { employeeService } from '../services/api/employeeService';
import type { Employee, EmployeeQueryParams, Department, JobGrade } from '../types/employee';
import { useAuth } from '../contexts/AuthContext';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [jobGradeFilter, setJobGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });

  // Build query parameters
  const queryParams: EmployeeQueryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchTerm || undefined,
    departmentId: departmentFilter ? (isNaN(parseInt(departmentFilter, 10)) ? undefined : parseInt(departmentFilter, 10)) : undefined,
    jobGradeId: jobGradeFilter ? (isNaN(parseInt(jobGradeFilter, 10)) ? undefined : parseInt(jobGradeFilter, 10)) : undefined,
  };

  // Fetch employees data
  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['employees', queryParams],
    queryFn: () => employeeService.getEmployees(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => employeeService.getDepartments(),
  });

  // Fetch job grades for filter
  const { data: jobGrades = [] } = useQuery({
    queryKey: ['jobGrades'],
    queryFn: () => employeeService.getJobGrades(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteDialog({ open: false, employee: null });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => employeeService.restoreEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // Define grid columns
  const columns: GridColDef<Employee>[] = [
    {
      field: 'employeeNumber',
      headerName: 'Employee ID',
      width: 120,
      sortable: true,
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      sortable: true,
    },
    {
      field: 'departmentName',
      headerName: 'Department',
      width: 150,
      sortable: true,
    },
    {
      field: 'jobGradeName',
      headerName: 'Job Grade',
      width: 130,
      sortable: true,
    },
    {
      field: 'hiringDate',
      headerName: 'Hire Date',
      width: 120,
      sortable: true,
      renderCell: (params) => {
        console.log('renderCell - Hire date params:', params);
        const date = params.value;
        console.log('renderCell - date value:', date, 'type:', typeof date);
        
        // For debugging, show both raw and formatted
        if (!date) return 'Not set (no value)';
        if (date === '0001-01-01T00:00:00' || date === '0001-01-01T00:00:00.000Z') {
          return 'Not set (default)';
        }
        
        try {
          const formatted = new Date(date).toLocaleDateString();
          return `${formatted} (${date})`;
        } catch {
          return `Invalid (${date})`;
        }
      },
    },
    {
      field: 'employmentStatus',
      headerName: 'Status',
      width: 100,
      sortable: true,
      renderCell: (params) => {
        const status = params.value || 'Unknown';
        return (
          <Chip
            label={status === 'Active' ? 'Active' : status || 'Unknown'}
            color={status === 'Active' ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params: GridRowParams<Employee>) => {
        const row = params.row;
        if (!row) return [];
        
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<Visibility />}
            label="View"
            onClick={() => navigate(`/employees/${row.id}`)}
          />,
        ];

        if (isAdmin() || isHRClerk()) {
          const isActive = row.employmentStatus === 'Active';
          if (isActive) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<Edit />}
                label="Edit"
                onClick={() => navigate(`/employees/${row.id}/edit`)}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<Delete />}
                label="Delete"
                onClick={() => setDeleteDialog({ open: true, employee: row })}
              />
            );
          } else {
            actions.push(
              <GridActionsCellItem
                key="restore"
                icon={<Restore />}
                label="Restore"
                onClick={() => restoreMutation.mutate(row.id.toString())}
              />
            );
          }
        }

        return actions;
      },
    },
  ];

  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setJobGradeFilter('');
    setStatusFilter('active');
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.employee) {
      deleteMutation.mutate(deleteDialog.employee.id.toString());
    }
  };

  // Process employee data to ensure employeeNumber is always available
  const processedEmployees = React.useMemo(() => {
    if (!employeesData?.items) return [];
    
    console.log('Raw employees data:', employeesData.items);
    
    const processed = employeesData.items.map(employee => {
      const processedEmployee = {
        ...employee,
        employeeNumber: employee.employeeNumber || `EMP${employee.id.toString().padStart(4, '0')}`,
      };
      
      console.log(`Employee ${employee.firstName} ${employee.lastName}:`, {
        originalHiringDate: employee.hiringDate,
        processedHiringDate: processedEmployee.hiringDate,
        employeeNumber: processedEmployee.employeeNumber
      });
      
      return processedEmployee;
    });
    
    console.log('Processed employees:', processed);
    return processed;
  }, [employeesData?.items]);

  if (employeesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading employees: {(employeesError as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employees/create')}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="Search"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Job Grade</InputLabel>
            <Select
              value={jobGradeFilter}
              onChange={(e) => setJobGradeFilter(e.target.value)}
              label="Job Grade"
            >
              <MenuItem value="">All Grades</MenuItem>
              {jobGrades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id.toString()}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={processedEmployees}
          columns={columns}
          rowCount={employeesData?.totalCount || 0}
          loading={employeesLoading || isPlaceholderData}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employee: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete employee{' '}
            <strong>
              {deleteDialog.employee?.firstName || ''} {deleteDialog.employee?.lastName || ''}
            </strong>
            ? This action can be undone by restoring the employee.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, employee: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 