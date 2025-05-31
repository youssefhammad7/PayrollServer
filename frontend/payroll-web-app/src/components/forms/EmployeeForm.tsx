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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { employeeService } from '../../services/api/employeeService';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../types/employee';

// Validation schema
const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(50, 'Employee ID must be less than 50 characters'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  departmentId: z.string().min(1, 'Department is required').refine((val) => !isNaN(parseInt(val, 10)), {
    message: 'Invalid department selection'
  }),
  jobGradeId: z.string().min(1, 'Job grade is required').refine((val) => !isNaN(parseInt(val, 10)), {
    message: 'Invalid job grade selection'
  }),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  mode: 'create' | 'edit';
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ mode }) => {
  const { id: employeeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      hireDate: new Date().toISOString().split('T')[0],
      departmentId: '',
      jobGradeId: '',
    },
  });

  console.log('Form errors:', errors);
  console.log('Current form values - departmentId type:', typeof control._formValues?.departmentId, 'value:', control._formValues?.departmentId);
  console.log('Current form values - jobGradeId type:', typeof control._formValues?.jobGradeId, 'value:', control._formValues?.jobGradeId);

  // Fetch employee data for editing
  const {
    data: employee,
    isLoading: employeeLoading,
    error: employeeError,
  } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeService.getEmployee(employeeId!),
    enabled: mode === 'edit' && !!employeeId,
  });

  // Fetch departments for dropdown
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => employeeService.getDepartments(),
  });

  // Fetch job grades for dropdown
  const { data: jobGrades = [], isLoading: jobGradesLoading } = useQuery({
    queryKey: ['jobGrades'],
    queryFn: () => employeeService.getJobGrades(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.createEmployee(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate(`/employees/${data.id}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => 
      employeeService.updateEmployee(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      navigate(`/employees/${data.id}`);
    },
  });

  // Populate form with employee data when editing
  useEffect(() => {
    if (mode === 'edit' && employee) {
      const formData: EmployeeFormData = {
        employeeId: employee.employeeNumber || '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber || '',
        address: employee.address || '',
        dateOfBirth: employee.dateOfBirth.split('T')[0],
        hireDate: employee.hiringDate.split('T')[0],
        departmentId: employee.departmentId.toString(),
        jobGradeId: employee.jobGradeId.toString(),
      };
      reset(formData);
    }
  }, [employee, mode, reset]);

  const onSubmit = (data: EmployeeFormData) => {
    console.log('Form submission data:', data);

    if (mode === 'create') {
      const requestData: CreateEmployeeRequest = {
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth,
        hireDate: data.hireDate,
        departmentId: parseInt(data.departmentId, 10),
        jobGradeId: parseInt(data.jobGradeId, 10),
      };
      console.log('Create request data:', requestData);
      createMutation.mutate(requestData);
    } else {
      const requestData: UpdateEmployeeRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth,
        departmentId: parseInt(data.departmentId, 10),
        jobGradeId: parseInt(data.jobGradeId, 10),
        employmentStatus: employee?.employmentStatus || 'Active', // Use existing status or default
      };
      console.log('Update request data:', requestData);
      updateMutation.mutate({ id: employeeId!, data: requestData });
    }
  };

  const mutation = mode === 'create' ? createMutation : updateMutation;
  const isLoading = employeeLoading || departmentsLoading || jobGradesLoading;

  if (mode === 'edit' && employeeError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading employee: {(employeeError as Error).message}
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/employees')}
            sx={{ textDecoration: 'none' }}
          >
            Employees
          </Link>
          {mode === 'edit' && employee && (
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate(`/employees/${employee.id}`)}
              sx={{ textDecoration: 'none' }}
            >
              {employee.firstName} {employee.lastName}
            </Link>
          )}
          <Typography color="text.primary">
            {mode === 'create' ? 'Add Employee' : 'Edit Employee'}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employees')}
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
            {/* Debug form errors */}
            {Object.keys(errors).length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Form Validation Errors:</Typography>
                {Object.entries(errors).map(([field, error]) => (
                  <Typography key={field} variant="body2">
                    {field}: {error?.message}
                  </Typography>
                ))}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Employee ID"
                      fullWidth
                      required
                      disabled={mode === 'edit'}
                      error={!!errors.employeeId}
                      helperText={mode === 'edit' 
                        ? 'Employee ID cannot be changed after creation' 
                        : errors.employeeId?.message
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      type="email"
                      fullWidth
                      required
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      fullWidth
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Employment Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hire Date"
                      type="date"
                      fullWidth
                      required
                      disabled={mode === 'edit'}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.hireDate}
                      helperText={mode === 'edit' 
                        ? 'Hire date cannot be changed after creation' 
                        : errors.hireDate?.message
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.departmentId}>
                      <InputLabel>Department</InputLabel>
                      <Select 
                        {...field} 
                        label="Department"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select a department</em>
                        </MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.departmentId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                          {errors.departmentId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="jobGradeId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.jobGradeId}>
                      <InputLabel>Job Grade</InputLabel>
                      <Select 
                        {...field} 
                        label="Job Grade"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select a job grade</em>
                        </MenuItem>
                        {jobGrades.map((grade) => (
                          <MenuItem key={grade.id} value={grade.id.toString()}>
                            {grade.name} (${grade.minSalary.toLocaleString()} - ${grade.maxSalary.toLocaleString()})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.jobGradeId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                          {errors.jobGradeId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/employees')}
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
                    {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Employee' : 'Update Employee'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}; 