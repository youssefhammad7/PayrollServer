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
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  People,
  AttachMoney,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { jobGradeService } from '../services/api/jobGradeService';
import type { JobGrade } from '../types/jobGrade';
import { useAuth } from '../contexts/AuthContext';

export const JobGradeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch job grade data
  const {
    data: jobGrade,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobGrade', id],
    queryFn: () => jobGradeService.getJobGrade(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => jobGradeService.deleteJobGrade(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobGrades'] });
      navigate('/job-grades');
    },
  });

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialog(false);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading job grade: {(error as Error).message}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/job-grades')}
          sx={{ mt: 2 }}
        >
          Back to Job Grades
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

  if (!jobGrade) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Job grade not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/job-grades')}
          sx={{ mt: 2 }}
        >
          Back to Job Grades
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
          onClick={() => navigate('/job-grades')}
          sx={{ textDecoration: 'none' }}
        >
          Job Grades
        </Link>
        <Typography color="text.primary">{jobGrade.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {jobGrade.name}
          </Typography>
          <Chip
            icon={<People />}
            label={`${jobGrade.employeeCount} employees`}
            color={jobGrade.employeeCount > 0 ? 'primary' : 'default'}
            sx={{ mr: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/job-grades')}
          >
            Back to List
          </Button>
          {isAdmin() && (
            <>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/job-grades/${jobGrade.id}/edit`)}
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
        {/* Basic Information and Salary Range Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Basic Information */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} />
                Job Grade Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {jobGrade.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {jobGrade.description}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Salary Range */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} />
                Salary Range
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Minimum Salary
                </Typography>
                <Typography variant="h6" color="primary">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(jobGrade.minSalary)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Maximum Salary
                </Typography>
                <Typography variant="h6" color="primary">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(jobGrade.maxSalary)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Salary Range
                </Typography>
                <Typography variant="body1">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(jobGrade.maxSalary - jobGrade.minSalary)}
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
                Job Grade ID
              </Typography>
              <Typography variant="body1">{jobGrade.id}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Employee Count
              </Typography>
              <Typography variant="body1">{jobGrade.employeeCount}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(jobGrade.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {jobGrade.updatedAt 
                  ? new Date(jobGrade.updatedAt).toLocaleDateString()
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
            Are you sure you want to delete job grade <strong>{jobGrade.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. Make sure no employees are assigned to this job grade.
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