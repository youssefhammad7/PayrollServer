import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Person,
  AttachMoney,
  CalendarToday,
  Notes,
  Business,
  Grade,
  TrendingUp,
  TrendingDown,
  History,
} from '@mui/icons-material';
import { salaryRecordService } from '../services/api/salaryRecordService';
import { employeeService } from '../services/api/employeeService';
import type { SalaryRecord } from '../types/salaryRecord';
import { useAuth } from '../contexts/AuthContext';

export const SalaryRecordDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isHRClerk } = useAuth();

  // Fetch salary record details
  const {
    data: salaryRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['salaryRecord', id],
    queryFn: () => salaryRecordService.getSalaryRecord(Number(id)),
    enabled: !!id,
  });

  // Fetch employee details for additional context
  const { data: employee } = useQuery({
    queryKey: ['employee', salaryRecord?.employeeId],
    queryFn: () => employeeService.getEmployee(salaryRecord!.employeeId.toString()),
    enabled: !!salaryRecord?.employeeId,
  });

  // Fetch salary history for comparison
  const { data: salaryHistory = [] } = useQuery({
    queryKey: ['salaryHistory', salaryRecord?.employeeId],
    queryFn: () => salaryRecordService.getSalaryHistory(salaryRecord!.employeeId),
    enabled: !!salaryRecord?.employeeId,
  });

  // Calculate salary change from previous record
  const getSalaryChange = () => {
    if (!salaryRecord || salaryHistory.length === 0) return null;
    
    const sortedHistory = salaryHistory
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
    
    const currentIndex = sortedHistory.findIndex(r => r.id === salaryRecord.id);
    if (currentIndex <= 0) return null;
    
    const previousRecord = sortedHistory[currentIndex - 1];
    return salaryRecordService.calculateSalaryChange(previousRecord.baseSalary, salaryRecord.baseSalary);
  };

  const salaryChange = getSalaryChange();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !salaryRecord) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading salary record: {error instanceof Error ? error.message : 'Record not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/salary-records')}
            sx={{ mr: 2 }}
          >
            Back to Salary Records
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              Salary Record Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {salaryRecord.employeeName} • {salaryRecord.employeeNumber}
            </Typography>
          </Box>
        </Box>
        
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/salary-records/${salaryRecord.id}/edit`)}
          >
            Edit Record
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Main Information */}
        <Box sx={{ display: 'grid', gap: 3 }}>
          {/* Basic Information Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} />
                Salary Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Base Salary</Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {salaryRecordService.formatCurrency(salaryRecord.baseSalary)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Effective Date</Typography>
                  <Typography variant="h6">
                    {salaryRecordService.formatDate(salaryRecord.effectiveDate)}
                  </Typography>
                </Box>
              </Box>

              {salaryChange && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Change from Previous Salary
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={salaryChange.type === 'increase' ? <TrendingUp /> : <TrendingDown />}
                        label={`${salaryChange.percentage >= 0 ? '+' : ''}${salaryChange.percentage.toFixed(1)}%`}
                        color={salaryChange.type === 'increase' ? 'success' : 'error'}
                      />
                      <Typography variant="body2">
                        {salaryRecordService.formatCurrency(Math.abs(salaryChange.amount))} 
                        {salaryChange.type === 'increase' ? ' increase' : ' decrease'}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Employee Information Card */}
          {employee && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Employee Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${employee.firstName} ${employee.lastName}`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={employee.departmentName}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Grade />
                    </ListItemIcon>
                    <ListItemText
                      primary="Job Grade"
                      secondary={`${employee.jobGradeName} (${salaryRecordService.formatCurrency(employee.jobGradeMinSalary || 0)} - ${salaryRecordService.formatCurrency(employee.jobGradeMaxSalary || 0)})`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hire Date"
                      secondary={salaryRecordService.formatDate(employee.hiringDate)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Notes Card */}
          {salaryRecord.notes && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Notes sx={{ mr: 1 }} />
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {salaryRecord.notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Sidebar Information */}
        <Box sx={{ display: 'grid', gap: 3 }}>
          {/* Record Metadata */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Record Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Record ID"
                    secondary={salaryRecord.id}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Created Date"
                    secondary={salaryRecordService.formatDate(salaryRecord.createdAt)}
                  />
                </ListItem>
                
                {salaryRecord.updatedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Last Updated"
                      secondary={salaryRecordService.formatDate(salaryRecord.updatedAt)}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Salary History */}
          {salaryHistory.length > 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <History sx={{ mr: 1 }} />
                  Salary History
                </Typography>
                
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {salaryHistory
                    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                    .slice(0, 5)
                    .map((record) => (
                      <Box
                        key={record.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: record.id === salaryRecord.id ? 'primary.light' : 'grey.50',
                          borderRadius: 1,
                          opacity: record.id === salaryRecord.id ? 1 : 0.8,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: record.id === salaryRecord.id ? 'bold' : 'normal',
                            color: record.id === salaryRecord.id ? 'primary.contrastText' : 'inherit'
                          }}
                        >
                          {salaryRecordService.formatCurrency(record.baseSalary)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: record.id === salaryRecord.id ? 'primary.contrastText' : 'text.secondary'
                          }}
                        >
                          {salaryRecordService.formatDate(record.effectiveDate)}
                        </Typography>
                      </Box>
                    ))}
                  
                  {salaryHistory.length > 5 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      +{salaryHistory.length - 5} more records
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Salary Range Analysis */}
          {employee && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Salary Range Analysis
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Job Grade Range
                  </Typography>
                  <Typography variant="body2">
                    {salaryRecordService.formatCurrency(employee.jobGradeMinSalary || 0)} - {salaryRecordService.formatCurrency(employee.jobGradeMaxSalary || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Position in Range
                  </Typography>
                  {employee.jobGradeMinSalary && employee.jobGradeMaxSalary && (
                    <>
                      <Typography variant="body2">
                        {(((salaryRecord.baseSalary - employee.jobGradeMinSalary) / (employee.jobGradeMaxSalary - employee.jobGradeMinSalary)) * 100).toFixed(1)}%
                      </Typography>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: 'grey.200', 
                        borderRadius: 4, 
                        mt: 1,
                        position: 'relative'
                      }}>
                        <Box sx={{ 
                          width: `${((salaryRecord.baseSalary - employee.jobGradeMinSalary) / (employee.jobGradeMaxSalary - employee.jobGradeMinSalary)) * 100}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 4,
                        }} />
                      </Box>
                    </>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {salaryRecord.baseSalary < (employee.jobGradeMinSalary || 0) && (
                    <Chip label="Below Range" color="error" size="small" />
                  )}
                  {salaryRecord.baseSalary > (employee.jobGradeMaxSalary || 0) && (
                    <Chip label="Above Range" color="warning" size="small" />
                  )}
                  {salaryRecord.baseSalary >= (employee.jobGradeMinSalary || 0) && 
                   salaryRecord.baseSalary <= (employee.jobGradeMaxSalary || 0) && (
                    <Chip label="Within Range" color="success" size="small" />
                  )}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 