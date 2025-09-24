import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';

const SimpleDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Simple Dashboard Test
        </Typography>
        <Typography variant="body1" gutterBottom>
          If you can see this, the basic app is working.
        </Typography>
        <Button variant="contained" color="primary">
          Test Button
        </Button>
      </Box>
    </DashboardLayout>
  );
};

export default SimpleDashboard;