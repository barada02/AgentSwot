import React from 'react';
import { Box } from '@mui/material';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {children}
    </Box>
  );
};

export default BaseLayout;
