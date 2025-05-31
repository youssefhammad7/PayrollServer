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
  EventBusy,
  CalendarMonth,
  Person,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';
import { absenceRecordService } from '../services/api/absenceRecordService';
import { employeeService } from '../services/api/employeeService';
import type { AbsenceRecord } from '../types/absenceRecord';
import type { Employee } from '../types/employee';
import { useAuth } from '../contexts/AuthContext';

export const AbsenceRecordList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; record: AbsenceRecord | null }>({
    open: false,
    record: null,
  });

  // Fetch absence records for selected year/month
  const {
    data: absenceRecords = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['absenceRecords', selectedYear, selectedMonth],
    queryFn: () => absenceRecordService.getAbsenceRecords(selectedYear, selectedMonth),
  });

  // Fetch employees for filter dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees({ page: 1, pageSize: 1000 }),
    select: (data) => data.items,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => absenceRecordService.deleteAbsenceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRecords'] });
      setDeleteDialog({ open: false, record: null });
    },
  });

  // Filter absence records based on search and filters
  const filteredRecords = absenceRecords.filter((record) => {
    const matchesSearch = searchTerm === '' || 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = selectedEmployee === '' || record.employeeId === selectedEmployee;

    return matchesSearch && matchesEmployee;
  });

  // Calculate summary statistics
  const summary = absenceRecordService.calculateSummary(filteredRecords);

  const handleEdit = (record: AbsenceRecord) => {
    navigate(`/absence-records/${record.id}/edit`);
  };

  const handleView = (record: AbsenceRecord) => {
    navigate(`/absence-records/${record.id}`);
  };

  const handleDelete = (record: AbsenceRecord) => {
    setDeleteDialog({ open: true, record });
  };

  const confirmDelete = () => {
    if (deleteDialog.record) {
      deleteMutation.mutate(deleteDialog.record.id);
    }
  };

  // Define grid columns
  const columns: GridColDef<AbsenceRecord>[] = [
    {
      field: 'employeeName',
      headerName: 'Employee Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'monthName',
      headerName: 'Month',
      width: 120,
      sortable: true,
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 100,
      sortable: true,
    },
    {
      field: 'absenceDays',
      headerName: 'Absence Days',
      width: 130,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={<EventBusy />}
          label={params.value}
          size="small"
          color={params.value > 5 ? 'error' : params.value > 2 ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'adjustmentPercentage',
      headerName: 'Adjustment',
      width: 120,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const percentage = params.value;
        if (percentage === undefined || percentage === null) {
          return <Chip label="N/A" size="small" color="default" />;
        }
        
        const color = absenceRecordService.getAdjustmentColor(percentage);
        const icon = percentage > 0 ? <TrendingUp /> : percentage < 0 ? <TrendingDown /> : undefined;
        
        return (
          <Chip
            icon={icon}
            label={absenceRecordService.formatPercentage(percentage)}
            size="small"
            color={color}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      valueFormatter: (value: string) => absenceRecordService.formatDate(value),
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
          Error loading absence records: {error instanceof Error ? error.message : 'Unknown error'}
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
            Absence Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee absence records for {absenceRecordService.formatMonthYear(selectedYear, selectedMonth)}
          </Typography>
        </Box>
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/absence-records/create')}
          >
            Add Absence Record
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarMonth sx={{ mr: 1 }} />
          Period & Filters
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              label="Year"
            >
              {absenceRecordService.getYearOptions().map((year) => (
                <MenuItem key={year.value} value={year.value}>
                  {year.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              label="Month"
            >
              {absenceRecordService.getMonthOptions().map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            variant="outlined"
            placeholder="Search by employee name..."
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
                  {employee.firstName} {employee.lastName}
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
            <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{summary.employeesWithAbsences}</Typography>
            <Typography variant="body2" color="text.secondary">
              Employees with Absences
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <EventBusy color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{summary.totalAbsenceDays}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Absence Days
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{summary.averageAbsenceDays.toFixed(1)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Average per Employee
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{summary.highestAbsenceDays}</Typography>
            <Typography variant="body2" color="text.secondary">
              Highest Absence Days
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
              sortModel: [{ field: 'absenceDays', sort: 'desc' }],
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
            Are you sure you want to delete the absence record for{' '}
            <strong>{deleteDialog.record?.employeeName}</strong> in{' '}
            <strong>{deleteDialog.record?.monthName} {deleteDialog.record?.year}</strong>?
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