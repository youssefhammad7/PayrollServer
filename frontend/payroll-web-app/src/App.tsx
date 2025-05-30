import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { EmployeeForm } from './components/forms/EmployeeForm';

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
                      <div>Departments Management (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="job-grades"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Job Grades Management (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="service-brackets"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Service Brackets Management (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="absence-thresholds"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Absence Thresholds Management (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="salary-records"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Salary Records (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="absence-records"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Absence Records (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payroll/calculate"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Payroll Calculation (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payroll/review"
                  element={
                    <ProtectedRoute requiredRoles={['Admin', 'HR Clerk']}>
                      <div>Payroll Review (Coming Soon)</div>
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
                
                {/* Reports - Available to all authenticated users */}
                <Route path="reports" element={<div>Reports Dashboard (Coming Soon)</div>} />
                <Route path="reports/attendance" element={<div>Attendance Reports (Coming Soon)</div>} />
                <Route path="reports/salary" element={<div>Salary Reports (Coming Soon)</div>} />
                <Route path="reports/incentives" element={<div>Incentives Reports (Coming Soon)</div>} />
                <Route path="reports/directory" element={<div>Employee Directory (Coming Soon)</div>} />
                
                {/* Settings and Profile - Available to all authenticated users */}
                <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
                <Route path="profile" element={<div>Profile (Coming Soon)</div>} />
                
                {/* Default redirect */}
                <Route path="" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
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
