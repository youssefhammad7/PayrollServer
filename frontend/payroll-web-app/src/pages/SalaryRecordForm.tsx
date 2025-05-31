import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Person,
  AttachMoney,
  CalendarToday,
  Notes,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { salaryRecordService } from '../services/api/salaryRecordService';
import { employeeService } from '../services/api/employeeService';
import type { Employee } from '../types/employee';
import type { CreateSalaryRecordRequest, UpdateSalaryRecordRequest } from '../types/salaryRecord';
import { useAuth } from '../contexts/AuthContext';

// Validation schema
const salaryRecordSchema = z.object({
  employeeId: z.number().min(1, 'Please select an employee'),
  baseSalary: z.number()
    .min(0, 'Base salary must be non-negative')
    .max(10000000, 'Base salary seems too high - please check the amount'),
  effectiveDate: z.date({
    required_error: 'Effective date is required',
    invalid_type_error: 'Please enter a valid date',
  }),
  notes: z.string().max(500, 'Notes must be 500 characters or less'),
});

type SalaryRecordFormData = z.infer<typeof salaryRecordSchema>;

export const SalaryRecordForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAdmin, isHRClerk } = useAuth();
  
  const isEditing = Boolean(id);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<SalaryRecordFormData>({
    resolver: zodResolver(salaryRecordSchema),
    defaultValues: {
      employeeId: 0,
      baseSalary: 0,
      effectiveDate: new Date(),
      notes: '',
    },
    mode: 'onChange',
  });

  const watchedEmployeeId = watch('employeeId');
  const watchedSalary = watch('baseSalary');

  // Check authorization
  if (!isAdmin() && !isHRClerk()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to {isEditing ? 'edit' : 'create'} salary records.
        </Alert>
      </Box>
    );
  }

  // Fetch existing salary record for editing
  const { data: existingSalaryRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['salaryRecord', id],
    queryFn: () => salaryRecordService.getSalaryRecord(Number(id)),
    enabled: isEditing && !!id,
  });

  // Fetch employees for selection
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees({ page: 1, pageSize: 1000 }),
    select: (data) => data.items,
  });

  // Fetch current salary for the selected employee
  const { data: currentSalary } = useQuery({
    queryKey: ['currentSalary', watchedEmployeeId],
    queryFn: () => salaryRecordService.getCurrentSalary(watchedEmployeeId),
    enabled: watchedEmployeeId > 0 && !isEditing,
  });

  // Fetch salary history for context
  const { data: salaryHistory = [] } = useQuery({
    queryKey: ['salaryHistory', watchedEmployeeId],
    queryFn: () => salaryRecordService.getSalaryHistory(watchedEmployeeId),
    enabled: watchedEmployeeId > 0,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSalaryRecordRequest) => salaryRecordService.createSalaryRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRecords'] });
      queryClient.invalidateQueries({ queryKey: ['currentSalary'] });
      queryClient.invalidateQueries({ queryKey: ['salaryHistory'] });
      navigate('/salary-records');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateSalaryRecordRequest) => 
      salaryRecordService.updateSalaryRecord(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryRecords'] });
      queryClient.invalidateQueries({ queryKey: ['salaryRecord', id] });
      queryClient.invalidateQueries({ queryKey: ['currentSalary'] });
      queryClient.invalidateQueries({ queryKey: ['salaryHistory'] });
      navigate('/salary-records');
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingSalaryRecord && isEditing) {
      reset({
        employeeId: existingSalaryRecord.employeeId,
        baseSalary: Number(existingSalaryRecord.baseSalary),
        effectiveDate: new Date(existingSalaryRecord.effectiveDate),
        notes: existingSalaryRecord.notes || '',
      });
    }
  }, [existingSalaryRecord, isEditing, reset]);

  const onSubmit = (data: SalaryRecordFormData) => {
    const formattedData = {
      employeeId: data.employeeId,
      baseSalary: data.baseSalary,
      effectiveDate: data.effectiveDate.toISOString(),
      notes: data.notes,
    };

    if (isEditing) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === watchedEmployeeId);
  const salaryChange = currentSalary && watchedSalary > 0 
    ? salaryRecordService.calculateSalaryChange(currentSalary.baseSalary, watchedSalary)
    : null;

  if (isLoadingRecord) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/salary-records')}
            sx={{ mr: 2 }}
          >
            Back to Salary Records
          </Button>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Salary Record' : 'Create New Salary Record'}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* Main Form */}
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Employee Selection */}
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => 
                        `${option.firstName} ${option.lastName} (${option.employeeNumber})`
                      }
                      value={employees.find(emp => emp.id === field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.id || 0);
                      }}
                      disabled={isEditing} // Can't change employee when editing
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Employee"
                          error={!!errors.employeeId}
                          helperText={errors.employeeId?.message}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body1">
                              {option.firstName} {option.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.employeeNumber} • {option.departmentName}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  )}
                />

                {/* Base Salary */}
                <Controller
                  name="baseSalary"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Base Salary"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!errors.baseSalary}
                      helperText={errors.baseSalary?.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === null || value === undefined) {
                          field.onChange(0);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      value={field.value || ''}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />

                {/* Effective Date */}
                <Controller
                  name="effectiveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Effective Date"
                      slotProps={{
                        textField: {
                          error: !!errors.effectiveDate,
                          helperText: errors.effectiveDate?.message,
                          InputProps: {
                            startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                          },
                        },
                      }}
                    />
                  )}
                />

                {/* Notes */}
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes"
                      multiline
                      rows={4}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      InputProps={{
                        startAdornment: <Notes sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                    />
                  )}
                />

                {/* Error Display */}
                {(createMutation.error || updateMutation.error) && (
                  <Alert severity="error">
                    {createMutation.error?.message || updateMutation.error?.message}
                  </Alert>
                )}

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/salary-records')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || !isDirty || createMutation.isPending || updateMutation.isPending}
                    startIcon={
                      createMutation.isPending || updateMutation.isPending ? 
                      <CircularProgress size={20} /> : <Save />
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? (isEditing ? 'Updating...' : 'Creating...')
                      : (isEditing ? 'Update' : 'Create')
                    }
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Context Information */}
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Employee Information */}
            {selectedEmployee && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    Employee Information
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Employee #:</strong> {selectedEmployee.employeeNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Department:</strong> {selectedEmployee.departmentName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Job Grade:</strong> {selectedEmployee.jobGradeName}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Current Salary Information */}
            {currentSalary && !isEditing && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    Current Salary
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {salaryRecordService.formatCurrency(currentSalary.baseSalary)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Effective: {salaryRecordService.formatDate(currentSalary.effectiveDate)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Salary Change Preview */}
            {salaryChange && watchedSalary > 0 && !isEditing && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Salary Change Preview
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Amount Change:</strong> {salaryRecordService.formatCurrency(salaryChange.amount)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Percentage Change:</strong>
                      <Chip
                        label={`${salaryChange.percentage >= 0 ? '+' : ''}${salaryChange.percentage.toFixed(1)}%`}
                        size="small"
                        color={salaryChange.type === 'increase' ? 'success' : salaryChange.type === 'decrease' ? 'error' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Recent Salary History */}
            {salaryHistory.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Salary History
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {salaryHistory.slice(0, 3).map((record) => (
                      <Box
                        key={record.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {salaryRecordService.formatCurrency(record.baseSalary)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {salaryRecordService.formatDate(record.effectiveDate)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {(createMutation.isSuccess || updateMutation.isSuccess) && (
              <Alert severity="success" icon={<CheckCircle />}>
                Salary record {isEditing ? 'updated' : 'created'} successfully! Redirecting...
              </Alert>
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 