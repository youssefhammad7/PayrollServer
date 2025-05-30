import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  People,
  Business,
  AccountBalance,
  Assessment,
  PersonAdd,
  Calculate,
  FileDownload,
  TrendingUp,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardPageSimple: React.FC = () => {
  const { user, logout } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Total Employees',
      value: '247',
      icon: <People />,
      color: '#2196F3',
      change: '+12 this month',
    },
    {
      title: 'Departments',
      value: '8',
      icon: <Business />,
      color: '#4CAF50',
      change: '+2 new',
    },
    {
      title: 'Monthly Payroll',
      value: '$186,420',
      icon: <AccountBalance />,
      color: '#FF9800',
      change: '+5.2% vs last month',
    },
    {
      title: 'Reports Generated',
      value: '34',
      icon: <Assessment />,
      color: '#9C27B0',
      change: 'This month',
    },
  ];

  const quickActions = [
    { title: 'Add New Employee', icon: <PersonAdd /> },
    { title: 'Calculate Payroll', icon: <Calculate /> },
    { title: 'Generate Reports', icon: <FileDownload /> },
    { title: 'View Analytics', icon: <TrendingUp /> },
  ];

  const recentActivities = [
    { action: 'New employee added', user: 'John Smith', time: '2 hours ago' },
    { action: 'Payroll calculated', user: 'HR System', time: '5 hours ago' },
    { action: 'Report generated', user: 'Jane Doe', time: '1 day ago' },
    { action: 'Department created', user: 'Admin', time: '2 days ago' },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header with logout */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        p: 3,
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your payroll system today.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Role: ${user?.roles.join(', ')}`} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={logout}
          color="error"
        >
          Logout
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3,
          mb: 4 
        }}
      >
        {stats.map((stat, index) => (
          <Box 
            key={index}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
              minWidth: '250px'
            }}
          >
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3 
        }}
      >
        {/* Quick Actions */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 66%' } }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 2 
                }}
              >
                {quickActions.map((action, index) => (
                  <Box 
                    key={index}
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                      minWidth: '200px'
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={action.icon}
                      sx={{ 
                        py: 2,
                        justifyContent: 'flex-start',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white',
                        }
                      }}
                    >
                      {action.title}
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.user} • ${activity.time}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Success Message */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Card elevation={2} sx={{ bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom>
              🎉 Success! Frontend is Working Perfectly!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}; 