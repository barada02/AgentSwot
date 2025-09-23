import React, { useState } from 'react';
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
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { useBrowserStorage } from '../hooks/useBrowserStorage';
import type { ChatMessage, UserSession } from '../types';

const BrowserStorageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [storageStats, setStorageStats] = useState<any>(null);
  
  const {
    isInitialized,
    isLoading,
    error,
    createSession,
    saveMessage,
    getSession,
    getSessionMessages,
    getAllSessions,
    exportSession,
    clearAllData,
    getStorageStats,
  } = useBrowserStorage();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
    console.log(result);
  };

  const updateStats = () => {
    const stats = getStorageStats();
    setStorageStats(stats);
  };

  const runBasicTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Running basic storage tests...');
    
    try {
      addResult('🟡 Starting comprehensive storage test...');
      
      // Test 1: Create session
      const sessionData: UserSession = {
        sessionId: `test-session-${Date.now()}`,
        userId: 'test-user-123',
        appName: 'multi_tool_agent',
      };
      
      setCurrentTest('Creating test session...');
      addResult('🔵 Creating test session...');
      const session = await createSession(sessionData);
      addResult(`✅ Session created: ${session.sessionId}`);
      
      // Test 2: Save multiple messages
      setCurrentTest('Saving test messages...');
      const testMessages: ChatMessage[] = [
        {
          id: `msg-user-${Date.now()}`,
          role: 'user',
          content: 'Can you analyze my business strengths and weaknesses?',
          timestamp: Date.now(),
        },
        {
          id: `msg-assistant-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I\'d be happy to help you analyze your business. Let me create a comprehensive SWOT analysis for you.',
          timestamp: Date.now() + 1000,
        },
      ];
      
      for (const message of testMessages) {
        addResult(`🔵 Saving ${message.role} message...`);
        await saveMessage(sessionData.sessionId, message);
        addResult(`✅ ${message.role} message saved`);
      }
      
      // Test 3: Retrieve session
      setCurrentTest('Retrieving session data...');
      addResult('🔵 Retrieving session...');
      const retrievedSession = await getSession(sessionData.sessionId);
      addResult(`✅ Session retrieved: ${retrievedSession ? 'Found' : 'Not found'}`);
      if (retrievedSession) {
        addResult(`   📊 Messages: ${retrievedSession.messageCount}, Status: ${retrievedSession.status}`);
      }
      
      // Test 4: Get messages
      setCurrentTest('Retrieving messages...');
      addResult('🔵 Retrieving messages...');
      const messages = await getSessionMessages(sessionData.sessionId);
      addResult(`✅ Messages retrieved: ${messages.length} messages`);
      
      // Test 5: Get all sessions
      setCurrentTest('Getting all sessions...');
      addResult('🔵 Getting all sessions...');
      const allSessions = await getAllSessions();
      addResult(`✅ All sessions: ${allSessions.length} total sessions`);
      
      // Test 6: Export session
      setCurrentTest('Exporting session...');
      addResult('🔵 Testing export functionality...');
      const exportData = await exportSession(sessionData.sessionId);
      addResult(`✅ Export successful: ${exportData.messages.length} messages exported`);
      
      addResult('🟢 All tests completed successfully!');
      updateStats();
      
    } catch (err) {
      addResult(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all storage data? This cannot be undone.')) {
      try {
        await clearAllData();
        setTestResults([]);
        setStorageStats(null);
        addResult('✅ All data cleared successfully');
        updateStats();
      } catch (err) {
        addResult(`❌ Failed to clear data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const downloadTestResults = () => {
    const content = testResults.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-test-results-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    if (isInitialized) {
      updateStats();
    }
  }, [isInitialized]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🏪 Browser Storage Test Suite
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Testing localStorage-based storage system for session management
      </Typography>

      {/* Status indicators */}
      <Box sx={{ mb: 3 }}>
        <Chip 
          label={isInitialized ? 'Storage Ready' : 'Initializing...'} 
          color={isInitialized ? 'success' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip 
          label={isLoading ? 'Loading' : 'Idle'} 
          color={isLoading ? 'warning' : 'success'}
          sx={{ mr: 1 }}
        />
        {error && (
          <Chip 
            label="Error" 
            color="error"
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
          onClick={runBasicTest}
          disabled={!isInitialized || isRunning || isLoading}
        >
          {isRunning ? 'Running Tests...' : 'Run Storage Tests'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StatsIcon />}
          onClick={updateStats}
          disabled={!isInitialized}
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
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClearData}
          disabled={!isInitialized}
        >
          Clear All Data
        </Button>
      </Box>

      {/* Storage stats */}
      {storageStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Storage Statistics
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
                <Typography variant="body2" color="text.secondary">Storage Used</Typography>
                <Typography variant="h6">{storageStats.storageUsed}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Last Activity</Typography>
                <Typography variant="body2">
                  {storageStats.lastActivity ? new Date(storageStats.lastActivity).toLocaleString() : 'None'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Test results */}
      {testResults.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              📝 Test Results:
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

export default BrowserStorageTest;