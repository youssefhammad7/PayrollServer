import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface ComingSoonProps {
  message?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  message = "This feature is coming soon!" 
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Construction sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h4" color="text.secondary">
          {message}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We're working hard to bring you this feature. Stay tuned!
        </Typography>
      </Paper>
    </Box>
  );
}; 