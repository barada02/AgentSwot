import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatInterface from '../components/ChatInterface';
import type { UserSession } from '../types';

const AIPage: React.FC = () => {
  const location = useLocation();
  
  // Get session from navigation state, or create fallback session
  const [sessionData] = useState<{session: UserSession, fromDashboard: boolean}>(() => {
    const stateSession = location.state?.userSession;
    if (stateSession) {
      console.log('Using session from navigation:', stateSession);
      return { session: stateSession, fromDashboard: true }; // Session already created from Dashboard
    }
    
    // Fallback session if navigation doesn't have one
    console.log('Creating fallback session');
    return { 
      session: {
        userId: 'demo-user-123',
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        appName: 'multi_tool_agent',
      }, 
      fromDashboard: false // Session needs to be created
    };
  });

  return (
    <DashboardLayout>
      <Box sx={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            AI Business Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Describe your business and get intelligent SWOT analysis with infographics
          </Typography>
        </Box>

        {/* Chat Interface */}
        <Paper 
          sx={{ 
            height: 'calc(100% - 80px)',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ChatInterface 
            userSession={sessionData.session} 
            sessionCreated={sessionData.fromDashboard}
          />
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default AIPage;
