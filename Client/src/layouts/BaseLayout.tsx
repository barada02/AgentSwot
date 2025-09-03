import React from 'react';
import { Box } from '@mui/material';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'auto',
    }}>
      {children}
    </Box>
  );
};

export default BaseLayout;
