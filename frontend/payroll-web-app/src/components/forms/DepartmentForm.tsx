import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { departmentService } from '../../services/api/departmentService';
import type { Department, CreateDepartmentRequest } from '../../types/department';

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100, 'Department name must be less than 100 characters'),
  incentivePercentage: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, {
    message: 'Incentive percentage must be between 0 and 100'
  }),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  mode: 'create' | 'edit';
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ mode }) => {
  const { id: departmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      incentivePercentage: '',
    },
  });

  // Fetch department data for editing
  const {
    data: department,
    isLoading: departmentLoading,
    error: departmentError,
  } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => departmentService.getDepartment(departmentId!),
    enabled: mode === 'edit' && !!departmentId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentService.createDepartment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      navigate(`/departments/${data.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => 
      departmentService.updateDepartment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', departmentId] });
      navigate(`/departments/${data.id}`);
    },
  });

  // Populate form with department data when editing
  useEffect(() => {
    if (mode === 'edit' && department) {
      const formData: DepartmentFormData = {
        name: department.name,
        incentivePercentage: department.incentivePercentage?.toString() || '',
      };
      reset(formData);
    }
  }, [department, mode, reset]);

  const onSubmit = (data: DepartmentFormData) => {
    if (mode === 'create') {
      const requestData: CreateDepartmentRequest = {
        name: data.name,
        incentivePercentage: data.incentivePercentage && data.incentivePercentage !== '' 
          ? parseFloat(data.incentivePercentage) 
          : undefined,
      };
      createMutation.mutate(requestData);
    } else {
      // For edit mode, only update the name (incentive is updated separately)
      const requestData = {
        name: data.name,
      };
      updateMutation.mutate({ id: departmentId!, data: requestData });
    }
  };

  const mutation = mode === 'create' ? createMutation : updateMutation;
  const isLoading = departmentLoading;

  if (mode === 'edit' && departmentError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading department: {(departmentError as Error).message}
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
        {mode === 'edit' && department && (
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
          {mode === 'create' ? 'Add Department' : 'Edit Department'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {mode === 'create' ? 'Add New Department' : 'Edit Department'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/departments')}
        >
          Back to List
        </Button>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        {mutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(mutation.error as Error).message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Department Information */}
            <Typography variant="h6" gutterBottom>
              Department Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                {...control.register('name')}
                label="Department Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="e.g., Information Technology, Human Resources"
              />

              {/* Incentive Percentage - Only for create mode */}
              {mode === 'create' && (
                <TextField
                  {...control.register('incentivePercentage')}
                  label="Incentive Percentage"
                  fullWidth
                  type="number"
                  error={!!errors.incentivePercentage}
                  helperText={errors.incentivePercentage?.message || 'Optional - can be set later'}
                  placeholder="0.0"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.1,
                  }}
                />
              )}
            </Box>

            {/* Info for edit mode */}
            {mode === 'edit' && (
              <Alert severity="info">
                To update the incentive percentage, use the "Set Incentive" action from the department list or detail page.
                This ensures proper history tracking.
              </Alert>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/departments')}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={mutation.isPending ? <CircularProgress size={20} /> : <Save />}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Department' : 'Update Department'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 