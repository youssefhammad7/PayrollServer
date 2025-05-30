import React, { useState, useEffect } from 'react';
import { Box, Chip, CircularProgress } from '@mui/material';
import { authService } from '../../services/auth/authService';

export const ApiStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isBackendReachable, setIsBackendReachable] = useState(false);

  useEffect(() => {
    const checkBackendStatus = async () => {
      setIsChecking(true);
      try {
        const isReachable = await authService.healthCheck();
        setIsBackendReachable(isReachable);
      } catch (error) {
        setIsBackendReachable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendStatus();
  }, []);

  if (isChecking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Chip label="Checking API..." size="small" variant="outlined" />
      </Box>
    );
  }

  return (
    <Chip
      label={isBackendReachable ? '🌐 Real API' : '🧪 Mock API'}
      size="small"
      color={isBackendReachable ? 'success' : 'warning'}
      variant="outlined"
    />
  );
}; 