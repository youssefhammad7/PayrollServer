import React, { useEffect, useState } from 'react';
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
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { Save, Cancel, ArrowBack, Event, Percent } from '@mui/icons-material';
import { absenceThresholdService } from '../../services/api/absenceThresholdService';
import type { AbsenceThreshold, CreateAbsenceThresholdRequest, UpdateAbsenceThresholdRequest } from '../../types/absenceThreshold';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const absenceThresholdSchema = z.object({
  name: z.string()
    .min(1, 'Absence threshold name is required')
    .max(100, 'Absence threshold name must be 100 characters or less'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  minAbsenceDays: z.string()
    .min(1, 'Minimum absence days is required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Minimum absence days must be a valid non-negative number'
    }),
  maxAbsenceDays: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Maximum absence days must be a valid non-negative number'
    }),
  adjustmentPercentage: z.string()
    .min(1, 'Adjustment percentage is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -100 && num <= 100;
    }, {
      message: 'Adjustment percentage must be between -100 and 100'
    }),
  isActive: z.boolean(),
}).refine((data) => {
  const minDays = parseInt(data.minAbsenceDays, 10);
  const maxDays = data.maxAbsenceDays ? parseInt(data.maxAbsenceDays, 10) : null;
  
  if (maxDays !== null && maxDays <= minDays) {
    return false;
  }
  return true;
}, {
  message: 'Maximum absence days must be greater than minimum absence days',
  path: ['maxAbsenceDays'],
});

type AbsenceThresholdFormData = z.infer<typeof absenceThresholdSchema>;

interface AbsenceThresholdFormProps {
  mode: 'create' | 'edit';
}

