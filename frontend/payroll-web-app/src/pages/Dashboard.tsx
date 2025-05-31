import React, { useState, useEffect } from 'react';
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
  Skeleton,
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
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth/authService';
import { dashboardService } from '../services/api/dashboardService';
import { useQuery } from '@tanstack/react-query';

// Define types locally to avoid import issues
interface StatisticData {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface DashboardStatistics {
  totalEmployees: StatisticData;
  totalDepartments: StatisticData;
  monthlyPayroll: StatisticData;
  reportsGenerated: StatisticData;
}

interface RecentActivity {
  title: string;
  description: string;
  time: string;
  status: string;
  icon: string;
  type: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isHRClerk } = useAuth();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingJWT, setIsTestingJWT] = useState(false);

  // Fetch dashboard statistics
  const { 
    data: statistics, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: dashboardService.getStatistics,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch recent activities
  const { 
    data: activities, 
    isLoading: activitiesLoading, 
    error: activitiesError,
    refetch: refetchActivities 
  } = useQuery({
    queryKey: ['dashboard-recent-activities'],
    queryFn: () => dashboardService.getRecentActivities(10),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    retry: 3,
    retryDelay: 1000,
  });

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

  const handleRefreshData = () => {
    refetchStats();
    refetchActivities();
  };

  // Convert API data to display format
  const getStatsForDisplay = (stats: DashboardStatistics | undefined) => {
    if (!stats) return [];

    // Debug: Log the actual API response structure
    console.log('Dashboard API Response:', stats);
    console.log('API Response Keys:', Object.keys(stats));

    // Check if we're getting the raw API response instead of extracted data
    if ('isSuccess' in stats && 'data' in stats) {
      console.log('Received raw API response, extracting data...');
      const extractedStats = (stats as any).data;
      console.log('Extracted statistics data:', extractedStats);
      
      // Use the extracted data
      if (extractedStats && extractedStats.totalEmployees && extractedStats.totalDepartments && 
          extractedStats.monthlyPayroll && extractedStats.reportsGenerated) {
        return [
          {
            title: extractedStats.totalEmployees.title,
            value: extractedStats.totalEmployees.value,
            icon: <People />,
            color: '#1E88E5',
            change: extractedStats.totalEmployees.change,
          },
          {
            title: extractedStats.totalDepartments.title,
            value: extractedStats.totalDepartments.value,
            icon: <Business />,
            color: '#FB8C00',
            change: extractedStats.totalDepartments.change,
          },
          {
            title: extractedStats.monthlyPayroll.title,
            value: extractedStats.monthlyPayroll.value,
            icon: <AccountBalance />,
            color: '#43A047',
            change: extractedStats.monthlyPayroll.change,
          },
          {
            title: extractedStats.reportsGenerated.title,
            value: extractedStats.reportsGenerated.value,
            icon: <Assessment />,
            color: '#29B6F6',
            change: extractedStats.reportsGenerated.change,
          },
        ];
      }
    }

    // Check if we have the required data in the expected format
    if (!stats.totalEmployees || !stats.totalDepartments || !stats.monthlyPayroll || !stats.reportsGenerated) {
      console.error('API response missing expected properties:', {
        hasTotalEmployees: !!stats.totalEmployees,
        hasTotalDepartments: !!stats.totalDepartments,
        hasMonthlyPayroll: !!stats.monthlyPayroll,
        hasReportsGenerated: !!stats.reportsGenerated,
        actualKeys: Object.keys(stats),
        rawResponse: stats
      });
      
      // Return empty array to prevent crashes
      return [];
    }

    // Process normal extracted data
    return [
      {
        title: stats.totalEmployees.title,
        value: stats.totalEmployees.value,
        icon: <People />,
        color: '#1E88E5',
        change: stats.totalEmployees.change,
      },
      {
        title: stats.totalDepartments.title,
        value: stats.totalDepartments.value,
        icon: <Business />,
        color: '#FB8C00',
        change: stats.totalDepartments.change,
      },
      {
        title: stats.monthlyPayroll.title,
        value: stats.monthlyPayroll.value,
        icon: <AccountBalance />,
        color: '#43A047',
        change: stats.monthlyPayroll.change,
      },
      {
        title: stats.reportsGenerated.title,
        value: stats.reportsGenerated.value,
        icon: <Assessment />,
        color: '#29B6F6',
        change: stats.reportsGenerated.change,
      },
    ];
  };

  // Convert API activities to display format
  const getActivitiesForDisplay = (apiActivities: RecentActivity[] | undefined) => {
    // Debug logging
    console.log('Activities data type:', typeof apiActivities);
    console.log('Activities data:', apiActivities);
    
    // Check if activities is undefined or null
    if (!apiActivities) {
      console.log('Activities is undefined/null, returning empty array');
      return [];
    }

    // Check if we're getting the raw API response instead of extracted data
    if (typeof apiActivities === 'object' && 'isSuccess' in apiActivities && 'data' in apiActivities) {
      console.log('Received raw API response for activities, extracting data...');
      const extractedActivities = (apiActivities as any).data;
      console.log('Extracted activities data:', extractedActivities);
      
      if (Array.isArray(extractedActivities)) {
        return extractedActivities.map(activity => ({
          title: activity.title,
          description: activity.description,
          time: activity.time,
          status: activity.status,
          icon: getIconForType(activity.icon, activity.status),
          type: activity.type,
        }));
      }
    }

    // Check if activities is not an array
    if (!Array.isArray(apiActivities)) {
      console.error('Activities is not a valid array:', apiActivities);
      return [];
    }

    // Activities is a valid array, process it normally
    return apiActivities.map(activity => ({
      title: activity.title,
      description: activity.description,
      time: activity.time,
      status: activity.status,
      icon: getIconForType(activity.icon, activity.status),
      type: activity.type,
    }));
  };

  const getIconForType = (iconType: string, status: string) => {
    const colorMap = {
      completed: 'success',
      info: 'primary',
      warning: 'warning',
      error: 'error'
    };

    const color = colorMap[status as keyof typeof colorMap] || 'primary';

    switch (iconType) {
      case 'AccountBalance':
        return <AccountBalance color={color as any} />;
      case 'PersonAdd':
        return <PersonAdd color={color as any} />;
      case 'Schedule':
        return <Schedule color={color as any} />;
      case 'CheckCircle':
        return <CheckCircle color={color as any} />;
      case 'Warning':
        return <Warning color={color as any} />;
      default:
        return <CheckCircle color={color as any} />;
    }
  };

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

  const hasAccess = (roles: string[]) => {
    return roles.some(role => user?.roles.includes(role));
  };

  const stats = getStatsForDisplay(statistics);
  const recentActivities = getActivitiesForDisplay(activities);

  // Show loading skeleton for first load
  const isFirstLoad = statsLoading && !statistics;

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
        
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap' 
          }}>
           
          </Box>
        </Box>
      </Box>

      {/* Error Alerts */}
      {statsError && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetchStats()}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard statistics. Please check your backend connection.
        </Alert>
      )}

      {activitiesError && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetchActivities()}>
              Retry
            </Button>
          }
        >
          Failed to load recent activities.
        </Alert>
      )}
      
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
        {isFirstLoad ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={56} height={56} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
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
          ))
        )}
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
            {activitiesLoading && !activities ? (
              <Box sx={{ p: 2 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List>
                {recentActivities.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="Activities will appear here when employees, payroll, or other records are created or updated in the backend."
                    />
                  </ListItem>
                ) : (
                  recentActivities.map((activity, index) => (
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
                  ))
                )}
              </List>
            )}
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