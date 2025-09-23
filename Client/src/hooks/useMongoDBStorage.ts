import { useState, useEffect, useCallback } from 'react';
import mongoDBApiService from '../services/mongoDBApi';
import type { ChatMessage, InfographicData, UserSession } from '../types';
import type { StoredSession, StoredMessage, StoredInfographic } from '../services/mongoDBApi';

export const useMongoDBStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await mongoDBApiService.initialize();
        setIsInitialized(true);
        console.log('✅ MongoDB API service initialized');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MongoDB API service';
        setError(errorMessage);
        console.error('❌ MongoDB API initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const createSession = useCallback(async (sessionData: UserSession): Promise<StoredSession> => {
    try {
      setError(null);
      return await mongoDBApiService.createSession(sessionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const saveMessage = useCallback(async (
    sessionId: string, 
    message: ChatMessage, 
    infographics?: InfographicData[]
  ): Promise<StoredMessage> => {
    try {
      setError(null);
      return await mongoDBApiService.saveMessage(sessionId, message, infographics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<StoredSession | null> => {
    try {
      setError(null);
      return await mongoDBApiService.getSession(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSessionMessages = useCallback(async (sessionId: string): Promise<StoredMessage[]> => {
    try {
      setError(null);
      return await mongoDBApiService.getSessionMessages(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAllSessions = useCallback(async (userId?: string): Promise<StoredSession[]> => {
    try {
      setError(null);
      return await mongoDBApiService.getAllSessions(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all sessions';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const saveInfographics = useCallback(async (
    sessionId: string, 
    messageId: string, 
    infographics: InfographicData[]
  ): Promise<StoredInfographic[]> => {
    try {
      setError(null);
      return await mongoDBApiService.saveInfographics(sessionId, messageId, infographics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save infographics';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSessionInfographics = useCallback(async (sessionId: string): Promise<StoredInfographic[]> => {
    try {
      setError(null);
      return await mongoDBApiService.getSessionInfographics(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get infographics';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const exportSession = useCallback(async (sessionId: string): Promise<any> => {
    try {
      setError(null);
      return await mongoDBApiService.exportSession(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getStorageStats = useCallback(async (): Promise<any> => {
    try {
      setError(null);
      return await mongoDBApiService.getStorageStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get storage stats';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const searchSessions = useCallback(async (query: string, filters?: any): Promise<StoredSession[]> => {
    try {
      setError(null);
      return await mongoDBApiService.searchSessions(query, filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search sessions';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    createSession,
    saveMessage,
    getSession,
    getSessionMessages,
    getAllSessions,
    saveInfographics,
    getSessionInfographics,
    exportSession,
    getStorageStats,
    searchSessions,
  };
};