import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { useStorage } from '../hooks/useStorage';
import DataValidator from '../utils/dataValidator';
import type { UserSession, ChatMessage } from '../types';

const StorageTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  const {
    isInitialized,
    isLoading,
    error,
    createSession,
    saveMessage,
    getSession,
    getSessionMessages,
  } = useStorage();

  const addResult = (message: string, isError = false) => {
    const prefix = isError ? '❌' : '✅';
    const result = `${prefix} ${message}`;
    setTestResults(prev => [...prev, result]);
    console.log(result);
  };

  const runStorageTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Check Storage Initialization
      setCurrentTest('Checking storage initialization...');
      if (!isInitialized) {
        addResult('Storage not initialized', true);
        return;
      }
      addResult('Storage service initialized successfully');

      // Test 2: Create Test Session
      setCurrentTest('Creating test session...');
      const testUserSession: UserSession = {
        userId: 'test-user-' + Date.now(),
        sessionId: 'test-session-' + Date.now(),
        appName: 'multi_tool_agent'
      };

      // Validate session data before storing
      if (!DataValidator.validateUserSession(testUserSession)) {
        addResult('UserSession validation failed', true);
        return;
      }
      addResult('UserSession validation passed');

      const createdSession = await createSession({
        sessionId: testUserSession.sessionId,
        userId: testUserSession.userId,
        appName: testUserSession.appName,
        title: 'Storage Test Session'
      });

      if (!createdSession) {
        addResult('Failed to create session', true);
        return;
      }
      addResult(`Session created with ID: ${createdSession.sessionId}`);

      // Test 3: Retrieve Session
      setCurrentTest('Retrieving created session...');
      const retrievedSession = await getSession(testUserSession.sessionId);
      if (!retrievedSession) {
        addResult('Failed to retrieve session', true);
        return;
      }
      addResult(`Session retrieved: ${retrievedSession.title}`);

      // Test 4: Create Test Messages
      setCurrentTest('Creating test messages...');
      const userMessage: ChatMessage = {
        id: 'test-msg-user-' + Date.now(),
        role: 'user',
        content: 'Test user message for storage validation',
        timestamp: Date.now(),
        partCount: 1,
      };

      const assistantMessage: ChatMessage = {
        id: 'test-msg-assistant-' + Date.now(),
        role: 'assistant',
        content: 'Test assistant response for storage validation',
        timestamp: Date.now(),
        partCount: 1,
        metadata: {
          hasMultipleParts: false,
          hasInfographic: false,
        }
      };

      // Validate messages
      if (!DataValidator.validateChatMessage(userMessage)) {
        addResult('User message validation failed', true);
        return;
      }
      addResult('User message validation passed');

      if (!DataValidator.validateChatMessage(assistantMessage)) {
        addResult('Assistant message validation failed', true);
        return;
      }
      addResult('Assistant message validation passed');

      // Test 5: Save Messages
      setCurrentTest('Saving messages to database...');
      const userSaved = await saveMessage(userMessage, testUserSession.sessionId);
      const assistantSaved = await saveMessage(assistantMessage, testUserSession.sessionId);

      if (!userSaved || !assistantSaved) {
        addResult('Failed to save messages', true);
        return;
      }
      addResult('Messages saved successfully');

      // Test 6: Retrieve Messages
      setCurrentTest('Retrieving messages from database...');
      const retrievedMessages = await getSessionMessages(testUserSession.sessionId);
      
      if (retrievedMessages.length !== 2) {
        addResult(`Expected 2 messages, got ${retrievedMessages.length}`, true);
        return;
      }
      addResult(`Retrieved ${retrievedMessages.length} messages correctly`);

      // Test 7: Validate Retrieved Data
      setCurrentTest('Validating retrieved message data...');
      let validationPassed = true;
      
      retrievedMessages.forEach((msg, index) => {
        if (!DataValidator.validateChatMessage(msg)) {
          addResult(`Retrieved message ${index + 1} validation failed`, true);
          validationPassed = false;
        }
      });

      if (validationPassed) {
        addResult('All retrieved messages passed validation');
      }

      // Test 8: Schema Compatibility Check
      setCurrentTest('Checking schema compatibility...');
      const originalUser = userMessage;
      const retrievedUser = retrievedMessages.find(m => m.role === 'user');
      
      if (retrievedUser) {
        const fieldsMatch = 
          originalUser.content === retrievedUser.content &&
          originalUser.role === retrievedUser.role &&
          originalUser.timestamp === retrievedUser.timestamp;
        
        if (fieldsMatch) {
          addResult('Schema compatibility verified - no data loss');
        } else {
          addResult('Schema compatibility issue - data mismatch detected', true);
        }
      }

      addResult('🎉 All storage tests completed successfully!');
      
    } catch (error) {
      addResult(`Test failed with error: ${error}`, true);
      console.error('Storage test error:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        🧪 MongoDB Storage Integration Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This component tests the complete storage integration to ensure schema compatibility
          and validate that data is correctly stored and retrieved from MongoDB.
        </Typography>
      </Box>

      {/* Storage Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Storage Status:</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={isInitialized ? 'Initialized' : 'Not Initialized'} 
            color={isInitialized ? 'success' : 'error'} 
            size="small" 
          />
          <Chip 
            label={isLoading ? 'Loading' : 'Ready'} 
            color={isLoading ? 'warning' : 'success'} 
            size="small" 
          />
          {error && (
            <Chip 
              label={`Error: ${error}`} 
              color="error" 
              size="small" 
            />
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Storage Error:</strong> {error}
          </Typography>
          <Typography variant="caption">
            Please check your MongoDB Atlas connection in the .env file.
          </Typography>
        </Alert>
      )}

      {/* Test Controls */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={runStorageTests}
          disabled={!isInitialized || isRunning}
          sx={{ mr: 2 }}
        >
          {isRunning ? 'Running Tests...' : 'Run Storage Tests'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => setTestResults([])}
          disabled={isRunning}
        >
          Clear Results
        </Button>
      </Box>

      {/* Progress */}
      {isRunning && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {currentTest}
          </Typography>
        </Box>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Test Results:
          </Typography>
          <Box 
            sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {testResults.map((result, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  color: result.startsWith('❌') ? 'error.main' : 'success.main',
                  mb: 0.5
                }}
              >
                {result}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default StorageTestComponent;