import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  ArrowBack,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { departmentService } from '../services/api/departmentService';
import type { Department, DepartmentIncentiveHistory as DepartmentIncentiveHistoryType } from '../types/department';

export const DepartmentIncentiveHistoryPage: React.FC = () => {
  const { id: departmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch department data
  const {
    data: department,
    isLoading: departmentLoading,
    error: departmentError,
  } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => departmentService.getDepartment(departmentId!),
    enabled: !!departmentId,
  });

  // Fetch incentive history
  const {
    data: incentiveHistory = [],
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['departmentIncentiveHistory', departmentId],
    queryFn: () => departmentService.getDepartmentIncentiveHistory(departmentId!),
    enabled: !!departmentId,
  });

  // Define grid columns
  const columns: GridColDef<DepartmentIncentiveHistoryType>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'incentivePercentage',
      headerName: 'Incentive Percentage',
      width: 180,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}%`}
          color={params.value > 0 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'effectiveDate',
      headerName: 'Effective Date',
      width: 160,
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
      field: 'createdAt',
      headerName: 'Created At',
      width: 160,
      sortable: true,
      valueFormatter: (params: any) => {
        try {
          return new Date(params.value).toLocaleString();
        } catch {
          return 'Invalid date';
        }
      },
    },
  ];

  const isLoading = departmentLoading || historyLoading;
  const error = departmentError || historyError;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading data: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/departments')}
          sx={{ textDecoration: 'none' }}
        >
          Departments
        </Link>
        {department && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/departments/${department.id}`)}
            sx={{ textDecoration: 'none' }}
          >
            {department.name}
          </Link>
        )}
        <Typography color="text.primary">
          Incentive History
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Incentive History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/departments/${department?.id}`)}
          >
            Back to Department
          </Button>
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
            onClick={() => navigate(`/departments/${department?.id}/incentive`)}
          >
            Update Incentive
          </Button>
        </Box>
      </Box>

      {/* Current Information Card */}
      {department && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <History sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Department Summary</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Department
                </Typography>
                <Typography variant="body1" fontWeight="medium">{department.name}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Incentive
                </Typography>
                {department.incentivePercentage != null ? (
                  <Chip
                    label={`${department.incentivePercentage.toFixed(1)}%`}
                    color={department.incentivePercentage > 0 ? 'success' : 'default'}
                    size="small"
                  />
                ) : (
                  <Chip label="Not Set" color="default" size="small" />
                )}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Changes
                </Typography>
                <Typography variant="body1">{incentiveHistory.length} records</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {department.incentiveSetDate 
                    ? new Date(department.incentiveSetDate).toLocaleDateString()
                    : 'Never'
                  }
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* History Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={incentiveHistory}
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

      {/* Empty State */}
      {incentiveHistory.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <History sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Incentive History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No incentive changes have been recorded for this department yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
            onClick={() => navigate(`/departments/${department?.id}/incentive`)}
          >
            Set First Incentive
          </Button>
        </Box>
      )}
    </Box>
  );
}; 