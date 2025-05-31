import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
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
  Timeline,
  Percent,
  CalendarToday,
  Description,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { serviceBracketService } from '../services/api/serviceBracketService';
import type { ServiceBracket } from '../types/serviceBracket';
import { useAuth } from '../contexts/AuthContext';

export const ServiceBracketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch service bracket data
  const {
    data: serviceBracket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['serviceBracket', id],
    queryFn: () => serviceBracketService.getServiceBracket(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => serviceBracketService.deleteServiceBracket(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceBrackets'] });
      navigate('/service-brackets');
    },
  });

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialog(false);
  };

  // Format year range display
  const formatYearRange = (minYears: number, maxYears?: number) => {
    if (maxYears === null || maxYears === undefined) {
      return `${minYears}+ years`;
    }
    return `${minYears}-${maxYears} years`;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading service bracket: {(error as Error).message}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/service-brackets')}
          sx={{ mt: 2 }}
        >
          Back to Service Brackets
        </Button>
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

  if (!serviceBracket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Service bracket not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/service-brackets')}
          sx={{ mt: 2 }}
        >
          Back to Service Brackets
        </Button>
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
          onClick={() => navigate('/service-brackets')}
          sx={{ textDecoration: 'none' }}
        >
          Service Brackets
        </Link>
        <Typography color="text.primary">{serviceBracket.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {serviceBracket.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<Timeline />}
              label={formatYearRange(serviceBracket.minYearsOfService, serviceBracket.maxYearsOfService)}
              color="info"
              variant="outlined"
            />
            <Chip
              icon={serviceBracket.isActive ? <CheckCircle /> : <Cancel />}
              label={serviceBracket.isActive ? 'Active' : 'Inactive'}
              color={serviceBracket.isActive ? 'success' : 'default'}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/service-brackets')}
          >
            Back to List
          </Button>
          {isAdmin() && (
            <>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/service-brackets/${serviceBracket.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Service Bracket Information and Incentive Details Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Basic Information */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} />
                Service Bracket Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceBracket.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Years of Service Range
                </Typography>
                <Chip
                  icon={<Timeline />}
                  label={formatYearRange(serviceBracket.minYearsOfService, serviceBracket.maxYearsOfService)}
                  color="info"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {serviceBracket.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={serviceBracket.isActive ? <CheckCircle /> : <Cancel />}
                  label={serviceBracket.isActive ? 'Active' : 'Inactive'}
                  color={serviceBracket.isActive ? 'success' : 'default'}
                />
              </Box>
            </Paper>
          </Box>

          {/* Incentive Details */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Percent sx={{ mr: 1 }} />
                Incentive Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Incentive Percentage
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {serviceBracket.incentivePercentage.toFixed(2)}%
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Year Range Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Minimum Years:</strong> {serviceBracket.minYearsOfService}
                </Typography>
                {serviceBracket.maxYearsOfService && (
                  <Typography variant="body2">
                    <strong>Maximum Years:</strong> {serviceBracket.maxYearsOfService}
                  </Typography>
                )}
                {!serviceBracket.maxYearsOfService && (
                  <Typography variant="body2" color="text.secondary">
                    No upper limit (open-ended)
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Calculation Example
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For a $50,000 base salary:
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'medium' }}>
                  +${((50000 * serviceBracket.incentivePercentage) / 100).toFixed(0)} incentive
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* System Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ mr: 1 }} />
            System Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
            gap: 3 
          }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Service Bracket ID
              </Typography>
              <Typography variant="body1">{serviceBracket.id}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Typography variant="body1">
                {serviceBracket.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(serviceBracket.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {serviceBracket.updatedAt 
                  ? new Date(serviceBracket.updatedAt).toLocaleDateString()
                  : 'Never'
                }
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete service bracket <strong>{serviceBracket.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This may affect payroll calculations for employees 
            with {formatYearRange(serviceBracket.minYearsOfService, serviceBracket.maxYearsOfService)} of service.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
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