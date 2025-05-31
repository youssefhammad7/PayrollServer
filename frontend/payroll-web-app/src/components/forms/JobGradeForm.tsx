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
import { jobGradeService } from '../../services/api/jobGradeService';
import type { JobGrade, CreateJobGradeRequest, UpdateJobGradeRequest } from '../../types/jobGrade';

// Validation schema
const jobGradeSchema = z.object({
  name: z.string()
    .min(1, 'Job grade name is required')
    .max(100, 'Job grade name must be 100 characters or less'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  minSalary: z.string()
    .min(1, 'Minimum salary is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Minimum salary must be a valid positive number'
    }),
  maxSalary: z.string()
    .min(1, 'Maximum salary is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Maximum salary must be a valid positive number'
    }),
}).refine((data) => {
  const minSalary = parseFloat(data.minSalary);
  const maxSalary = parseFloat(data.maxSalary);
  return maxSalary >= minSalary;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['maxSalary'],
});

type JobGradeFormData = z.infer<typeof jobGradeSchema>;

interface JobGradeFormProps {
  mode: 'create' | 'edit';
}

export const JobGradeForm: React.FC<JobGradeFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobGradeFormData>({
    resolver: zodResolver(jobGradeSchema),
    defaultValues: {
      name: '',
      description: '',
      minSalary: '',
      maxSalary: '',
    },
  });

  // Fetch job grade data for edit mode
  const {
    data: jobGrade,
    isLoading: jobGradeLoading,
    error: jobGradeError,
  } = useQuery({
    queryKey: ['jobGrade', id],
    queryFn: () => jobGradeService.getJobGrade(id!),
    enabled: isEdit && !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateJobGradeRequest) => jobGradeService.createJobGrade(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobGrades'] });
      navigate(`/job-grades/${data.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateJobGradeRequest) => jobGradeService.updateJobGrade(id!, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobGrades'] });
      queryClient.invalidateQueries({ queryKey: ['jobGrade', id] });
      navigate(`/job-grades/${data.id}`);
    },
  });

  // Populate form with job grade data in edit mode
  useEffect(() => {
    if (isEdit && jobGrade) {
      const formData: JobGradeFormData = {
        name: jobGrade.name,
        description: jobGrade.description,
        minSalary: jobGrade.minSalary.toString(),
        maxSalary: jobGrade.maxSalary.toString(),
      };
      reset(formData);
    }
  }, [isEdit, jobGrade, reset]);

  const onSubmit = (data: JobGradeFormData) => {
    const requestData = {
      name: data.name,
      description: data.description,
      minSalary: parseFloat(data.minSalary),
      maxSalary: parseFloat(data.maxSalary),
    };

    if (isEdit) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData);
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && jobGradeError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading job grade: {(jobGradeError as Error).message}
        </Alert>
      </Box>
    );
  }

  if (isEdit && jobGradeLoading) {
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
          onClick={() => navigate('/job-grades')}
          sx={{ textDecoration: 'none' }}
        >
          Job Grades
        </Link>
        {isEdit && jobGrade && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/job-grades/${jobGrade.id}`)}
            sx={{ textDecoration: 'none' }}
          >
            {jobGrade.name}
          </Link>
        )}
        <Typography color="text.primary">
          {isEdit ? 'Edit Job Grade' : 'Create Job Grade'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Job Grade' : 'Create New Job Grade'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/job-grades')}
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
            {/* Job Grade Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Grade Name"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  placeholder="e.g., Senior Software Engineer"
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="Detailed description of the job grade responsibilities and requirements..."
                />
              )}
            />

            {/* Salary Range */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="minSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Salary"
                    fullWidth
                    required
                    type="number"
                    error={!!errors.minSalary}
                    helperText={errors.minSalary?.message}
                    placeholder="50000"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{
                      min: 0,
                      step: 1000,
                    }}
                  />
                )}
              />

              <Controller
                name="maxSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maximum Salary"
                    fullWidth
                    required
                    type="number"
                    error={!!errors.maxSalary}
                    helperText={errors.maxSalary?.message}
                    placeholder="80000"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{
                      min: 0,
                      step: 1000,
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
                onClick={() => navigate('/job-grades')}
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
                {mutation.isPending 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Job Grade' : 'Create Job Grade')
                }
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 