import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storage';
import type { ChatMessage, InfographicData, RunResponse } from '../types';
import type { 
  StoredSession, 
  SessionCreateData, 
  SessionUpdateData,
  SessionStats,
  SearchFilters,
  PaginationOptions,
  PaginatedResult
} from '../types/storage';

export const useStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await storageService.initialize();
        setIsInitialized(true);
        console.log('✅ Storage service initialized');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize storage';
        setError(errorMessage);
        console.error('❌ Storage initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeStorage();
    }
  }, [isInitialized]);

  // Session Management
  const createSession = useCallback(async (sessionData: SessionCreateData): Promise<StoredSession | null> => {
    if (!isInitialized) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const session = await storageService.createSession(sessionData);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getSession = useCallback(async (sessionId: string): Promise<StoredSession | null> => {
    if (!isInitialized) return null;
    
    try {
      return await storageService.getSession(sessionId);
    } catch (err) {
      console.error('Failed to get session:', err);
      return null;
    }
  }, [isInitialized]);

  const getUserSessions = useCallback(async (
    userId: string,
    filters?: SearchFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<StoredSession> | null> => {
    if (!isInitialized) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await storageService.getUserSessions(userId, filters, pagination);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sessions';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const updateSession = useCallback(async (sessionId: string, updates: SessionUpdateData): Promise<boolean> => {
    if (!isInitialized) return false;
    
    try {
      setError(null);
      await storageService.updateSession(sessionId, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      return false;
    }
  }, [isInitialized]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!isInitialized) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      await storageService.deleteSession(sessionId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Message Management
  const saveMessage = useCallback(async (message: ChatMessage, sessionId: string): Promise<boolean> => {
    if (!isInitialized) return false;
    
    try {
      await storageService.saveMessage(message, sessionId);
      return true;
    } catch (err) {
      console.error('Failed to save message:', err);
      return false;
    }
  }, [isInitialized]);

  const getSessionMessages = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    if (!isInitialized) return [];
    
    try {
      return await storageService.getSessionMessages(sessionId);
    } catch (err) {
      console.error('Failed to get session messages:', err);
      return [];
    }
  }, [isInitialized]);

  // Infographic Management
  const saveInfographics = useCallback(async (
    infographics: InfographicData[], 
    sessionId: string, 
    messageId: string
  ): Promise<boolean> => {
    if (!isInitialized) return false;
    
    try {
      await storageService.saveInfographics(infographics, sessionId, messageId);
      return true;
    } catch (err) {
      console.error('Failed to save infographics:', err);
      return false;
    }
  }, [isInitialized]);

  const getSessionInfographics = useCallback(async (sessionId: string): Promise<InfographicData[]> => {
    if (!isInitialized) return [];
    
    try {
      return await storageService.getSessionInfographics(sessionId);
    } catch (err) {
      console.error('Failed to get session infographics:', err);
      return [];
    }
  }, [isInitialized]);

  // Utility Methods
  const getUserStats = useCallback(async (userId: string): Promise<SessionStats | null> => {
    if (!isInitialized) return null;
    
    try {
      return await storageService.getUserStats(userId);
    } catch (err) {
      console.error('Failed to get user stats:', err);
      return null;
    }
  }, [isInitialized]);

  // Integration Method - Main method for saving conversation data
  const saveConversationData = useCallback(async (
    userMessage: ChatMessage,
    agentResponses: RunResponse[],
    sessionId: string
  ): Promise<boolean> => {
    if (!isInitialized) return false;
    
    try {
      await storageService.saveConversationData(userMessage, agentResponses, sessionId);
      return true;
    } catch (err) {
      console.error('Failed to save conversation data:', err);
      return false;
    }
  }, [isInitialized]);

  // Restore session data - loads messages and infographics for existing session
  const restoreSession = useCallback(async (sessionId: string): Promise<{
    messages: ChatMessage[];
    infographics: InfographicData[];
    session: StoredSession | null;
  }> => {
    if (!isInitialized) {
      return { messages: [], infographics: [], session: null };
    }
    
    try {
      const [messages, infographics, session] = await Promise.all([
        storageService.getSessionMessages(sessionId),
        storageService.getSessionInfographics(sessionId),
        storageService.getSession(sessionId)
      ]);

      return { messages, infographics, session };
    } catch (err) {
      console.error('Failed to restore session:', err);
      return { messages: [], infographics: [], session: null };
    }
  }, [isInitialized]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Session Management
    createSession,
    getSession,
    getUserSessions,
    updateSession,
    deleteSession,
    
    // Message Management
    saveMessage,
    getSessionMessages,
    
    // Infographic Management
    saveInfographics,
    getSessionInfographics,
    
    // Utility
    getUserStats,
    
    // Main Integration Methods
    saveConversationData,
    restoreSession,
  };
};