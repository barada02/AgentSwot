import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Assessment as InfographicIcon,
} from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatInterface from '../components/ChatInterface';
import type { UserSession } from '../types';

const AIPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'infographic'>('chat');
  
  // Generate consistent session ID for this component instance
  const [userSession] = useState<UserSession>(() => ({
    userId: 'demo-user-123', // In a real app, this would come from authentication
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique session ID
    appName: 'multi_tool_agent', // App name for API calls
  }));

  return (
    <DashboardLayout>
      <Box sx={{ height: 'calc(100vh - 120px)' }}>
        {/* View Toggle */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant={activeView === 'chat' ? 'contained' : 'outlined'}
            startIcon={<ChatIcon />}
            onClick={() => setActiveView('chat')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            AI Chat
          </Button>
          <Button
            variant={activeView === 'infographic' ? 'contained' : 'outlined'}
            startIcon={<InfographicIcon />}
            onClick={() => setActiveView('infographic')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Infographic
          </Button>
        </Box>

        {/* Content Area */}
        <Paper 
          sx={{ 
            height: 'calc(100% - 60px)',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {activeView === 'chat' ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  AI Business Analysis Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Describe your business and get intelligent SWOT analysis
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <ChatInterface 
                  userSession={userSession}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Analysis Infographic
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual representation of your business analysis
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                  Infographic viewer will be displayed here after completing a chat analysis.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  Start a conversation in the AI Chat to generate SWOT analysis visualizations.
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default AIPage;
