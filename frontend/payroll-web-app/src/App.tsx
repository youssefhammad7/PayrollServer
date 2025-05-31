import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { EmployeeForm } from './components/forms/EmployeeForm';
import { DepartmentList } from './pages/DepartmentList';
import { DepartmentForm } from './components/forms/DepartmentForm';
import { DepartmentDetail } from './pages/DepartmentDetail';
import { DepartmentIncentiveForm } from './components/forms/DepartmentIncentiveForm';
import { DepartmentIncentiveHistoryPage } from './pages/DepartmentIncentiveHistory';
import { JobGradeList } from './pages/JobGradeList';
import { JobGradeDetail } from './pages/JobGradeDetail';
import { JobGradeForm } from './components/forms/JobGradeForm';
import { ServiceBracketList } from './pages/ServiceBracketList';
import { ServiceBracketDetail } from './pages/ServiceBracketDetail';
import { ServiceBracketForm } from './components/forms/ServiceBracketForm';
import { AbsenceThresholdList } from './pages/AbsenceThresholdList';
import { AbsenceThresholdDetail } from './pages/AbsenceThresholdDetail';
import { AbsenceThresholdForm } from './components/forms/AbsenceThresholdForm';
import { PayrollCalculation } from './pages/PayrollCalculation';
import PayrollReviewPage from './pages/payroll/PayrollReviewPage';
import { SalaryRecordList } from './pages/SalaryRecordList';
import { SalaryRecordForm } from './pages/SalaryRecordForm';
import { SalaryRecordDetail } from './pages/SalaryRecordDetail';
import { AbsenceRecordList } from './pages/AbsenceRecordList';
import { AbsenceRecordForm } from './pages/AbsenceRecordForm';
import { AbsenceRecordDetail } from './pages/AbsenceRecordDetail';
import { ComingSoon } from './components/ComingSoon';

// Debug component to help identify issues
const DebugApp = () => {
  console.log('DebugApp - Rendering...');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔧 Debug Mode - App is Loading
      </Typography>
      <Typography variant="body1" gutterBottom>
        If you see this message, the basic React app is working.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Check the browser console for any errors.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <CircularProgress />
      </Box>
    </Box>
  );
};

function App() {
  console.log('App - Starting to render...');
  
  try {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <AuthProvider>
            <Router>
              <Routes>
                {/* Debug route */}
                <Route path="/debug" element={<DebugApp />} />
                
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes with Main Layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Admin Only Routes */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute adminOnly>
                        <div>Users Management (Coming Soon)</div>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin & HR Clerk Routes */}
                  <Route
                    path="departments"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <DepartmentList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="departments/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <DepartmentForm mode="create" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="departments/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <DepartmentDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="departments/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <DepartmentForm mode="edit" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="job-grades"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <JobGradeList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="job-grades/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <JobGradeForm mode="create" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="job-grades/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <JobGradeDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="job-grades/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <JobGradeForm mode="edit" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="service-brackets"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <ServiceBracketList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="service-brackets/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <ServiceBracketForm mode="create" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="service-brackets/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <ServiceBracketDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="service-brackets/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <ServiceBracketForm mode="edit" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-thresholds"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <AbsenceThresholdList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-thresholds/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <AbsenceThresholdForm mode="create" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-thresholds/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk', 'Read-Only']}>
                        <AbsenceThresholdDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-thresholds/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <AbsenceThresholdForm mode="edit" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="salary-records"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <SalaryRecordList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="salary-records/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <SalaryRecordForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="salary-records/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <SalaryRecordDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="salary-records/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <SalaryRecordForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-records"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <AbsenceRecordList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-records/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <AbsenceRecordForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-records/:id"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <AbsenceRecordDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="absence-records/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <AbsenceRecordForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="payroll/calculate"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <PayrollCalculation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="payroll/review"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <PayrollReviewPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Employee routes - HR Clerk can add, everyone can view */}
                  <Route path="employees" element={<EmployeeList />} />
                  <Route path="employees/:id" element={<EmployeeDetail />} />
                  <Route
                    path="employees/create"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <EmployeeForm mode="create" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees/:id/edit"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <EmployeeForm mode="edit" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees/:employeeId/payroll/:year/:month"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <div>Employee Payroll Detail (Coming Soon)</div>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Reports - Available to all authenticated users */}
                  <Route path="reports" element={<div>Reports Dashboard (Coming Soon)</div>} />
                  <Route path="reports/attendance" element={<div>Attendance Reports (Coming Soon)</div>} />
                  <Route path="reports/salary" element={<div>Salary Reports (Coming Soon)</div>} />
                  <Route path="reports/incentives" element={<div>Incentives Reports (Coming Soon)</div>} />
                  <Route path="reports/directory" element={<div>Employee Directory (Coming Soon)</div>} />
                  
                  {/* Settings and Profile - Available to all authenticated users */}
                  <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
                  <Route path="profile" element={<div>Profile (Coming Soon)</div>} />
                  
                  {/* Department routes - HR Clerk can add, everyone can view */}
                  <Route
                    path="departments/:id/incentive"
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <DepartmentIncentiveForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="departments/:id/history"
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                        <DepartmentIncentiveHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Default redirect */}
                  <Route path="" element={<Navigate to="/dashboard" replace />} />
                </Route>

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('App - Error during render:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          ❌ Application Error
        </Typography>
        <Typography variant="body1">
          Something went wrong. Check the console for details.
        </Typography>
        <pre>{String(error)}</pre>
      </Box>
    );
  }
}

export default App;
