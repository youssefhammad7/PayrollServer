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
} from '@mui/icons-material';
import { jobGradeService } from '../services/api/jobGradeService';
import type { JobGrade } from '../types/jobGrade';
import { useAuth } from '../contexts/AuthContext';

export const JobGradeList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jobGrade: JobGrade | null }>({
    open: false,
    jobGrade: null,
  });

  // Fetch job grades
  const {
    data: jobGrades = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobGrades'],
    queryFn: () => jobGradeService.getJobGrades(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobGradeService.deleteJobGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobGrades'] });
      setDeleteDialog({ open: false, jobGrade: null });
    },
  });

  // Filter job grades based on search term
  const filteredJobGrades = jobGrades.filter((jobGrade) =>
    jobGrade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobGrade.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete action
  const handleDelete = (jobGrade: JobGrade) => {
    setDeleteDialog({ open: true, jobGrade });
  };

  const confirmDelete = () => {
    if (deleteDialog.jobGrade) {
      deleteMutation.mutate(deleteDialog.jobGrade.id.toString());
    }
  };

  // Define grid columns
  const columns: GridColDef<JobGrade>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Job Grade Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 300,
      sortable: true,
    },
    {
      field: 'minSalary',
      headerName: 'Min Salary',
      width: 130,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      field: 'maxSalary',
      headerName: 'Max Salary',
      width: 130,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      field: 'employeeCount',
      headerName: 'Employees',
      width: 120,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value > 0 ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 140,
      sortable: true,
      valueFormatter: (value: string) => {
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return 'Invalid date';
        }
      },
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
            onClick={() => navigate(`/job-grades/${params.row.id}`)}
          />,
        ];

        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              onClick={() => navigate(`/job-grades/${params.row.id}/edit`)}
            />,
            <GridActionsCellItem
              icon={<Delete />}
              label="Delete"
              onClick={() => handleDelete(params.row)}
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
          Error loading job grades: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Job Grades
        </Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/job-grades/create')}
          >
            Add New Job Grade
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search job grades by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredJobGrades}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'name', sort: 'asc' }],
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, jobGrade: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete job grade{' '}
            <strong>{deleteDialog.jobGrade?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Make sure no employees are assigned to this job grade.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, jobGrade: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
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