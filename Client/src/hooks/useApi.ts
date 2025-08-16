import { useState, useCallback } from 'react';
import { apiService } from '../api/endpoints';
import type { SessionResponse, RunRequest, RunResponse, UserSession } from '../types';
import { toast } from 'react-toastify';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Check API connection using the list-apps endpoint
  const checkApiConnection = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.checkApiStatus();
      setApiConnected(result.connected);
      if (result.connected) {
        return result.apps;
      } else {
        toast.error('Failed to connect to API at http://127.0.0.1:8000/list-apps');
        throw new Error('API not connected');
      }
    } catch (error) {
      setApiConnected(false);
      toast.error('Failed to connect to API at http://127.0.0.1:8000/list-apps');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create session
  const createSession = useCallback(async (userSession: UserSession): Promise<SessionResponse> => {
    try {
      setLoading(true);
      const session = await apiService.createSession(
        userSession.appName,
        userSession.userId,
        userSession.sessionId
      );
      toast.success('Session created successfully');
      return session;
    } catch (error) {
      toast.error('Failed to create session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session
  const getSession = useCallback(async (userSession: UserSession): Promise<SessionResponse> => {
    try {
      setLoading(true);
      const session = await apiService.getSession(
        userSession.appName,
        userSession.userId,
        userSession.sessionId
      );
      return session;
    } catch (error) {
      toast.error('Failed to retrieve session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message to agent
  const sendMessage = useCallback(async (request: RunRequest): Promise<RunResponse[]> => {
    try {
      setLoading(true);
      const response = await apiService.runAgent(request);
      return response;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout: The agent is taking longer than expected. Please try again.');
      } else {
        toast.error('Failed to send message to agent');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    apiConnected,
    checkApiConnection,
    createSession,
    getSession,
    sendMessage,
  };
};
