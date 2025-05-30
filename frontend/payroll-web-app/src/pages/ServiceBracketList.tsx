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
  Timeline,
} from '@mui/icons-material';
import { serviceBracketService } from '../services/api/serviceBracketService';
import type { ServiceBracket } from '../types/serviceBracket';
import { useAuth } from '../contexts/AuthContext';

export const ServiceBracketList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; serviceBracket: ServiceBracket | null }>({
    open: false,
    serviceBracket: null,
  });

  // Fetch service brackets
  const {
    data: serviceBrackets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['serviceBrackets', showActiveOnly],
    queryFn: () => serviceBracketService.getServiceBrackets(showActiveOnly),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceBracketService.deleteServiceBracket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceBrackets'] });
      setDeleteDialog({ open: false, serviceBracket: null });
    },
  });

  // Filter service brackets based on search term
  const filteredServiceBrackets = serviceBrackets.filter((bracket) =>
    bracket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bracket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete action
  const handleDelete = (serviceBracket: ServiceBracket) => {
    setDeleteDialog({ open: true, serviceBracket });
  };

  const confirmDelete = () => {
    if (deleteDialog.serviceBracket) {
      deleteMutation.mutate(deleteDialog.serviceBracket.id.toString());
    }
  };

  // Format year range display
  const formatYearRange = (minYears: number, maxYears?: number) => {
    if (maxYears === null || maxYears === undefined) {
      return `${minYears}+ years`;
    }
    return `${minYears}-${maxYears} years`;
  };

  // Define grid columns
  const columns: GridColDef<ServiceBracket>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Bracket Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'yearRange',
      headerName: 'Years of Service',
      width: 150,
      sortable: false,
      valueGetter: (value, row) => formatYearRange(row.minYearsOfService, row.maxYearsOfService),
      renderCell: (params) => (
        <Chip
          icon={<Timeline />}
          label={params.value}
          color="info"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'incentivePercentage',
      headerName: 'Incentive %',
      width: 120,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => `${value.toFixed(2)}%`,
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
            onClick={() => navigate(`/service-brackets/${params.row.id}`)}
          />,
        ];

        if (isAdmin()) {
          actions.push(
            <GridActionsCellItem
              icon={<Edit />}
              label="Edit"
              onClick={() => navigate(`/service-brackets/${params.row.id}/edit`)}
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
          Error loading service brackets: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Service Brackets
        </Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/service-brackets/create')}
          >
            Add New Service Bracket
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          variant="outlined"
          placeholder="Search service brackets by name or description..."
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
          rows={filteredServiceBrackets}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'minYearsOfService', sort: 'asc' }],
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, serviceBracket: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete service bracket{' '}
            <strong>{deleteDialog.serviceBracket?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This may affect payroll calculations for employees 
            with {formatYearRange(
              deleteDialog.serviceBracket?.minYearsOfService || 0, 
              deleteDialog.serviceBracket?.maxYearsOfService
            )} of service.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, serviceBracket: null })}>
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