export const AbsenceThresholdForm: React.FC<AbsenceThresholdFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const isEdit = mode === 'edit';

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AbsenceThresholdFormData>({
    resolver: zodResolver(absenceThresholdSchema),
    defaultValues: {
      name: '',
      description: '',
      minAbsenceDays: '',
      maxAbsenceDays: '',
      adjustmentPercentage: '',
      isActive: true,
    },
  });

  // Watch values for preview
  const minDaysStr = watch('minAbsenceDays');
  const maxDaysStr = watch('maxAbsenceDays');
  const adjustmentStr = watch('adjustmentPercentage');

  // Fetch absence threshold data for edit mode
  const {
    data: absenceThreshold,
    isLoading: absenceThresholdLoading,
    error: absenceThresholdError,
  } = useQuery({
    queryKey: ['absenceThreshold', id],
    queryFn: () => absenceThresholdService.getAbsenceThreshold(id!),
    enabled: isEdit && !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAbsenceThresholdRequest) => absenceThresholdService.createAbsenceThreshold(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['absenceThresholds'] });
      navigate(`/absence-thresholds/${data.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAbsenceThresholdRequest) => absenceThresholdService.updateAbsenceThreshold(id!, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['absenceThresholds'] });
      queryClient.invalidateQueries({ queryKey: ['absenceThreshold', id] });
      navigate(`/absence-thresholds/${data.id}`);
    },
  });

  // Populate form with absence threshold data in edit mode
  useEffect(() => {
    if (isEdit && absenceThreshold) {
      const formData: AbsenceThresholdFormData = {
        name: absenceThreshold.name,
        description: absenceThreshold.description,
        minAbsenceDays: absenceThreshold.minAbsenceDays.toString(),
        maxAbsenceDays: absenceThreshold.maxAbsenceDays?.toString() || '',
        adjustmentPercentage: absenceThreshold.adjustmentPercentage.toString(),
        isActive: absenceThreshold.isActive,
      };
      reset(formData);
    }
  }, [isEdit, absenceThreshold, reset]);

  const onSubmit = (data: AbsenceThresholdFormData) => {
    const requestData = {
      name: data.name,
      description: data.description,
      minAbsenceDays: parseInt(data.minAbsenceDays, 10),
      maxAbsenceDays: data.maxAbsenceDays && data.maxAbsenceDays !== '' 
        ? parseInt(data.maxAbsenceDays, 10) 
        : undefined,
      adjustmentPercentage: parseFloat(data.adjustmentPercentage),
      isActive: data.isActive,
    };

    if (isEdit) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData);
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  // Format day range preview
  const formatDayRangePreview = () => {
    const minDays = minDaysStr ? parseInt(minDaysStr, 10) : null;
    const maxDays = maxDaysStr && maxDaysStr !== '' ? parseInt(maxDaysStr, 10) : null;
    
    if (minDays === null || isNaN(minDays)) return null;
    
    if (maxDays === null) {
      return `${minDays}+ days`;
    }
    
    if (isNaN(maxDays)) return null;
    
    return `${minDays}-${maxDays} days`;
  };

  // Format adjustment preview
  const formatAdjustmentPreview = () => {
    if (!adjustmentStr) return null;
    const adjustment = parseFloat(adjustmentStr);
    if (isNaN(adjustment)) return null;
    
    const sign = adjustment >= 0 ? '+' : '';
    return `${sign}${adjustment.toFixed(2)}%`;
  };

  const dayRangePreview = formatDayRangePreview();
  const adjustmentPreview = formatAdjustmentPreview();

  if (isEdit && absenceThresholdError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading absence threshold: {(absenceThresholdError as Error).message}
        </Alert>
      </Box>
    );
  }

  if (isEdit && absenceThresholdLoading) {
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
          onClick={() => navigate('/absence-thresholds')}
          sx={{ textDecoration: 'none' }}
        >
          Absence Thresholds
        </Link>
        {isEdit && absenceThreshold && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/absence-thresholds/${absenceThreshold.id}`)}
            sx={{ textDecoration: 'none' }}
          >
            {absenceThreshold.name}
          </Link>
        )}
        <Typography color="text.primary">
          {isEdit ? 'Edit Absence Threshold' : 'Create Absence Threshold'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Absence Threshold' : 'Create New Absence Threshold'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/absence-thresholds')}
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

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Absence thresholds</strong> define how employee salaries are adjusted based on absence days.
            Use positive percentages for bonuses (low absence) and negative percentages for deductions (high absence).
          </Typography>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Absence Threshold Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Absence Threshold Name"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  placeholder="e.g., Perfect Attendance, Low Absence, High Absence"
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
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="Detailed description of this absence threshold..."
                />
              )}
            />

            {/* Absence Days Range */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Absence Days Range
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Controller
                  name="minAbsenceDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Minimum Absence Days"
                      fullWidth
                      required
                      type="number"
                      error={!!errors.minAbsenceDays}
                      helperText={errors.minAbsenceDays?.message}
                      placeholder="0"
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                    />
                  )}
                />

                <Controller
                  name="maxAbsenceDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Maximum Absence Days (Optional)"
                      fullWidth
                      type="number"
                      error={!!errors.maxAbsenceDays}
                      helperText={errors.maxAbsenceDays?.message || 'Leave empty for open-ended (e.g., 5+ days)'}
                      placeholder="Leave empty for no upper limit"
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                    />
                  )}
                />
              </Box>
              
              {dayRangePreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Preview:
                  </Typography>
                  <Chip
                    icon={<Event />}
                    label={dayRangePreview}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            {/* Adjustment Percentage */}
            <Box>
              <Controller
                name="adjustmentPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salary Adjustment Percentage"
                    fullWidth
                    required
                    type="number"
                    error={!!errors.adjustmentPercentage}
                    helperText={errors.adjustmentPercentage?.message || 'Positive for bonuses, negative for deductions'}
                    placeholder="5.0 or -10.0"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{
                      min: -100,
                      max: 100,
                      step: 0.1,
                    }}
                  />
                )}
              />
              
              {adjustmentPreview && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Preview:
                  </Typography>
                  <Chip
                    icon={<Percent />}
                    label={adjustmentPreview}
                    color={adjustmentStr && parseFloat(adjustmentStr) >= 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    For $50,000 salary: {adjustmentStr && !isNaN(parseFloat(adjustmentStr)) 
                      ? `${parseFloat(adjustmentStr) >= 0 ? '+' : ''}$${((50000 * parseFloat(adjustmentStr)) / 100).toFixed(0)}`
                      : 'Enter percentage to see calculation'
                    }
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Active Status */}
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Active"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/absence-thresholds')}
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
                  : (isEdit ? 'Update Absence Threshold' : 'Create Absence Threshold')
                }
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 