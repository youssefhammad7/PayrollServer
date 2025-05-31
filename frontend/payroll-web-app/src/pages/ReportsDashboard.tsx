import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  AccountBalance,
  BarChart,
  PersonSearch,
  Assessment,
  TrendingUp,
  People,
  DateRange,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  features: string[];
  access: string[];
}

export const ReportsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const reportCards: ReportCard[] = [
    {
      title: 'Attendance Reports',
      description: 'Track employee attendance, absence days, and related adjustments',
      icon: <AccessTime sx={{ fontSize: 40 }} />,
      path: '/reports/attendance',
      color: 'info',
      features: ['Monthly absence tracking', 'Adjustment calculations', 'Department filtering', 'Export options'],
      access: ['Admin', 'HR Clerk'],
    },
    {
      title: 'Salary Reports',
      description: 'Comprehensive salary reports with payroll summaries and breakdowns',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      path: '/reports/salary',
      color: 'primary',
      features: ['Monthly salary reports', 'Department summaries', 'Payroll verification', 'Individual payslips'],
      access: ['Admin', 'HR Clerk'],
    },
    {
      title: 'Incentives Reports',
      description: 'Detailed breakdown of all incentives and deductions',
      icon: <BarChart sx={{ fontSize: 40 }} />,
      path: '/reports/incentives',
      color: 'success',
      features: ['Department incentives', 'Service year bonuses', 'Attendance adjustments', 'Total calculations'],
      access: ['Admin', 'HR Clerk'],
    },
    {
      title: 'Employee Directory',
      description: 'Complete employee directory with contact information',
      icon: <PersonSearch sx={{ fontSize: 40 }} />,
      path: '/reports/directory',
      color: 'secondary',
      features: ['Complete contact list', 'Department grouping', 'Printable format', 'Export capabilities'],
      access: ['Admin', 'HR Clerk', 'Read-Only'],
    },
  ];

  const hasAccess = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => user?.roles.includes(role));
  };

  const getAccessibleReports = () => {
    return reportCards.filter(card => hasAccess(card.access));
  };

  const getStatsData = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    return {
      currentPeriod: `${currentMonth} ${currentYear}`,
      totalReports: getAccessibleReports().length,
      availableExports: ['CSV', 'PDF'],
    };
  };

  const stats = getStatsData();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generate comprehensive reports for payroll, attendance, and employee management.
          All reports can be exported to CSV or PDF formats.
        </Typography>
      </Box>

      {/* Current Period Info */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <DateRange color="primary" />
          <Typography variant="h6" color="primary.main">
            Current Reporting Period
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Period</Typography>
            <Typography variant="h6">{stats.currentPeriod}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Available Reports</Typography>
            <Typography variant="h6">{stats.totalReports} reports</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Export Formats</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {stats.availableExports.map((format) => (
                <Chip key={format} label={format} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Report Cards Grid */}
      <Grid container spacing={3}>
        {getAccessibleReports().map((report) => (
          <Grid item xs={12} md={6} key={report.title}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[8],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${report.color}.main`, mr: 2 }}>
                    {report.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {report.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {report.access.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          color={user?.roles.includes(role) ? 'success' : 'default'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {report.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Key Features:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {report.features.map((feature, index) => (
                    <Typography 
                      key={index} 
                      component="li" 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  color={report.color}
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={() => navigate(report.path)}
                  disabled={!hasAccess(report.access)}
                >
                  Generate Report
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp color="success" />
          <Typography variant="h6">Quick Overview</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" color="primary.main">
                Active Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalReports} report types available based on your access level
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <AccessTime sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" color="info.main">
                Real-time Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All reports reflect the most current data from the system
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <BarChart sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" color="success.main">
                Export Ready
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download reports in CSV or PDF format for external use
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}; 