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
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  EventBusy,
  Person,
  CalendarMonth,
  Assessment,
  AccessTime,
  Update,
  TrendingDown,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { absenceRecordService } from '../services/api/absenceRecordService';
import { employeeService } from '../services/api/employeeService';
import { absenceThresholdService } from '../services/api/absenceThresholdService';
import type { AbsenceRecord } from '../types/absenceRecord';
import type { Employee } from '../types/employee';
import type { AbsenceThreshold } from '../types/absenceThreshold';
import { useAuth } from '../contexts/AuthContext';

export const AbsenceRecordDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isHRClerk } = useAuth();

  // Fetch absence record
  const {
    data: record,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['absenceRecord', id],
    queryFn: () => absenceRecordService.getAbsenceRecord(Number(id)),
    enabled: Boolean(id),
  });

  // Fetch employee details
  const { data: employee } = useQuery({
    queryKey: ['employee', record?.employeeId],
    queryFn: () => employeeService.getEmployee(record!.employeeId.toString()),
    enabled: Boolean(record?.employeeId),
  });

  // Fetch employee's absence history
  const { data: employeeAbsenceHistory = [] } = useQuery({
    queryKey: ['employeeAbsenceHistory', record?.employeeId],
    queryFn: () => absenceRecordService.getAbsenceRecordsForEmployee(record!.employeeId),
    enabled: Boolean(record?.employeeId),
  });

  // Fetch absence thresholds to show which threshold applies
  const { data: thresholds = [] } = useQuery({
    queryKey: ['absenceThresholds'],
    queryFn: () => absenceThresholdService.getAbsenceThresholds(),
  });

  const handleBack = () => {
    navigate('/absence-records');
  };

  const handleEdit = () => {
    navigate(`/absence-records/${id}/edit`);
  };

  // Find applicable threshold
  const applicableThreshold = record && thresholds.length > 0 
    ? thresholds.find(threshold => 
        threshold.minAbsenceDays <= record.absenceDays && 
        (!threshold.maxAbsenceDays || threshold.maxAbsenceDays >= record.absenceDays)
      )
    : null;

  // Calculate year summary for this employee
  const yearSummary = React.useMemo(() => {
    if (!record || employeeAbsenceHistory.length === 0) return null;
    
    const yearRecords = employeeAbsenceHistory.filter(r => r.year === record.year);
    const totalDays = yearRecords.reduce((sum, r) => sum + r.absenceDays, 0);
    const monthsWithAbsence = yearRecords.filter(r => r.absenceDays > 0).length;
    
    return {
      totalDays,
      monthsWithAbsence,
      recordCount: yearRecords.length
    };
  }, [record, employeeAbsenceHistory]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading absence record: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  if (!record) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Absence record not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Absence Record Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {record.employeeName} - {record.monthName} {record.year}
            </Typography>
          </Box>
        </Box>
        {(isAdmin() || isHRClerk()) && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit Record
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Main Information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusy sx={{ mr: 1 }} />
                Absence Information
              </Typography>
              
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Employee"
                    secondary={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {record.employeeName}
                        </Typography>
                        {employee && (
                          <Typography variant="body2" color="text.secondary">
                            {employee.employeeNumber} • {employee.departmentName} • {employee.jobGradeName}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    <CalendarMonth />
                  </ListItemIcon>
                  <ListItemText
                    primary="Period"
                    secondary={`${record.monthName} ${record.year}`}
                  />
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    <EventBusy />
                  </ListItemIcon>
                  <ListItemText
                    primary="Absence Days"
                    secondary={
                      <Chip
                        label={`${record.absenceDays} days`}
                        size="small"
                        color={record.absenceDays > 5 ? 'error' : record.absenceDays > 2 ? 'warning' : 'default'}
                      />
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Salary Adjustment"
                    secondary={
                      record.adjustmentPercentage !== undefined && record.adjustmentPercentage !== null ? (
                        <Chip
                          icon={record.adjustmentPercentage > 0 ? <TrendingUp /> : record.adjustmentPercentage < 0 ? <TrendingDown /> : undefined}
                          label={absenceRecordService.formatPercentage(record.adjustmentPercentage)}
                          size="small"
                          color={absenceRecordService.getAdjustmentColor(record.adjustmentPercentage)}
                        />
                      ) : (
                        <Chip label="No adjustment" size="small" color="default" />
                      )
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Applicable Threshold */}
          {applicableThreshold && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ mr: 1 }} />
                  Applied Threshold
                </Typography>
                
                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Threshold Name"
                      secondary={applicableThreshold.name}
                    />
                  </ListItem>
                  
                  <ListItem divider>
                    <ListItemText
                      primary="Description"
                      secondary={applicableThreshold.description}
                    />
                  </ListItem>
                  
                  <ListItem divider>
                    <ListItemText
                      primary="Day Range"
                      secondary={`${applicableThreshold.minAbsenceDays} - ${applicableThreshold.maxAbsenceDays || '∞'} days`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Adjustment Percentage"
                      secondary={
                        <Chip
                          label={`${applicableThreshold.adjustmentPercentage >= 0 ? '+' : ''}${applicableThreshold.adjustmentPercentage}%`}
                          color={applicableThreshold.adjustmentPercentage < 0 ? 'error' : 'success'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
                
                {applicableThreshold.adjustmentPercentage < 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This absence record results in a salary deduction.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Record Metadata */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} />
                Record Information
              </Typography>
              
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={absenceRecordService.formatDate(record.createdAt)}
                  />
                </ListItem>
                
                {record.updatedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <Update />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={absenceRecordService.formatDate(record.updatedAt)}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Side Panel - Year Summary & History */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Year Summary */}
          {yearSummary && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {record.year} Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {yearSummary.totalDays}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Absence Days
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, textAlign: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {yearSummary.monthsWithAbsence}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Months with Absence
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6">
                        {yearSummary.recordCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Records
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Recent History */}
          {employeeAbsenceHistory.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <History sx={{ mr: 1 }} />
                  Recent Absence History
                </Typography>
                
                <List dense>
                  {employeeAbsenceHistory
                    .sort((a, b) => {
                      if (a.year !== b.year) return b.year - a.year;
                      return b.month - a.month;
                    })
                    .slice(0, 6)
                    .map((historyRecord) => (
                      <ListItem 
                        key={historyRecord.id}
                        sx={{ 
                          backgroundColor: historyRecord.id === record.id ? 'action.selected' : 'transparent',
                          borderRadius: 1,
                          mb: 0.5
                        }}
                      >
                        <ListItemText
                          primary={`${historyRecord.monthName} ${historyRecord.year}`}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`${historyRecord.absenceDays} days`}
                                size="small"
                                color={historyRecord.absenceDays > 5 ? 'error' : historyRecord.absenceDays > 2 ? 'warning' : 'default'}
                              />
                              {historyRecord.adjustmentPercentage !== undefined && historyRecord.adjustmentPercentage !== null && (
                                <Chip
                                  label={absenceRecordService.formatPercentage(historyRecord.adjustmentPercentage)}
                                  size="small"
                                  color={absenceRecordService.getAdjustmentColor(historyRecord.adjustmentPercentage)}
                                />
                              )}
                            </Box>
                          }
                        />
                        {historyRecord.id === record.id && (
                          <Tooltip title="Current record">
                            <Chip label="Current" size="small" color="primary" />
                          </Tooltip>
                        )}
                      </ListItem>
                    ))
                  }
                </List>
                
                {employeeAbsenceHistory.length > 6 && (
                  <Button
                    size="small"
                    onClick={() => navigate(`/employees/${record.employeeId}/absence-records`)}
                    sx={{ mt: 1 }}
                  >
                    View All History
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 