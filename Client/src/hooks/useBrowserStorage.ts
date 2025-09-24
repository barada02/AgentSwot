import { useState, useEffect, useCallback } from 'react';
import browserStorageService from '../services/browserStorage';
import type { ChatMessage, InfographicData, UserSession } from '../types';
import type { StoredSession, StoredMessage } from '../services/browserStorage';

export const useBrowserStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await browserStorageService.initialize();
        setIsInitialized(true);
        console.log('✅ Browser storage service initialized');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize storage';
        setError(errorMessage);
        console.error('❌ Storage initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const createSession = useCallback(async (sessionData: UserSession): Promise<StoredSession> => {
    try {
      setError(null);
      return await browserStorageService.createSession(sessionData);
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
      return await browserStorageService.saveMessage(sessionId, message, infographics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<StoredSession | null> => {
    try {
      setError(null);
      return await browserStorageService.getSession(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSessionMessages = useCallback(async (sessionId: string): Promise<StoredMessage[]> => {
    try {
      setError(null);
      return await browserStorageService.getSessionMessages(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAllSessions = useCallback(async (): Promise<StoredSession[]> => {
    try {
      setError(null);
      return await browserStorageService.getAllSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all sessions';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const exportSession = useCallback(async (sessionId: string): Promise<any> => {
    try {
      setError(null);
      return await browserStorageService.exportSession(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await browserStorageService.clearAllData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getStorageStats = useCallback(() => {
    try {
      return browserStorageService.getStorageStats();
    } catch (err) {
      console.error('Failed to get storage stats:', err);
      return null;
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
    exportSession,
    clearAllData,
    getStorageStats,
  };
};