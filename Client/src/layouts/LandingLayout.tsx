import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BaseLayout from './BaseLayout';

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  background: 'linear-gradient(45deg, #ffffff 30%, #3b82f6 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
              >
                AgentSwot
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="text" 
                onClick={() => navigate('/auth?mode=login')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/auth?mode=signup')}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2563eb 30%, #1e40af 90%)',
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {children}
      </Box>
    </BaseLayout>
  );
};

export default LandingLayout;
