import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatInterface from '../components/ChatInterface';
import { useApi } from '../hooks/useApi';
import type { UserSession } from '../types';

const AnalysisPage: React.FC = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const demoQuery = searchParams.get('demo');
  const isNewSession = sessionId === 'new';
  
  const [query, setQuery] = useState(demoQuery || '');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    isNewSession ? null : sessionId || null
  );
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const { createSession, loading } = useApi();

  useEffect(() => {
    if (!isNewSession && sessionId) {
      // Load existing session
      setCurrentSessionId(sessionId);
      setSessionStarted(true);
      setUserSession({
        userId: 'user-demo', // TODO: Get from auth
        sessionId: sessionId,
        appName: 'multi_tool_agent'
      });
    }
  }, [sessionId, isNewSession]);

  const handleStartAnalysis = async () => {
    if (!query.trim()) return;

    try {
      // Create UserSession object
      const newUserSession: UserSession = {
        userId: 'user-demo', // TODO: Get from auth
        sessionId: `session-${Date.now()}`,
        appName: 'multi_tool_agent'
      };

      // Create new session
      const sessionData = await createSession(newUserSession);
      setCurrentSessionId(newUserSession.sessionId);
      setSessionInfo(sessionData);
      setUserSession(newUserSession);
      setSessionStarted(true);
      
      // Update URL to reflect the new session
      navigate(`/analysis/${newUserSession.sessionId}`, { replace: true });
    } catch (err) {
      console.error('Failed to start analysis:', err);
      setError('Failed to start analysis. Please try again.');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleStartAnalysis();
    }
  };

  if (sessionStarted && currentSessionId) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          {/* Session Header */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Analysis Session
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Session ID: {currentSessionId}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Download Analysis">
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Analysis">
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View History">
                  <IconButton size="small" onClick={() => navigate('/dashboard')}>
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>

          {/* Chat Interface */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {userSession && (
              <ChatInterface 
                userSession={userSession} 
                onBackToSession={() => navigate('/dashboard')} 
              />
            )}
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Start New Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Describe what you'd like to analyze and our AI agent will provide comprehensive insights.
          </Typography>
        </Box>

        {/* Demo Alert */}
        {demoQuery && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#3b82f6' }
            }}
          >
            <Typography variant="body2">
              <strong>Demo Mode:</strong> You're trying a sample analysis query.
            </Typography>
          </Alert>
        )}

        {/* Query Input */}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              What would you like to analyze?
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Perform a comprehensive SWOT analysis for Tesla Inc., including their competitive position in the electric vehicle market..."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Press Ctrl+Enter to start analysis
              </Typography>
              
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleStartAnalysis}
                disabled={!query.trim() || loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5855eb, #2563eb)',
                  }
                }}
              >
                {loading ? 'Starting...' : 'Start Analysis'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {/* Example Queries */}
        <Card
          sx={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Example Queries
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                'Perform a SWOT analysis for Apple Inc.',
                'Analyze the competitive landscape of the streaming services market',
                'What are the market opportunities for electric vehicles in Europe?',
                'Compare the business strategies of Amazon vs. Microsoft',
                'Evaluate the strengths and weaknesses of remote work adoption'
              ].map((example, index) => (
                <Chip
                  key={index}
                  label={example}
                  onClick={() => setQuery(example)}
                  sx={{
                    justifyContent: 'flex-start',
                    height: 'auto',
                    py: 1,
                    px: 2,
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      textAlign: 'left'
                    },
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                    }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AnalysisPage;
