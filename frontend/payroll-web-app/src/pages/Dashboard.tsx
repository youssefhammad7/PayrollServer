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
  alpha,
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
      color: '#1E88E5',
      change: '+12 this month',
    },
    {
      title: 'Departments',
      value: '8',
      icon: <Business />,
      color: '#FB8C00',
      change: 'No changes',
    },
    {
      title: 'Monthly Payroll',
      value: '$2.4M',
      icon: <AccountBalance />,
      color: '#43A047',
      change: '+5.2% from last month',
    },
    {
      title: 'Reports Generated',
      value: '23',
      icon: <Assessment />,
      color: '#29B6F6',
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
      {/* Header Section */}
      <Box sx={{ 
        mb: 4, 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1E88E5 0%, #1976D2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
            Here's what's happening with your payroll system today.
          </Typography>
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#4CAF50',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                },
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                System Online
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              • Last sync: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* JWT Test Section */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(30,136,229,0.1)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                boxShadow: '0 4px 12px rgba(30,136,229,0.3)',
              }}>
                <Security />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  API Authentication Test
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verify your JWT token integration
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Test if your JWT token is properly included in API requests.
            </Typography>
            <Button
              variant="contained"
              onClick={handleTestJWT}
              disabled={isTestingJWT}
              startIcon={isTestingJWT ? <CircularProgress size={20} /> : <Security />}
              sx={{
                background: 'linear-gradient(135deg, #1E88E5 0%, #1976D2 100%)',
                boxShadow: '0 4px 12px rgba(30,136,229,0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(30,136,229,0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {isTestingJWT ? 'Testing...' : 'Test JWT Authentication'}
            </Button>
            
            {/* JWT Test Result */}
            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                variant="filled"
                sx={{ 
                  mt: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
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
          <Card 
            key={index}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(30,136,229,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(30,136,229,0.15)',
                border: '1px solid rgba(30,136,229,0.2)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${stat.color}, ${stat.color}dd)`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: stat.color, 
                    mr: 2,
                    width: 56,
                    height: 56,
                    boxShadow: `0 8px 16px ${stat.color}40`,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.8rem',
                    },
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 500, lineHeight: 1.2 }}
                  >
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(stat.color, 0.08),
                border: `1px solid ${alpha(stat.color, 0.2)}`,
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: stat.color,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  📈 {stat.change}
                </Typography>
              </Box>
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