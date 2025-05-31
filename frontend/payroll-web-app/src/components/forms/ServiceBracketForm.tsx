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
import { Save, Cancel, ArrowBack, Warning, Timeline } from '@mui/icons-material';
import { serviceBracketService } from '../../services/api/serviceBracketService';
import type { ServiceBracket, CreateServiceBracketRequest, UpdateServiceBracketRequest } from '../../types/serviceBracket';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const serviceBracketSchema = z.object({
  name: z.string()
    .min(1, 'Service bracket name is required')
    .max(100, 'Service bracket name must be 100 characters or less'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  minYearsOfService: z.string()
    .min(1, 'Minimum years of service is required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Minimum years must be a valid non-negative number'
    }),
  maxYearsOfService: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Maximum years must be a valid non-negative number'
    }),
  incentivePercentage: z.string()
    .min(1, 'Incentive percentage is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: 'Incentive percentage must be between 0 and 100'
    }),
  isActive: z.boolean(),
}).refine((data) => {
  const minYears = parseInt(data.minYearsOfService, 10);
  const maxYears = data.maxYearsOfService ? parseInt(data.maxYearsOfService, 10) : null;
  
  if (maxYears !== null && maxYears <= minYears) {
    return false;
  }
  return true;
}, {
  message: 'Maximum years must be greater than minimum years',
  path: ['maxYearsOfService'],
});

type ServiceBracketFormData = z.infer<typeof serviceBracketSchema>;

interface ServiceBracketFormProps {
  mode: 'create' | 'edit';
}

