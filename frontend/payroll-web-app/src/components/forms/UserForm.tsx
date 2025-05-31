import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Edit,
} from '@mui/icons-material';
import { userService } from '../../services/api/userService';
import type { CreateUserRequest, UpdateUserRequest, User } from '../../types/user';
import { SYSTEM_ROLES } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import type { SelectChangeEvent } from '@mui/material/Select';

interface UserFormProps {
  mode: 'create' | 'edit';
}

export const UserForm: React.FC<UserFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Check authorization
  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access user management. This feature is available to Admin users only.
        </Alert>
      </Box>
    );
  }

  // State
  const [formData, setFormData] = useState<CreateUserRequest & UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    isActive: true,
    roles: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data for edit mode
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id!),
    enabled: mode === 'edit' && !!id,
  });

  // Fetch available roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.getRoles(),
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (mode === 'edit' && userData) {
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        phoneNumber: userData.phoneNumber,
        isActive: userData.isActive,
        roles: userData.roles,
      });
    }
  }, [mode, userData]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      enqueueSnackbar('User created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to create user', { variant: 'error' });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { id: string; userData: UpdateUserRequest }) =>
      userService.updateUser(data.id, data.userData),
    onSuccess: () => {
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      navigate('/users');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update user', { variant: 'error' });
    },
  });

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!userService.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else {
      const usernameValidation = userService.validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.errors[0];
      }
    }

    // Password validation for create mode
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordValidation = userService.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors[0];
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      const createData: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dateOfBirth: formData.dateOfBirth,
      };
      createUserMutation.mutate(createData);
    } else if (id) {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
        roles: formData.roles,
      };
      updateUserMutation.mutate({ id, userData: updateData });
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle role selection
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // For multiple select, value is already an array
    const roles = typeof value === 'string' ? [value] : value;
    setFormData(prev => ({ ...prev, roles }));
    
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  if (mode === 'edit' && isLoadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {mode === 'create' 
            ? 'Create a new user account with roles and permissions'
            : `Update user information and manage roles for ${userData ? userService.getFullName(userData) : ''}`
          }
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            {mode === 'create' ? <PersonAdd /> : <Edit />}
            <Typography variant="h6">
              {mode === 'create' ? 'User Information' : 'Update User Information'}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {/* Basic Information */}
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />

            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleInputChange('username')}
              error={!!errors.username}
              helperText={errors.username || 'Username must be 3-20 characters, letters, numbers, and underscores only'}
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              helperText="Optional"
            />

            {/* Date of birth only for create mode */}
            {mode === 'create' && (
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                required
              />
            )}

            {/* Password fields only for create mode */}
            {mode === 'create' && (
              <>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password || 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {/* User Status (only for edit mode) */}
            {mode === 'edit' && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange('isActive')}
                    />
                  }
                  label="User is active"
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Roles Section */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Role Assignment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select one or more roles for this user. Roles determine what features and data the user can access.
          </Typography>

          <FormControl fullWidth error={!!errors.roles}>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={formData.roles}
              onChange={handleRoleChange}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      color={userService.getRoleColor(value)}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.values(SYSTEM_ROLES).map((role) => (
                <MenuItem key={role} value={role}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{role}</span>
                    <Chip
                      size="small"
                      label={userService.getRoleDisplayName(role)}
                      color={userService.getRoleColor(role)}
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.roles && (
              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                {errors.roles}
              </Typography>
            )}
          </FormControl>

          {/* Role descriptions */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Role Descriptions:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">
                • <strong>Admin:</strong> Full system access including user management and all features
              </Typography>
              <Typography variant="body2">
                • <strong>HR Clerk:</strong> Payroll operations, employee management, and reports
              </Typography>
              <Typography variant="body2">
                • <strong>Read-Only:</strong> View-only access to employee directory and basic reports
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/users')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}; 