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
  FormControlLabel,
  Switch,
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
  RemoveCircle,
  Event,
} from '@mui/icons-material';
import { absenceThresholdService } from '../services/api/absenceThresholdService';
import type { AbsenceThreshold } from '../types/absenceThreshold';
import { useAuth } from '../contexts/AuthContext';

export const AbsenceThresholdList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; absenceThreshold: AbsenceThreshold | null }>({
    open: false,
    absenceThreshold: null,
  });

  // Fetch absence thresholds
  const {
    data: absenceThresholds = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['absenceThresholds', showActiveOnly],
    queryFn: () => absenceThresholdService.getAbsenceThresholds(showActiveOnly),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => absenceThresholdService.deleteAbsenceThreshold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceThresholds'] });
      setDeleteDialog({ open: false, absenceThreshold: null });
    },
  });

  // Filter absence thresholds based on search term
  const filteredAbsenceThresholds = absenceThresholds.filter((threshold) =>
    threshold.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threshold.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete action
  const handleDelete = (absenceThreshold: AbsenceThreshold) => {
    setDeleteDialog({ open: true, absenceThreshold });
  };

  const confirmDelete = () => {
    if (deleteDialog.absenceThreshold) {
      deleteMutation.mutate(deleteDialog.absenceThreshold.id.toString());
    }
  };

  // Format day range display
  const formatDayRange = (minDays: number, maxDays?: number) => {
    if (maxDays === null || maxDays === undefined) {
      return `${minDays}+ days`;
    }
    return `${minDays}-${maxDays} days`;
  };

  // Format adjustment percentage with proper sign
  const formatAdjustmentPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Define grid columns
  const columns: GridColDef<AbsenceThreshold>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Threshold Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'dayRange',
      headerName: 'Absence Days',
      width: 150,
      sortable: false,
      valueGetter: (value, row) => formatDayRange(row.minAbsenceDays, row.maxAbsenceDays),
      renderCell: (params) => (
        <Chip
          icon={<Event />}
          label={params.value}
          color="warning"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'adjustmentPercentage',
      headerName: 'Adjustment',
      width: 120,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => formatAdjustmentPercentage(value),
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color={params.value >= 0 ? 'success.main' : 'error.main'}
          fontWeight="medium"
        >
          {formatAdjustmentPercentage(params.value)}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 300,
      sortable: true,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
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
            onClick={() => navigate(`/absence-thresholds/${params.row.id}`)}
          />,
        ];

        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              onClick={() => navigate(`/absence-thresholds/${params.row.id}/edit`)}
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
          Error loading absence thresholds: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Absence Thresholds
        </Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/absence-thresholds/create')}
          >
            Add New Absence Threshold
          </Button>
        )}
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Absence thresholds</strong> define salary adjustments based on employee absence days. 
          Positive percentages are bonuses for low absence, negative percentages are deductions for high absence.
        </Typography>
      </Alert>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          variant="outlined"
          placeholder="Search absence thresholds by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              color="primary"
            />
          }
          label="Active Only"
        />
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredAbsenceThresholds}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'minAbsenceDays', sort: 'asc' }],
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, absenceThreshold: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete absence threshold{' '}
            <strong>{deleteDialog.absenceThreshold?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This may affect payroll calculations for employees 
            with {deleteDialog.absenceThreshold && formatDayRange(
              deleteDialog.absenceThreshold.minAbsenceDays, 
              deleteDialog.absenceThreshold.maxAbsenceDays
            )} of absence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, absenceThreshold: null })}>
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