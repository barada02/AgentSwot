/**
 * Unified API hook for AgentSwot
 * Communicates only with Storage Server (which handles ADK integration)
 * New architecture: React → Storage Server → ADK Server
 * Now includes user authentication
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { UserSession } from '../types';

// Storage Server Configuration
const STORAGE_API_URL = import.meta.env.VITE_STORAGE_API_URL || 'http://127.0.0.1:8001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '120000');

// Authentication Types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  sessionCount: number;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  tokenType: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API Response Types
export interface StorageApiSessionResponse {
  sessionId: string;
  userId: string;
  appName: string;
  status: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  hasInfographics: boolean;
}

export interface StorageApiMessageResponse {
  success: boolean;
  messageId: string;
  content: string;
  infographics: Array<{
    id: string;
    contentType: string;
    htmlCode: string;
  }>;
  timestamp: number;
  tokens?: number;
}

export interface StorageApiConversationResponse {
  sessionId: string;
  messages: Array<{
    messageId: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokens?: number;
    infographicsCount: number;
    groundingChunksCount: number;
  }>;
  totalMessages: number;
  hasInfographics: boolean;
}

export interface StorageApiHealthResponse {
  status: 'healthy' | 'degraded';
  mongodb: {
    healthy: boolean;
    database: string;
    collections: {
      sessions: number;
      conversations: number;
      infographics: number;
      grounding_chunks: number;
    };
  };
  adk: {
    healthy: boolean;
    url: string;
  };
}

// Token management helpers
const getAuthToken = (): string | null => {
  return localStorage.getItem('agentswot_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('agentswot_token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('agentswot_token');
};

// Create axios instance with auth interceptor
const createApiClient = () => {
  const client = axios.create({
    baseURL: STORAGE_API_URL,
    timeout: API_TIMEOUT,
  });

  // Request interceptor to add auth token
  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

export const useStorageApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = createApiClient();

  // ========================
  // AUTHENTICATION METHODS
  // ========================

  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/register', userData);
      const authData: AuthResponse = response.data;

      // Store token
      setAuthToken(authData.token);
      toast.success(`Welcome ${authData.user.name}! Registration successful.`);

      return authData;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', credentials);
      const authData: AuthResponse = response.data;

      // Store token
      setAuthToken(authData.token);
      toast.success(`Welcome back ${authData.user.name}!`);

      return authData;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    removeAuthToken();
    toast.info('Logged out successfully');
  }, []);

  const getCurrentUser = useCallback(async (): Promise<AuthUser> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get user information';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return getAuthToken() !== null;
  }, []);

  // ========================
  // STORAGE API METHODS
  // ========================

  // Health check - checks both MongoDB and ADK
  const checkHealth = useCallback(async (): Promise<StorageApiHealthResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/health');
      
      if (response.data.adk.healthy) {
        toast.success('All systems operational');
      } else {
        toast.warning('ADK server not available');
      }
      
      return response.data;
    } catch (err) {
      const message = 'Failed to connect to storage server';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create session - Storage server handles ADK integration
  const createSession = useCallback(async (userSession: UserSession): Promise<StorageApiSessionResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/sessions', {
        userId: userSession.userId,
        sessionId: userSession.sessionId,
        appName: userSession.appName
      });
      
      toast.success('Session created successfully');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message - Storage server handles ADK communication and storage
  const sendMessage = useCallback(async (
    sessionId: string, 
    userId: string, 
    message: string,
    appName: string = 'multi_tool_agent'
  ): Promise<StorageApiMessageResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/chat', {
        sessionId,
        userId,
        appName,
        message
      });
      
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to send message';
      setError(message);
      
      if (err.code === 'ECONNABORTED') {
        toast.error('Request timeout: The agent is taking longer than expected. Please try again.');
      } else {
        toast.error(message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session details
  const getSession = useCallback(async (sessionId: string): Promise<StorageApiSessionResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get conversation history
  const getConversation = useCallback(async (sessionId: string): Promise<StorageApiConversationResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/conversations/${sessionId}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get conversation';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session infographics
  const getInfographics = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/sessions/${sessionId}/infographics`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get infographics';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get grounding chunks
  const getGroundingChunks = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/sessions/${sessionId}/grounding`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get grounding chunks';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all sessions for the authenticated user
  const getAllSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/sessions');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get sessions';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.delete(`/sessions/${sessionId}`);
      toast.success('Session deleted successfully');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export session
  const exportSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/export/${sessionId}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to export session';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get system statistics
  const getStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to get stats';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Authentication
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    
    // Health & Setup
    checkHealth,
    
    // Session Management
    createSession,
    getSession,
    getAllSessions,
    deleteSession,
    
    // Messaging
    sendMessage,
    getConversation,
    
    // Data Retrieval
    getInfographics,
    getGroundingChunks,
    
    // Utilities
    exportSession,
    getStats,
  };
};