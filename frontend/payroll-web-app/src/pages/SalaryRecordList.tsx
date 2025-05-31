import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material';
import { salaryRecordService } from '../services/api/salaryRecordService';
import { employeeService } from '../services/api/employeeService';
import { departmentService } from '../services/api/departmentService';
import type { SalaryRecord } from '../types/salaryRecord';
import type { Employee } from '../types/employee';
import type { Department } from '../types/department';
import { useAuth } from '../contexts/AuthContext';

export const SalaryRecordList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; record: SalaryRecord | null }>({
    open: false,
    record: null,
  });

  // Fetch salary records
  const {
    data: salaryRecords = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['salaryRecords', selectedEmployee],
    queryFn: () => salaryRecordService.getSalaryRecords(
      selectedEmployee ? { employeeId: selectedEmployee } : undefined
    ),
  });

  // Fetch employees for filter dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees({ page: 1, pageSize: 1000 }),
    select: (data) => data.items,
  });

  // Fetch departments for filter dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => salaryRecordService.deleteSalaryRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRecords'] });
      setDeleteDialog({ open: false, record: null });
    },
  });

  // Filter salary records based on search and filters
  const filteredRecords = salaryRecords.filter((record) => {
    const matchesSearch = searchTerm === '' || 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === '' || 
      employees.find(emp => emp.id === record.employeeId)?.departmentId === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleEdit = (record: SalaryRecord) => {
    navigate(`/salary-records/${record.id}/edit`);
  };

  const handleView = (record: SalaryRecord) => {
    navigate(`/salary-records/${record.id}`);
  };

  const handleDelete = (record: SalaryRecord) => {
    setDeleteDialog({ open: true, record });
  };

  const confirmDelete = () => {
    if (deleteDialog.record) {
      deleteMutation.mutate(deleteDialog.record.id);
    }
  };

  // Calculate salary change for display
  const getSalaryChange = (record: SalaryRecord, allRecords: SalaryRecord[]) => {
    const employeeRecords = allRecords
      .filter(r => r.employeeId === record.employeeId)
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
    
    const currentIndex = employeeRecords.findIndex(r => r.id === record.id);
    if (currentIndex <= 0) return null;
    
    const previousRecord = employeeRecords[currentIndex - 1];
    return salaryRecordService.calculateSalaryChange(previousRecord.baseSalary, record.baseSalary);
  };

  // Define grid columns
  const columns: GridColDef<SalaryRecord>[] = [
    {
      field: 'employeeNumber',
      headerName: 'Employee #',
      width: 120,
      sortable: true,
    },
    {
      field: 'employeeName',
      headerName: 'Employee Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'baseSalary',
      headerName: 'Base Salary',
      width: 140,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => salaryRecordService.formatCurrency(value),
    },
    {
      field: 'salaryChange',
      headerName: 'Change',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const change = getSalaryChange(params.row, filteredRecords);
        if (!change) return <Chip label="Initial" size="small" color="default" />;
        
        const color = change.type === 'increase' ? 'success' : change.type === 'decrease' ? 'error' : 'default';
        const icon = change.type === 'increase' ? <TrendingUp /> : change.type === 'decrease' ? <TrendingDown /> : undefined;
        
        return (
          <Chip
            icon={icon}
            label={`${change.percentage >= 0 ? '+' : ''}${change.percentage.toFixed(1)}%`}
            size="small"
            color={color}
          />
        );
      },
    },
    {
      field: 'effectiveDate',
      headerName: 'Effective Date',
      width: 120,
      sortable: true,
      valueFormatter: (value: string) => salaryRecordService.formatDate(value),
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      valueFormatter: (value: string) => salaryRecordService.formatDate(value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() => handleView(params.row)}
            key="view"
          />,
        ];

        if (isAdmin() || isHRClerk()) {
          actions.push(
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              onClick={() => handleEdit(params.row)}
              key="edit"
            />
          );
        }

        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              icon={<Delete />}
              label="Delete"
              onClick={() => handleDelete(params.row)}
              key="delete"
            />
          );
        }

        return actions;
      },
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading salary records: {error instanceof Error ? error.message : 'Unknown error'}
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
            Salary Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee salary records and track salary history
          </Typography>
        </Box>
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/salary-records/create')}
          >
            Add Salary Record
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ mr: 1 }} />
          Search & Filters
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Search by employee name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value as number | '')}
              label="Employee"
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as number | '')}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Summary Cards */}
      {filteredRecords.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <AccountBalance color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              {salaryRecordService.formatCurrency(
                filteredRecords.reduce((sum, record) => sum + record.baseSalary, 0) / filteredRecords.length
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Salary
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {salaryRecordService.formatCurrency(
                Math.max(...filteredRecords.map(r => r.baseSalary))
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highest Salary
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {salaryRecordService.formatCurrency(
                Math.min(...filteredRecords.map(r => r.baseSalary))
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lowest Salary
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{filteredRecords.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Records
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRecords}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'effectiveDate', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, record: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this salary record for{' '}
            <strong>{deleteDialog.record?.employeeName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and may affect payroll calculations.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, record: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 