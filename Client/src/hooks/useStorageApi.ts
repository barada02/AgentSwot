/**
 * Unified API hook for AgentSwot
 * Communicates only with Storage Server (which handles ADK integration)
 * New architecture: React → Storage Server → ADK Server
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { UserSession } from '../types';

// Storage Server Configuration
const STORAGE_API_URL = import.meta.env.VITE_STORAGE_API_URL || 'http://127.0.0.1:8001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '120000');

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

export const useStorageApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Health check - checks both MongoDB and ADK
  const checkHealth = useCallback(async (): Promise<StorageApiHealthResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${STORAGE_API_URL}/health`);
      
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
      
      const response = await axios.post(`${STORAGE_API_URL}/sessions`, {
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
      
      const response = await axios.post(`${STORAGE_API_URL}/chat`, {
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
      
      const response = await axios.get(`${STORAGE_API_URL}/sessions/${sessionId}`);
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
      
      const response = await axios.get(`${STORAGE_API_URL}/conversations/${sessionId}`);
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
      
      const response = await axios.get(`${STORAGE_API_URL}/sessions/${sessionId}/infographics`);
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
      
      const response = await axios.get(`${STORAGE_API_URL}/sessions/${sessionId}/grounding`);
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

  // Get all sessions for a user
  const getAllSessions = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = userId 
        ? `${STORAGE_API_URL}/sessions?userId=${userId}`
        : `${STORAGE_API_URL}/sessions`;
      
      const response = await axios.get(url);
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
      
      const response = await axios.delete(`${STORAGE_API_URL}/sessions/${sessionId}`);
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
      
      const response = await axios.get(`${STORAGE_API_URL}/export/${sessionId}`);
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
      
      const response = await axios.get(`${STORAGE_API_URL}/stats`);
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