export const ServiceBracketForm: React.FC<ServiceBracketFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const isEdit = mode === 'edit';

  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [isCheckingOverlap, setIsCheckingOverlap] = useState(false);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ServiceBracketFormData>({
    resolver: zodResolver(serviceBracketSchema),
    defaultValues: {
      name: '',
      description: '',
      minYearsOfService: '',
      maxYearsOfService: '',
      incentivePercentage: '',
      isActive: true,
    },
  });

  const watchedValues = watch(['minYearsOfService', 'maxYearsOfService']);

  // Fetch service bracket data for edit mode
  const {
    data: serviceBracket,
    isLoading: serviceBracketLoading,
    error: serviceBracketError,
  } = useQuery({
    queryKey: ['serviceBracket', id],
    queryFn: () => serviceBracketService.getServiceBracket(id!),
    enabled: isEdit && !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateServiceBracketRequest) => serviceBracketService.createServiceBracket(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['serviceBrackets'] });
      navigate(`/service-brackets/${data.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateServiceBracketRequest) => serviceBracketService.updateServiceBracket(id!, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['serviceBrackets'] });
      queryClient.invalidateQueries({ queryKey: ['serviceBracket', id] });
      navigate(`/service-brackets/${data.id}`);
    },
  });

  // Populate form with service bracket data in edit mode
  useEffect(() => {
    if (isEdit && serviceBracket) {
      const formData: ServiceBracketFormData = {
        name: serviceBracket.name,
        description: serviceBracket.description,
        minYearsOfService: serviceBracket.minYearsOfService.toString(),
        maxYearsOfService: serviceBracket.maxYearsOfService?.toString() || '',
        incentivePercentage: serviceBracket.incentivePercentage.toString(),
        isActive: serviceBracket.isActive,
      };
      reset(formData);
    }
  }, [isEdit, serviceBracket, reset]);

  // Watch individual values to prevent infinite re-renders
  const minYearsStr = watch('minYearsOfService');
  const maxYearsStr = watch('maxYearsOfService');

  // Check for overlaps when years change
  useEffect(() => {
    const checkOverlap = async () => {
      // Only check overlap for admin users since the API endpoint requires Admin role
      if (!isAdmin()) {
        setOverlapWarning(null);
        return;
      }

      // Don't check if form is still being populated or values are empty
      if (!minYearsStr || minYearsStr === '') {
        setOverlapWarning(null);
        return;
      }
      
      const minYears = parseInt(minYearsStr, 10);
      const maxYears = maxYearsStr && maxYearsStr !== '' ? parseInt(maxYearsStr, 10) : undefined;
      
      // Validate the numbers before making API call
      if (isNaN(minYears) || minYears < 0) {
        setOverlapWarning(null);
        return;
      }
      
      if (maxYears !== undefined && (isNaN(maxYears) || maxYears < 0)) {
        setOverlapWarning(null);
        return;
      }
      
      // Don't check if max years is less than or equal to min years (validation will handle this)
      if (maxYears !== undefined && maxYears <= minYears) {
        setOverlapWarning(null);
        return;
      }
      
      setIsCheckingOverlap(true);
      try {
        const result = await serviceBracketService.checkOverlap({
          minYears,
          maxYears,
          excludeId: isEdit ? parseInt(id!, 10) : undefined,
        });
        
        if (result.hasOverlap) {
          setOverlapWarning('This year range overlaps with an existing service bracket. Please adjust the range.');
        } else {
          setOverlapWarning(null);
        }
      } catch (error) {
        console.error('Failed to check overlap:', error);
        // Don't show overlap warning if API call fails
        setOverlapWarning(null);
      } finally {
        setIsCheckingOverlap(false);
      }
    };

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(checkOverlap, 800);
    return () => clearTimeout(timeoutId);
  }, [minYearsStr, maxYearsStr, isEdit, id, isAdmin]); // Added isAdmin to dependencies

  const onSubmit = (data: ServiceBracketFormData) => {
    const requestData = {
      name: data.name,
      description: data.description,
      minYearsOfService: parseInt(data.minYearsOfService, 10),
      maxYearsOfService: data.maxYearsOfService && data.maxYearsOfService !== '' 
        ? parseInt(data.maxYearsOfService, 10) 
        : undefined,
      incentivePercentage: parseFloat(data.incentivePercentage),
      isActive: data.isActive,
    };

    if (isEdit) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData);
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  // Format year range preview
  const formatYearRangePreview = () => {
    const minYears = minYearsStr ? parseInt(minYearsStr, 10) : null;
    const maxYears = maxYearsStr && maxYearsStr !== '' ? parseInt(maxYearsStr, 10) : null;
    
    if (minYears === null || isNaN(minYears)) return null;
    
    if (maxYears === null) {
      return `${minYears}+ years`;
    }
    
    if (isNaN(maxYears)) return null;
    
    return `${minYears}-${maxYears} years`;
  };

  const yearRangePreview = formatYearRangePreview();

  if (isEdit && serviceBracketError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading service bracket: {(serviceBracketError as Error).message}
        </Alert>
      </Box>
    );
  }

  if (isEdit && serviceBracketLoading) {
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
          onClick={() => navigate('/service-brackets')}
          sx={{ textDecoration: 'none' }}
        >
          Service Brackets
        </Link>
        {isEdit && serviceBracket && (
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/service-brackets/${serviceBracket.id}`)}
            sx={{ textDecoration: 'none' }}
          >
            {serviceBracket.name}
          </Link>
        )}
        <Typography color="text.primary">
          {isEdit ? 'Edit Service Bracket' : 'Create Service Bracket'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Service Bracket' : 'Create New Service Bracket'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/service-brackets')}
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

        {overlapWarning && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 3 }}
            action={
              isCheckingOverlap ? <CircularProgress size={20} /> : null
            }
          >
            {overlapWarning}
          </Alert>
        )}

        {!isAdmin() && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
          >
            Note: Overlap validation is only available for Admin users. Please ensure year ranges don't overlap with existing service brackets.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Service Bracket Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Service Bracket Name"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  placeholder="e.g., Entry Level, Mid Level, Senior Level"
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
                  placeholder="Detailed description of this service bracket..."
                />
              )}
            />

            {/* Years of Service Range */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Years of Service Range
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Controller
                  name="minYearsOfService"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Minimum Years"
                      fullWidth
                      required
                      type="number"
                      error={!!errors.minYearsOfService}
                      helperText={errors.minYearsOfService?.message}
                      placeholder="0"
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                    />
                  )}
                />

                <Controller
                  name="maxYearsOfService"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Maximum Years (Optional)"
                      fullWidth
                      type="number"
                      error={!!errors.maxYearsOfService}
                      helperText={errors.maxYearsOfService?.message || 'Leave empty for open-ended (e.g., 10+ years)'}
                      placeholder="Leave empty for no upper limit"
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                    />
                  )}
                />
              </Box>
              
              {yearRangePreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Preview:
                  </Typography>
                  <Chip
                    icon={<Timeline />}
                    label={yearRangePreview}
                    color="info"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            {/* Incentive Percentage */}
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
                  helperText={errors.incentivePercentage?.message}
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
                onClick={() => navigate('/service-brackets')}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={mutation.isPending ? <CircularProgress size={20} /> : <Save />}
                disabled={mutation.isPending || !!overlapWarning}
              >
                {mutation.isPending 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Service Bracket' : 'Create Service Bracket')
                }
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 