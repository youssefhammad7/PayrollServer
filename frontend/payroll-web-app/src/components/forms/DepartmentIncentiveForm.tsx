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
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Save, Cancel, ArrowBack, TrendingUp } from '@mui/icons-material';
import { departmentService } from '../../services/api/departmentService';
import type { Department, UpdateDepartmentIncentiveRequest } from '../../types/department';

// Validation schema
const incentiveSchema = z.object({
  incentivePercentage: z.string()
    .min(1, 'Incentive percentage is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: 'Incentive percentage must be between 0 and 100'
    }),
});

type IncentiveFormData = z.infer<typeof incentiveSchema>;

export const DepartmentIncentiveForm: React.FC = () => {
  const { id: departmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IncentiveFormData>({
    resolver: zodResolver(incentiveSchema),
    defaultValues: {
      incentivePercentage: '',
    },
  });

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

  // Update incentive mutation
  const updateIncentiveMutation = useMutation({
    mutationFn: (data: UpdateDepartmentIncentiveRequest) => 
      departmentService.updateDepartmentIncentive(departmentId!, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', departmentId] });
      navigate(`/departments/${data.id}`);
    },
  });

  // Populate form with current incentive percentage
  useEffect(() => {
    if (department) {
      const formData: IncentiveFormData = {
        incentivePercentage: department.incentivePercentage?.toString() || '0',
      };
      reset(formData);
    }
  }, [department, reset]);

  const onSubmit = (data: IncentiveFormData) => {
    const requestData: UpdateDepartmentIncentiveRequest = {
      incentivePercentage: parseFloat(data.incentivePercentage),
    };
    updateIncentiveMutation.mutate(requestData);
  };

  if (departmentError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading department: {(departmentError as Error).message}
        </Alert>
      </Box>
    );
  }

  if (departmentLoading) {
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
          Set Incentive
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Set Department Incentive
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/departments/${department?.id}`)}
        >
          Back to Department
        </Button>
      </Box>

      {/* Current Information Card */}
      {department && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Current Incentive Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
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
                <Typography variant="body1">
                  {department.incentivePercentage != null 
                    ? `${department.incentivePercentage.toFixed(1)}%` 
                    : 'Not set'
                  }
                </Typography>
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

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        {updateIncentiveMutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(updateIncentiveMutation.error as Error).message}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Updating the incentive percentage will create a new history record 
            and affect future payroll calculations. This change will take effect immediately.
          </Typography>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              New Incentive Percentage
            </Typography>

            <Box sx={{ maxWidth: 400 }}>
              <Controller
                name="incentivePercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Incentive Percentage"
                    fullWidth
                    required
                    type="number"
                    error={!!errors.incentivePercentage}
                    helperText={errors.incentivePercentage?.message || 'Enter percentage between 0 and 100'}
                    placeholder="5.0"
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
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate(`/departments/${department?.id}`)}
                disabled={updateIncentiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={updateIncentiveMutation.isPending ? <CircularProgress size={20} /> : <Save />}
                disabled={updateIncentiveMutation.isPending}
              >
                {updateIncentiveMutation.isPending ? 'Updating...' : 'Update Incentive'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 