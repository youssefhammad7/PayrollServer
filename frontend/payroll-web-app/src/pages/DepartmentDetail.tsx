import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Business,
  TrendingUp,
  People,
  CalendarToday,
  History,
} from '@mui/icons-material';
import { departmentService } from '../services/api/departmentService';
import type { Department } from '../types/department';
import { useAuth } from '../contexts/AuthContext';

export const DepartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  // Fetch department data
  const {
    data: department,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartment(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => departmentService.deleteDepartment(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      navigate('/departments');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error ? `Error loading department: ${(error as Error).message}` : 'Department not found'}
        </Alert>
      </Box>
    );
  }

  const canEdit = isAdmin() || isHRClerk();
  const canDelete = isAdmin();
  const canManageIncentive = isAdmin();

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
        <Typography color="text.primary">
          {department.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {department.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Department ID: {department.id}
            </Typography>
            <Chip
              label={`${department.employeeCount} Employees`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/departments')}
          >
            Back to List
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/departments/${department.id}/edit`)}
            >
              Edit
            </Button>
          )}
          {canManageIncentive && (
            <Button
              variant="contained"
              color="success"
              startIcon={<TrendingUp />}
              onClick={() => navigate(`/departments/${department.id}/incentive`)}
            >
              Set Incentive
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      {/* Department Information Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Business sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Department Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Department Name
                </Typography>
                <Typography variant="body1">{department.name}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Employee Count
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">{department.employeeCount} employees</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Incentive Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Incentive Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Incentive Percentage
                </Typography>
                {department.incentivePercentage != null ? (
                  <Chip
                    label={`${department.incentivePercentage.toFixed(1)}%`}
                    color={department.incentivePercentage > 0 ? 'success' : 'default'}
                    size="medium"
                  />
                ) : (
                  <Chip label="Not Set" color="default" size="medium" />
                )}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Incentive Set Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {department.incentiveSetDate 
                      ? new Date(department.incentiveSetDate).toLocaleDateString()
                      : 'Never set'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Actions for incentive management */}
            {canManageIncentive && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate(`/departments/${department.id}/incentive`)}
                >
                  Update Incentive
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => navigate(`/departments/${department.id}/history`)}
                >
                  View History
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(department.createdAt).toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {department.updatedAt 
                    ? new Date(department.updatedAt).toLocaleString() 
                    : 'Never updated'
                  }
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete department{' '}
            <strong>{department.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Make sure the department has no employees assigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
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