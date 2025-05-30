import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Business,
  AccountBalance,
  Assessment,
  Schedule,
  PersonAdd,
  Calculate,
  CheckCircle,
  Warning,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth/authService';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isHRClerk } = useAuth();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingJWT, setIsTestingJWT] = useState(false);

  const handleTestJWT = async () => {
    setIsTestingJWT(true);
    setTestResult(null);
    
    try {
      const result = await authService.testAuthenticatedRequest();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed with error'
      });
    } finally {
      setIsTestingJWT(false);
    }
  };

  const stats = [
    {
      title: 'Total Employees',
      value: '156',
      icon: <People />,
      color: 'primary.main',
      change: '+12 this month',
    },
    {
      title: 'Departments',
      value: '8',
      icon: <Business />,
      color: 'secondary.main',
      change: 'No changes',
    },
    {
      title: 'Monthly Payroll',
      value: '$2.4M',
      icon: <AccountBalance />,
      color: 'success.main',
      change: '+5.2% from last month',
    },
    {
      title: 'Reports Generated',
      value: '23',
      icon: <Assessment />,
      color: 'info.main',
      change: '8 this week',
    },
  ];

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Register a new employee',
      icon: <PersonAdd />,
      action: () => navigate('/employees/create'),
      color: 'primary',
      roles: ['Admin', 'HR Clerk'],
    },
    {
      title: 'Calculate Payroll',
      description: 'Run monthly payroll calculation',
      icon: <Calculate />,
      action: () => navigate('/payroll/calculate'),
      color: 'secondary',
      roles: ['Admin', 'HR Clerk'],
    },
    {
      title: 'View Reports',
      description: 'Access payroll and attendance reports',
      icon: <Assessment />,
      action: () => navigate('/reports'),
      color: 'info',
      roles: ['Admin', 'HR Clerk', 'Read-Only'],
    },
    {
      title: 'Manage Employees',
      description: 'View and update employee information',
      icon: <People />,
      action: () => navigate('/employees'),
      color: 'success',
      roles: ['Admin', 'HR Clerk', 'Read-Only'],
    },
  ];

  const recentActivities = [
    {
      title: 'Payroll calculated for March 2024',
      description: 'Monthly payroll processing completed',
      time: '2 hours ago',
      status: 'completed',
      icon: <CheckCircle color="success" />,
    },
    {
      title: 'New employee added: John Doe',
      description: 'Software Engineer, Engineering Department',
      time: '1 day ago',
      status: 'info',
      icon: <PersonAdd color="primary" />,
    },
    {
      title: 'Attendance report generated',
      description: 'Monthly attendance summary for all departments',
      time: '2 days ago',
      status: 'completed',
      icon: <Schedule color="info" />,
    },
    {
      title: 'Pending salary approvals',
      description: '3 salary adjustments waiting for approval',
      time: '3 days ago',
      status: 'warning',
      icon: <Warning color="warning" />,
    },
  ];

  const hasAccess = (roles: string[]) => {
    return roles.some(role => user?.roles.includes(role));
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your payroll system today.
        </Typography>
      </Box>

      {/* JWT Test Section */}
      <Box sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Security color="primary" />
              <Typography variant="h6">
                API Authentication Test
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test if your JWT token is properly included in API requests.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleTestJWT}
              disabled={isTestingJWT}
              startIcon={isTestingJWT ? <CircularProgress size={20} /> : <Security />}
            >
              {isTestingJWT ? 'Testing...' : 'Test JWT Authentication'}
            </Button>
            
            {/* JWT Test Result */}
            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                {testResult.message}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {stat.change}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              {quickActions
                .filter(action => hasAccess(action.roles))
                .map((action, index) => (
                  <Button
                    key={index}
                    fullWidth
                    variant="outlined"
                    color={action.color as any}
                    startIcon={action.icon}
                    onClick={action.action}
                    sx={{
                      p: 2,
                      height: 'auto',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Button>
                ))}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {activity.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={
                            activity.status === 'completed'
                              ? 'success'
                              : activity.status === 'warning'
                              ? 'warning'
                              : 'default'
                          }
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Role-specific sections */}
      {(isAdmin() || isHRClerk()) && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Additional administrative features and controls will be available here.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}; 