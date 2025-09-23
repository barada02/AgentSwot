import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatInterface from '../components/ChatInterface';
import SessionDetailView from '../components/SessionDetailView';
import { useSessionContext } from '../context/SessionContext';
import { useStorageApi } from '../hooks/useStorageApi';

const AIPage: React.FC = () => {
  const { 
    currentSession,
    createNewSession,
    viewingSessionId,
    setViewingSessionId,
    isViewingHistory,
    setIsViewingHistory,
    setCurrentSession,
  } = useSessionContext();
  
  const { createSession } = useStorageApi();

  // Create fallback session if none exists
  useEffect(() => {
    if (!currentSession && !isViewingHistory) {
      console.log('No current session found, creating fallback session');
      const newSession = createNewSession();
      
      // Try to create session in backend
      createSession(newSession).catch(error => {
        console.warn('Failed to create backend session, continuing with local session:', error);
      });
    }
  }, [currentSession, isViewingHistory, createNewSession, createSession]);

  const handleSessionSelect = (sessionId: string) => {
    setViewingSessionId(sessionId);
  };

  const handleContinueChat = (sessionId: string) => {
    // Convert sessionId to UserSession and make it current
    const session = {
      userId: 'demo-user-123', // In real app, get from auth
      sessionId: sessionId,
      appName: 'multi_tool_agent',
    };
    
    setCurrentSession(session);
    setViewingSessionId(null);
    setIsViewingHistory(false);
  };

  return (
    <DashboardLayout
      showSessionHistory={true}
      onSessionSelect={handleSessionSelect}
      selectedSessionId={viewingSessionId || undefined}
    >
      <Box sx={{ height: 'calc(100vh - 120px)' }}>
        {isViewingHistory && viewingSessionId ? (
          // Show historical session details
          <SessionDetailView
            sessionId={viewingSessionId}
            onContinueChat={handleContinueChat}
          />
        ) : (
          // Show active chat interface
          <>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                AI Business Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentSession 
                  ? `Active Session: ${currentSession.sessionId.slice(-8)}`
                  : 'Describe your business and get intelligent SWOT analysis with infographics'
                }
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
              {currentSession ? (
                <ChatInterface 
                  userSession={currentSession}
                  sessionCreated={true} // Session already created through context
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Initializing Session...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we set up your analysis session
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AIPage;
