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
  Event,
  Percent,
  CalendarToday,
  Description,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { absenceThresholdService } from '../services/api/absenceThresholdService';
import type { AbsenceThreshold } from '../types/absenceThreshold';
import { useAuth } from '../contexts/AuthContext';

export const AbsenceThresholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch absence threshold data
  const {
    data: absenceThreshold,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['absenceThreshold', id],
    queryFn: () => absenceThresholdService.getAbsenceThreshold(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => absenceThresholdService.deleteAbsenceThreshold(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceThresholds'] });
      navigate('/absence-thresholds');
    },
  });

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialog(false);
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading absence threshold: {(error as Error).message}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/absence-thresholds')}
          sx={{ mt: 2 }}
        >
          Back to Absence Thresholds
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

  if (!absenceThreshold) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Absence threshold not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/absence-thresholds')}
          sx={{ mt: 2 }}
        >
          Back to Absence Thresholds
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
          onClick={() => navigate('/absence-thresholds')}
          sx={{ textDecoration: 'none' }}
        >
          Absence Thresholds
        </Link>
        <Typography color="text.primary">{absenceThreshold.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {absenceThreshold.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<Event />}
              label={formatDayRange(absenceThreshold.minAbsenceDays, absenceThreshold.maxAbsenceDays)}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={absenceThreshold.adjustmentPercentage >= 0 ? <TrendingUp /> : <TrendingDown />}
              label={formatAdjustmentPercentage(absenceThreshold.adjustmentPercentage)}
              color={absenceThreshold.adjustmentPercentage >= 0 ? 'success' : 'error'}
              variant="outlined"
            />
            <Chip
              icon={absenceThreshold.isActive ? <CheckCircle /> : <Cancel />}
              label={absenceThreshold.isActive ? 'Active' : 'Inactive'}
              color={absenceThreshold.isActive ? 'success' : 'default'}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/absence-thresholds')}
          >
            Back to List
          </Button>
          {isAdmin() && (
            <>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/absence-thresholds/${absenceThreshold.id}/edit`)}
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
        {/* Absence Threshold Information and Adjustment Details Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Basic Information */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} />
                Absence Threshold Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {absenceThreshold.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Absence Days Range
                </Typography>
                <Chip
                  icon={<Event />}
                  label={formatDayRange(absenceThreshold.minAbsenceDays, absenceThreshold.maxAbsenceDays)}
                  color="warning"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {absenceThreshold.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  icon={absenceThreshold.isActive ? <CheckCircle /> : <Cancel />}
                  label={absenceThreshold.isActive ? 'Active' : 'Inactive'}
                  color={absenceThreshold.isActive ? 'success' : 'default'}
                />
              </Box>
            </Paper>
          </Box>

          {/* Adjustment Details */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Percent sx={{ mr: 1 }} />
                Salary Adjustment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Adjustment Percentage
                </Typography>
                <Typography 
                  variant="h4" 
                  color={absenceThreshold.adjustmentPercentage >= 0 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {formatAdjustmentPercentage(absenceThreshold.adjustmentPercentage)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Days Range Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Minimum Days:</strong> {absenceThreshold.minAbsenceDays}
                </Typography>
                {absenceThreshold.maxAbsenceDays && (
                  <Typography variant="body2">
                    <strong>Maximum Days:</strong> {absenceThreshold.maxAbsenceDays}
                  </Typography>
                )}
                {!absenceThreshold.maxAbsenceDays && (
                  <Typography variant="body2" color="text.secondary">
                    No upper limit (open-ended)
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Adjustment Type
                </Typography>
                <Chip
                  icon={absenceThreshold.adjustmentPercentage >= 0 ? <TrendingUp /> : <TrendingDown />}
                  label={absenceThreshold.adjustmentPercentage >= 0 ? 'Bonus' : 'Deduction'}
                  color={absenceThreshold.adjustmentPercentage >= 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Calculation Example
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For a $50,000 base salary:
                </Typography>
                <Typography 
                  variant="body1" 
                  color={absenceThreshold.adjustmentPercentage >= 0 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 'medium' }}
                >
                  {absenceThreshold.adjustmentPercentage >= 0 ? '+' : ''}${((50000 * absenceThreshold.adjustmentPercentage) / 100).toFixed(0)} adjustment
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
                Threshold ID
              </Typography>
              <Typography variant="body1">{absenceThreshold.id}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Typography variant="body1">
                {absenceThreshold.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(absenceThreshold.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {absenceThreshold.updatedAt 
                  ? new Date(absenceThreshold.updatedAt).toLocaleDateString()
                  : 'Never'
                }
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Additional Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            How This Threshold Works
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" paragraph>
            This absence threshold applies to employees who have{' '}
            <strong>{formatDayRange(absenceThreshold.minAbsenceDays, absenceThreshold.maxAbsenceDays)}</strong>{' '}
            of absence in a given month.
          </Typography>
          
          <Typography variant="body1" paragraph>
            {absenceThreshold.adjustmentPercentage >= 0 ? (
              <>
                Employees within this range will receive a <strong>bonus</strong> of{' '}
                <strong>{formatAdjustmentPercentage(absenceThreshold.adjustmentPercentage)}</strong>{' '}
                of their base salary for good attendance.
              </>
            ) : (
              <>
                Employees within this range will have a <strong>deduction</strong> of{' '}
                <strong>{Math.abs(absenceThreshold.adjustmentPercentage).toFixed(2)}%</strong>{' '}
                from their base salary due to excessive absence.
              </>
            )}
          </Typography>
          
          <Alert 
            severity={absenceThreshold.adjustmentPercentage >= 0 ? 'success' : 'warning'} 
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              This threshold is currently <strong>{absenceThreshold.isActive ? 'active' : 'inactive'}</strong>{' '}
              and {absenceThreshold.isActive ? 'will be' : 'will not be'} applied in payroll calculations.
            </Typography>
          </Alert>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete absence threshold <strong>{absenceThreshold.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This may affect payroll calculations for employees 
            with {formatDayRange(absenceThreshold.minAbsenceDays, absenceThreshold.maxAbsenceDays)} of absence.
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