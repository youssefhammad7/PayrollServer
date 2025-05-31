import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
  Divider,
} from '@mui/material';
import {
  Person,
  Lock,
  Save,
  Edit,
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Badge,
  Security,
} from '@mui/icons-material';
import { userService } from '../services/api/userService';
import type { UserProfile as UserProfileType, ChangePasswordRequest } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Fetch user profile
  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getUserProfile(),
  });

  // Update form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber,
      });
    }
  }, [userProfile]);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to change password', { variant: 'error' });
    },
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle profile edit
  const handleEditToggle = () => {
    if (isEditing && userProfile) {
      // Reset form data if canceling
      setProfileData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber,
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle profile input changes
  const handleProfileInputChange = (field: keyof typeof profileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({ ...prev, [field]: event.target.value }));
  };

  // Handle password input changes
  const handlePasswordInputChange = (field: keyof ChangePasswordRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({ ...prev, [field]: event.target.value }));
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = userService.validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors[0];
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword && passwordData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change submission
  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading user profile: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          User profile not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      {/* Profile Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}>
            {userProfile.firstName[0]}{userProfile.lastName[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" gutterBottom>
              {userService.getFullName(userProfile)}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{userProfile.username}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userProfile.roles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  color={userService.getRoleColor(role)}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{userProfile.email}</Typography>
          </Box>
          {userProfile.phoneNumber && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">{userProfile.phoneNumber}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Profile Information" icon={<Person />} />
          <Tab label="Security" icon={<Lock />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Profile Information Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Personal Information</Typography>
            <Button
              variant={isEditing ? 'outlined' : 'contained'}
              startIcon={<Edit />}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={handleProfileInputChange('firstName')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={handleProfileInputChange('lastName')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={userProfile.username}
                disabled
                helperText="Username cannot be changed"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                onChange={handleProfileInputChange('email')}
                disabled={!isEditing}
                helperText={!isEditing ? "Contact administrator to change email" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={handleProfileInputChange('phoneNumber')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                <Security sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {userProfile.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        color={userService.getRoleColor(role)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => {
                  // TODO: Implement profile update when backend supports it
                  enqueueSnackbar('Profile update feature coming soon', { variant: 'info' });
                  setIsEditing(false);
                }}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Security Tab */}
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a strong password to keep your account secure.
          </Typography>

          <form onSubmit={handlePasswordChange}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange('currentPassword')}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange('newPassword')}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword || 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange('confirmPassword')}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Lock />}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Box>
          </form>

          {/* Security Information */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Password Requirements:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                At least 8 characters long
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Contains uppercase and lowercase letters
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Contains at least one number
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Contains at least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}; 