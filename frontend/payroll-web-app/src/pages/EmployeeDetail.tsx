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
  Restore,
  ArrowBack,
  Person,
  Work,
  Email,
  Phone,
  Home,
  CalendarToday,
} from '@mui/icons-material';
import { employeeService } from '../services/api/employeeService';
import type { Employee } from '../types/employee';
import { useAuth } from '../contexts/AuthContext';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  // Fetch employee data
  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => employeeService.deleteEmployee(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: () => employeeService.restoreEmployee(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialog(false);
  };

  const handleRestore = () => {
    restoreMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error ? `Error loading employee: ${(error as Error).message}` : 'Employee not found'}
        </Alert>
      </Box>
    );
  }

  const canEdit = (isAdmin() || isHRClerk()) && employee.employmentStatus === 'Active';
  const canDelete = (isAdmin() || isHRClerk()) && employee.employmentStatus === 'Active';
  const canRestore = (isAdmin() || isHRClerk()) && employee.employmentStatus !== 'Active' && employee.employmentStatus !== null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/employees')}
          sx={{ textDecoration: 'none' }}
        >
          Employees
        </Link>
        <Typography color="text.primary">
          {employee.firstName} {employee.lastName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {employee.firstName} {employee.lastName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {employee.employeeNumber || `ID: ${employee.id}`}
            </Typography>
            <Chip
              label={employee.employmentStatus || 'Unknown'}
              color={employee.employmentStatus === 'Active' ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employees')}
          >
            Back to List
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
            >
              Edit
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
          {canRestore && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Restore />}
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Employee Information Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Personal Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Personal Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  First Name
                </Typography>
                <Typography variant="body1">{employee.firstName}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Name
                </Typography>
                <Typography variant="body1">{employee.lastName}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Date of Birth
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              {employee.phoneNumber && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone Number
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1">{employee.phoneNumber}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            {employee.address && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Home sx={{ mr: 1, fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                  <Typography variant="body1">{employee.address}</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Contact Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Email Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body1">{employee.email}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Work sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Employment Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Department
                </Typography>
                <Typography variant="body1">
                  {employee.departmentName || 'Not assigned'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Job Grade
                </Typography>
                <Typography variant="body1">
                  {employee.jobGradeName || 'Not assigned'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Hire Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {employee.hiringDate && employee.hiringDate !== '0001-01-01T00:00:00' 
                      ? new Date(employee.hiringDate).toLocaleDateString() 
                      : 'Not set'}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={employee.employmentStatus || 'Unknown'}
                  color={employee.employmentStatus === 'Active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
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
                  {new Date(employee.createdAt).toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : 'Never updated'}
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
            Are you sure you want to delete employee{' '}
            <strong>{employee.fullName}</strong>?
            This action can be undone by restoring the employee.
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