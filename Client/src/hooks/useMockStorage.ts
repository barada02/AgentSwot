import { useState, useEffect, useCallback } from 'react';
import mockStorageService from '../services/mockStorage';
import type { ChatMessage } from '../types';

export const useMockStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await mockStorageService.initialize();
        setIsInitialized(true);
        console.log('✅ Mock storage service initialized');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize mock storage';
        setError(errorMessage);
        console.error('❌ Mock storage initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const createSession = useCallback(async (sessionData: any) => {
    try {
      setError(null);
      return await mockStorageService.createSession(sessionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const saveMessage = useCallback(async (sessionId: string, message: ChatMessage) => {
    try {
      setError(null);
      return await mockStorageService.saveMessage(sessionId, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      return await mockStorageService.getSession(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSessionMessages = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      return await mockStorageService.getSessionMessages(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
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
  };
};