import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useApi } from '../hooks/useApi';
import StorageTestComponent from '../components/StorageTestComponent';
import type { UserSession } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSession } = useApi();
  const [creatingSession, setCreatingSession] = useState(false);

  const handleNewAnalysis = async () => {
    setCreatingSession(true);
    
    try {
      // Create new session
      const userSession: UserSession = {
        userId: 'demo-user-123', // In real app, get from auth
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        appName: 'multi_tool_agent', // For API calls
      };
      
      console.log('Creating new analysis session:', userSession);
      await createSession(userSession);
      
      // Navigate to AI page with session data
      navigate('/ai', { state: { userSession } });
    } catch (error) {
      console.error('Failed to create session:', error);
      // Still navigate but let AI page handle session creation as fallback
      navigate('/ai');
    } finally {
      setCreatingSession(false);
    }
  };

  const stats = [
    { title: 'Total Analyses', value: '24', icon: <AssessmentIcon />, color: '#3b82f6' },
    { title: 'This Month', value: '8', icon: <TrendingUpIcon />, color: '#10b981' },
    { title: 'Avg. Response Time', value: '2.3s', icon: <SpeedIcon />, color: '#f59e0b' },
  ];

  return (
    <DashboardLayout>
      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Welcome back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to analyze your business with AI-powered insights?
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${stat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Start New Analysis
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Get AI-powered SWOT analysis for your business in minutes
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={creatingSession ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                onClick={handleNewAnalysis}
                disabled={creatingSession}
                sx={{
                  bgcolor: 'white',
                  color: '#6366f1',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f8fafc',
                  },
                  '&:disabled': {
                    bgcolor: '#f3f4f6',
                    color: '#9ca3af',
                  }
                }}
              >
                {creatingSession ? 'Creating Session...' : 'New Analysis'}
              </Button>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No recent analyses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start your first analysis to see activity here
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Storage Test Section */}
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <StorageIcon sx={{ mr: 2 }} />
              <Typography variant="h6">
                🧪 MongoDB Storage Integration Test
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <StorageTestComponent />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
