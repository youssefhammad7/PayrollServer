import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Button,
  TextField,
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
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { departmentService } from '../services/api/departmentService';
import type { Department } from '../types/department';
import { useAuth } from '../contexts/AuthContext';

export const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    department: Department | null;
  }>({ open: false, department: null });

  // Fetch departments data
  const {
    data: departments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteDialog({ open: false, department: null });
    },
  });

  // Filter departments based on search term
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define grid columns
  const columns: GridColDef<Department>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Department Name',
      width: 200,
      sortable: true,
    },
    {
      field: 'employeeCount',
      headerName: 'Employees',
      width: 120,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'incentivePercentage',
      headerName: 'Incentive %',
      width: 130,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const percentage = params.value;
        if (percentage == null) {
          return <Chip label="Not Set" size="small" color="default" />;
        }
        return (
          <Chip
            label={`${percentage.toFixed(1)}%`}
            size="small"
            color={percentage > 0 ? 'success' : 'default'}
          />
        );
      },
    },
    {
      field: 'incentiveSetDate',
      headerName: 'Incentive Set Date',
      width: 160,
      sortable: true,
      valueFormatter: (params: any) => {
        const date = params.value;
        if (!date) return 'Never';
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return 'Invalid date';
        }
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      valueFormatter: (params: any) => {
        try {
          return new Date(params.value).toLocaleDateString();
        } catch {
          return 'Invalid date';
        }
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      getActions: (params: GridRowParams<Department>) => {
        const row = params.row;
        if (!row) return [];
        
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<Visibility />}
            label="View"
            onClick={() => navigate(`/departments/${row.id}`)}
          />,
        ];

        // Edit and delete permissions
        if (isAdmin() || isHRClerk()) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<Edit />}
              label="Edit"
              onClick={() => navigate(`/departments/${row.id}/edit`)}
            />
          );
        }

        // Only admin can delete departments
        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<Delete />}
              label="Delete"
              onClick={() => setDeleteDialog({ open: true, department: row })}
            />
          );
        }

        // Admin-only incentive management
        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              key="incentive"
              icon={<TrendingUp />}
              label="Set Incentive"
              onClick={() => navigate(`/departments/${row.id}/incentive`)}
            />
          );
        }

        // Incentive history for Admin and HR Clerk
        if (isAdmin() || isHRClerk()) {
          actions.push(
            <GridActionsCellItem
              key="history"
              icon={<History />}
              label="Incentive History"
              onClick={() => navigate(`/departments/${row.id}/history`)}
            />
          );
        }

        return actions;
      },
    },
  ];

  const handleSearch = () => {
    // Search is handled in real-time through filteredDepartments
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.department) {
      deleteMutation.mutate(deleteDialog.department.id.toString());
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading departments: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Department Management
        </Typography>
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/departments/create')}
          >
            Add Department
          </Button>
        )}
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            label="Search Departments"
            placeholder="Search by department name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredDepartments}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
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
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, department: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete department{' '}
            <strong>{deleteDialog.department?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Make sure the department has no employees assigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, department: null })}>
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