import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save,
  Cancel,
  EventBusy,
  Person,
  CalendarMonth,
  Assessment,
  Warning,
} from '@mui/icons-material';
import { absenceRecordService } from '../services/api/absenceRecordService';
import { employeeService } from '../services/api/employeeService';
import { absenceThresholdService } from '../services/api/absenceThresholdService';
import type { CreateAbsenceRecordRequest, UpdateAbsenceRecordRequest, AbsenceRecord } from '../types/absenceRecord';
import type { Employee } from '../types/employee';
import type { AbsenceThreshold } from '../types/absenceThreshold';

// Form validation schema
const absenceRecordSchema = z.object({
  employeeId: z.number().min(1, 'Please select an employee'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  month: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12'),
  absenceDays: z.number().min(0, 'Absence days cannot be negative').max(31, 'Absence days cannot exceed 31'),
});

type FormData = z.infer<typeof absenceRecordSchema>;

export const AbsenceRecordForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [adjustmentPreview, setAdjustmentPreview] = useState<{
    percentage: number;
    thresholdName: string;
  } | null>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(absenceRecordSchema),
    defaultValues: {
      employeeId: 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      absenceDays: 0,
    },
  });

  const watchedValues = watch();

  // Fetch employees for autocomplete
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees({ page: 1, pageSize: 1000 }),
    select: (data) => data.items,
  });

  // Fetch absence thresholds for preview
  const { data: thresholds = [] } = useQuery({
    queryKey: ['absenceThresholds'],
    queryFn: () => absenceThresholdService.getAbsenceThresholds(),
  });

  // Fetch existing record for edit
  const { data: existingRecord, isLoading: loadingRecord } = useQuery({
    queryKey: ['absenceRecord', id],
    queryFn: () => absenceRecordService.getAbsenceRecord(Number(id)),
    enabled: isEdit,
  });

  // Effect to populate form when existing record is loaded
  React.useEffect(() => {
    if (existingRecord && employees.length > 0) {
      reset({
        employeeId: existingRecord.employeeId,
        year: existingRecord.year,
        month: existingRecord.month,
        absenceDays: existingRecord.absenceDays,
      });
      
      // Set selected employee for autocomplete
      const employee = employees.find(emp => emp.id === existingRecord.employeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [existingRecord, employees, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAbsenceRecordRequest) => absenceRecordService.createAbsenceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRecords'] });
      navigate('/absence-records');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAbsenceRecordRequest) => 
      absenceRecordService.updateAbsenceRecord(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRecord', id] });
      navigate('/absence-records');
    },
  });

  // Calculate adjustment preview
  React.useEffect(() => {
    if (watchedValues.absenceDays > 0 && thresholds.length > 0) {
      // Find applicable threshold
      const applicableThreshold = thresholds
        .filter(threshold => 
          threshold.minAbsenceDays <= watchedValues.absenceDays && 
          (!threshold.maxAbsenceDays || threshold.maxAbsenceDays >= watchedValues.absenceDays)
        )
        .sort((a, b) => a.minAbsenceDays - b.minAbsenceDays)[0];

      if (applicableThreshold) {
        setAdjustmentPreview({
          percentage: applicableThreshold.adjustmentPercentage,
          thresholdName: applicableThreshold.name,
        });
      } else {
        setAdjustmentPreview(null);
      }
    } else {
      setAdjustmentPreview(null);
    }
  }, [watchedValues.absenceDays, thresholds]);

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({
        absenceDays: data.absenceDays,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    navigate('/absence-records');
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && loadingRecord) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <EventBusy sx={{ mr: 2 }} />
            {isEdit ? 'Edit Absence Record' : 'Create Absence Record'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit 
              ? 'Update the absence days for this employee record'
              : 'Record employee absence days for payroll calculation'
            }
          </Typography>
        </Box>

        {/* Error Display */}
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Employee Selection */}
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeNumber || `EMP${option.id.toString().padStart(4, '0')}`})`}
                  value={selectedEmployee}
                  onChange={(_, value) => {
                    setSelectedEmployee(value);
                    field.onChange(value?.id || 0);
                  }}
                  disabled={isEdit} // Cannot change employee in edit mode
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employee"
                      required
                      error={!!errors.employeeId}
                      helperText={errors.employeeId?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Year and Month Selection */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.year} disabled={isEdit}>
                    <InputLabel>Year</InputLabel>
                    <Select {...field} label="Year">
                      {absenceRecordService.getYearOptions().map((year) => (
                        <MenuItem key={year.value} value={year.value}>
                          {year.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.year && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.year.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.month} disabled={isEdit}>
                    <InputLabel>Month</InputLabel>
                    <Select {...field} label="Month">
                      {absenceRecordService.getMonthOptions().map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.month && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.month.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {/* Absence Days */}
            <Controller
              name="absenceDays"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Absence Days"
                  type="number"
                  required
                  fullWidth
                  inputProps={{ min: 0, max: 31 }}
                  error={!!errors.absenceDays}
                  helperText={errors.absenceDays?.message || 'Number of days the employee was absent during this month'}
                  InputProps={{
                    startAdornment: <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              )}
            />

            {/* Adjustment Preview */}
            {adjustmentPreview && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assessment sx={{ mr: 1 }} />
                    Salary Adjustment Preview
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Applicable Threshold
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {adjustmentPreview.thresholdName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Adjustment Percentage
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        color={adjustmentPreview.percentage < 0 ? 'error.main' : 'success.main'}
                      >
                        {adjustmentPreview.percentage >= 0 ? '+' : ''}{adjustmentPreview.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  {adjustmentPreview.percentage < 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        This absence record will result in a salary deduction based on the configured absence thresholds.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Warning for high absence days */}
            {watchedValues.absenceDays > 10 && (
              <Alert severity="warning" icon={<Warning />}>
                High absence days detected. Please verify the accuracy before saving.
              </Alert>
            )}

            <Divider />

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
              >
                {isSubmitting 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Record' : 'Create Record')
                }
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 