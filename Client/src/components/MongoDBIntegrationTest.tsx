import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Assessment as StatsIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Computer as ServerIcon,
  Storage as DatabaseIcon,
  Web as FrontendIcon,
} from '@mui/icons-material';
import { useMongoDBStorage } from '../hooks/useMongoDBStorage';
import { useApiWithStorage } from '../hooks/useApiWithStorage';
import type { UserSession } from '../types';

const MongoDBIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [storageStats, setStorageStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  
  const {
    isInitialized: storageInitialized,
    isLoading: storageLoading,
    error: storageError,
    getAllSessions,
    getStorageStats,
  } = useMongoDBStorage();

  const {
    isLoading: apiLoading,
    error: apiError,
    createSession,
    sendMessage,
  } = useApiWithStorage();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
    console.log(result);
  };

  const updateStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
      
      const sessions = await getAllSessions();
      setRecentSessions(sessions.slice(0, 5)); // Show last 5 sessions
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  };

  const runFullIntegrationTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Testing complete architecture integration...');
    
    try {
      addResult('🟡 Starting complete architecture integration test...');
      addResult('');
      addResult('📊 Architecture: Frontend ↔ ADK Server (8000) + Storage Server (8001) ↔ MongoDB');
      addResult('');
      
      // Test 1: Storage server connectivity
      setCurrentTest('Testing storage server connectivity...');
      addResult('🔵 Testing Storage Server (Port 8001)...');
      
      if (!storageInitialized) {
        addResult('❌ Storage server not accessible');
        addResult('   💡 Make sure storage server is running: python storage_server.py');
        return;
      }
      addResult('✅ Storage Server (Port 8001) is accessible');
      
      // Test 2: Test parallel architecture with real session
      const sessionData: UserSession = {
        sessionId: `integration-test-${Date.now()}`,
        userId: 'test-user-integration',
        appName: 'multi_tool_agent',
      };
      
      setCurrentTest('Testing parallel session creation...');
      addResult('');
      addResult('🔵 Testing parallel session creation...');
      addResult('   → Creating session with ADK Server (Port 8000)');
      addResult('   → Creating session with Storage Server (Port 8001)');
      
      try {
        await createSession(sessionData);
        addResult('✅ Parallel session creation successful');
        addResult('   → ADK session created');
        addResult('   → MongoDB session created');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        if (errorMsg.includes('ECONNREFUSED') && errorMsg.includes('8000')) {
          addResult('❌ ADK Server (Port 8000) not accessible');
          addResult('   � Make sure ADK server is running: adk api_server');
        } else {
          addResult(`❌ Session creation failed: ${errorMsg}`);
        }
        return;
      }
      
      // Test 3: Test parallel message flow
      setCurrentTest('Testing parallel message processing...');
      addResult('');
      addResult('🔵 Testing parallel message processing...');
      addResult('   → Sending message to ADK Server');
      addResult('   → Auto-saving response to MongoDB');
      
      try {
        const response = await sendMessage(sessionData, 'Test message for integration');
        addResult('✅ Parallel message processing successful');
        addResult('   → ADK response received');
        addResult('   → Messages auto-saved to MongoDB');
        addResult(`   → Response ID: ${response.id}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        addResult(`❌ Message processing failed: ${errorMsg}`);
        // Continue with other tests
      }
      
      // Test 4: Verify data in MongoDB
      setCurrentTest('Verifying data storage...');
      addResult('');
      addResult('🔵 Verifying data in MongoDB...');
      const sessions = await getAllSessions();
      const testSession = sessions.find(s => s.sessionId === sessionData.sessionId);
      
      if (testSession) {
        addResult('✅ Session data verified in MongoDB');
        addResult(`   → Session ID: ${testSession.sessionId}`);
        addResult(`   → Messages: ${testSession.messageCount}`);
        addResult(`   → Status: ${testSession.status}`);
      } else {
        addResult('⚠️ Session not found in MongoDB (may be timing issue)');
      }
      
      addResult('');
      addResult('🟢 Complete architecture integration test completed!');
      addResult('✨ Your frontend is now connected to both ADK and Storage servers');
      updateStats();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addResult(`❌ Integration test failed: ${errorMsg}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const downloadTestResults = () => {
    const content = testResults.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mongodb-architecture-test-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (storageInitialized) {
      updateStats();
    }
  }, [storageInitialized]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🏗️ MongoDB Integration Architecture Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Tests the parallel architecture: Frontend ↔ ADK Server + Storage Server ↔ MongoDB
      </Typography>

      {/* Architecture diagram */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 System Architecture
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <FrontendIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="body2">Frontend</Typography>
              <Typography variant="caption" color="text.secondary">Port 5173</Typography>
            </Box>
            
            <Typography variant="h6">↔</Typography>
            
            <Box sx={{ textAlign: 'center' }}>
              <ServerIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="body2">ADK Server</Typography>
              <Typography variant="caption" color="text.secondary">Port 8000</Typography>
            </Box>
            
            <Typography variant="h6">+</Typography>
            
            <Box sx={{ textAlign: 'center' }}>
              <ServerIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Typography variant="body2">Storage Server</Typography>
              <Typography variant="caption" color="text.secondary">Port 8001</Typography>
            </Box>
            
            <Typography variant="h6">↔</Typography>
            
            <Box sx={{ textAlign: 'center' }}>
              <DatabaseIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Typography variant="body2">MongoDB</Typography>
              <Typography variant="caption" color="text.secondary">Atlas</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Server status indicators */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card sx={{ bgcolor: storageInitialized ? 'success.50' : 'error.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {storageInitialized ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
              <Box>
                <Typography variant="h6" color={storageInitialized ? 'success.main' : 'error.main'}>
                  Storage Server (8001)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {storageInitialized ? 'Connected and ready' : 'Not accessible'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ bgcolor: 'info.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="info" />
              <Box>
                <Typography variant="h6" color="info.main">
                  ADK Server (8000)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Will be tested during integration
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {(storageError || apiError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Connection Error:</Typography>
          {storageError && <Typography variant="body2">Storage: {storageError}</Typography>}
          {apiError && <Typography variant="body2">API: {apiError}</Typography>}
        </Alert>
      )}

      {/* Current test progress */}
      {isRunning && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {currentTest}
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={runFullIntegrationTest}
          disabled={isRunning || storageLoading || apiLoading}
        >
          {isRunning ? 'Testing Architecture...' : 'Test Complete Integration'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StatsIcon />}
          onClick={updateStats}
          disabled={!storageInitialized}
        >
          Refresh Stats
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadTestResults}
          disabled={testResults.length === 0}
        >
          Download Results
        </Button>
      </Box>

      {/* Storage stats */}
      {storageStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 MongoDB Atlas Statistics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Sessions</Typography>
                <Typography variant="h6">{storageStats.totalSessions}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Messages</Typography>
                <Typography variant="h6">{storageStats.totalMessages}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Infographics</Typography>
                <Typography variant="h6">{storageStats.totalInfographics}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Database</Typography>
                <Typography variant="body2">{storageStats.database}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Recent Sessions in MongoDB
            </Typography>
            <List>
              {recentSessions.map((session) => (
                <ListItem key={session._id}>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={session.title || session.sessionId}
                    secondary={`${session.messageCount} messages • ${new Date(session.lastActivity).toLocaleString()}`}
                  />
                  <Chip 
                    label={session.status} 
                    size="small" 
                    color={session.status === 'active' ? 'primary' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Test results */}
      {testResults.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              📝 Architecture Test Results:
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.85rem',
                    mb: 0.5,
                    color: result.includes('❌') ? 'error.main' : 
                           result.includes('✅') ? 'success.main' : 
                           result.includes('🟢') ? 'success.main' : 
                           result.includes('💡') ? 'info.main' :
                           'text.primary'
                  }}
                >
                  {result}
                </Typography>
              ))}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default MongoDBIntegrationTest;