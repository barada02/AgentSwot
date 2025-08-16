import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { useApi } from '../hooks/useApi';
import type { UserSession } from '../types';

const schema = yup.object({
  userId: yup.string().required('User ID is required'),
  sessionId: yup.string().required('Session ID is required'),
});

interface SessionFormData {
  userId: string;
  sessionId: string;
}

interface SessionFormProps {
  onSessionCreated: (session: UserSession) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ onSessionCreated }) => {
  const [availableApps, setAvailableApps] = useState<string[]>([]);
  const { loading, apiConnected, checkApiConnection, createSession } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SessionFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const initializeApi = async () => {
      try {
        const apps = await checkApiConnection();
        setAvailableApps(apps);
      } catch (error) {
        console.error('Failed to connect to API:', error);
      }
    };

    initializeApi();
  }, [checkApiConnection]);

  const generateSessionId = () => {
    const sessionId = `sess_${uuidv4().substring(0, 8)}`;
    setValue('sessionId', sessionId);
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      const userSession: UserSession = {
        userId: data.userId,
        sessionId: data.sessionId,
        appName: 'multi_tool_agent', // Fixed app name for SWOT analysis
      };

      await createSession(userSession);
      onSessionCreated(userSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Agent SWOT Analysis
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Create a session to start analyzing your business or product
        </Typography>

        {apiConnected === false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Unable to connect to the agent API. Please make sure the server is running on http://127.0.0.1:8000
            <br />
            <strong>Endpoint being tested:</strong> http://127.0.0.1:8000/list-apps
          </Alert>
        )}

        {apiConnected === true && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Connected to agent API successfully (http://127.0.0.1:8000/list-apps)
          </Alert>
        )}

        {availableApps.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Apps:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableApps.map((app) => (
                  <Chip 
                    key={app} 
                    label={app} 
                    color={app === 'multi_tool_agent' ? 'primary' : 'default'}
                    variant={app === 'multi_tool_agent' ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="User ID"
              placeholder="Enter your user ID (e.g., john_doe)"
              {...register('userId')}
              error={!!errors.userId}
              helperText={errors.userId?.message}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Session ID"
              placeholder="Enter session ID or generate one"
              {...register('sessionId')}
              error={!!errors.sessionId}
              helperText={errors.sessionId?.message}
              disabled={loading}
            />
            <Button
              variant="outlined"
              onClick={generateSessionId}
              disabled={loading}
              sx={{ minWidth: 'max-content', height: '56px' }}
            >
              Generate
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || apiConnected === false}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Session & Start Analysis'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SessionForm;
