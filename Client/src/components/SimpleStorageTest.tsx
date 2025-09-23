import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { useMockStorage } from '../hooks/useMockStorage';
import type { ChatMessage } from '../types';

const SimpleStorageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const {
    isInitialized,
    isLoading,
    error,
    createSession,
    saveMessage,
    getSession,
    getSessionMessages,
  } = useMockStorage();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
    console.log(result);
  };

  const runBasicTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🟡 Starting basic storage test...');
      
      // Test 1: Create session
      const sessionData = {
        sessionId: `test-session-${Date.now()}`,
        userId: 'test-user',
        appName: 'multi_tool_agent',
      };
      
      addResult('🔵 Creating test session...');
      const session = await createSession(sessionData);
      addResult(`✅ Session created: ${session._id}`);
      
      // Test 2: Save message
      const testMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: 'Test message for storage',
        timestamp: Date.now(),
      };
      
      addResult('🔵 Saving test message...');
      await saveMessage(sessionData.sessionId, testMessage);
      addResult('✅ Message saved successfully');
      
      // Test 3: Retrieve session
      addResult('🔵 Retrieving session...');
      const retrievedSession = await getSession(sessionData.sessionId);
      addResult(`✅ Session retrieved: ${retrievedSession ? 'Found' : 'Not found'}`);
      
      // Test 4: Get messages
      addResult('🔵 Retrieving messages...');
      const messages = await getSessionMessages(sessionData.sessionId);
      addResult(`✅ Messages retrieved: ${messages.length} messages`);
      
      addResult('🟢 All tests completed successfully!');
      
    } catch (err) {
      addResult(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Simple Storage Test (Mock)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={isInitialized ? 'Initialized' : 'Not Initialized'} 
          color={isInitialized ? 'success' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip 
          label={isLoading ? 'Loading' : 'Ready'} 
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

      <Button
        variant="contained"
        onClick={runBasicTest}
        disabled={!isInitialized || isRunning || isLoading}
        sx={{ mb: 2 }}
      >
        {isRunning ? 'Running Tests...' : 'Run Basic Storage Test'}
      </Button>

      {testResults.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              Test Results:
            </Typography>
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
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SimpleStorageTest;